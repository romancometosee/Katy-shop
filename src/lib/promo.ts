// Механики акций: тексты плашек, правила и расчёт скидок в корзине.
// Один расчёт используется и в корзине, и при оформлении заказа, поэтому суммы всегда совпадают.
import type { Database, Product, Promotion, PromotionKind } from "./types";
import { isPromotionLive, promotionMatches } from "./catalog";

export const KIND_NAMES: Record<PromotionKind, string> = {
  percent: "Скидка %",
  bundle: "Товар в подарок (3 = 2)",
  gift: "Подарок при покупке",
  tiers: "Скидка растёт с суммой",
  delivery: "Бесплатная доставка",
};

export const kindOf = (p: Promotion): PromotionKind => p.kind ?? "percent";

const rubs = (n: number) => `${Math.round(n).toLocaleString("ru-RU")} ₽`;

function word(n: number, one: string, few: string, many: string) {
  const a = Math.abs(n) % 100, b = a % 10;
  if (a > 10 && a < 20) return many;
  if (b > 1 && b < 5) return few;
  if (b === 1) return one;
  return many;
}
export const goods = (n: number) => `${n} ${word(n, "товар", "товара", "товаров")}`;

/** Короткая плашка на карточке товара: «−20%», «3=2», «Подарок», «до −15%» */
export function promoBadge(p: Promotion): string {
  switch (kindOf(p)) {
    case "percent":
      return `−${p.discountPercent}%`;
    case "bundle":
      return `${p.buyQty ?? 3}=${p.payQty ?? 2}`;
    case "gift":
      return "Подарок";
    case "tiers":
      return `до −${Math.max(0, ...(p.tiers ?? []).map((t) => t.percent))}%`;
    case "delivery":
      return "Доставка 0 ₽";
  }
}

/** Крупная надпись на плитке акции */
export function promoHeadline(p: Promotion): string {
  const k = kindOf(p);
  if (k === "gift") return "Подарок";
  if (k === "delivery") return "0 ₽";
  return promoBadge(p);
}

/** Правила акции одной фразой — для страницы товара и страницы акции */
export function promoRules(p: Promotion): string {
  switch (kindOf(p)) {
    case "percent":
      return `Скидка ${p.discountPercent}% уже учтена в цене.`;
    case "bundle": {
      const b = p.buyQty ?? 3, pay = p.payQty ?? 2, free = b - pay;
      return `Возьмите ${goods(b)} из акции и платите за ${pay}: ${free > 1 ? `${free} самых дешёвых` : "самый дешёвый"} — в подарок. Скидка посчитается в корзине.`;
    }
    case "gift":
      return p.minTotal ? `При покупке товаров акции от ${rubs(p.minTotal)} — в подарок ${p.giftText || "приятный сюрприз"}.` : `К покупке любого товара акции — в подарок ${p.giftText || "приятный сюрприз"}.`;
    case "tiers":
      return `${[...(p.tiers ?? [])].sort((a, b) => a.from - b.from).map((t) => `от ${rubs(t.from)} — −${t.percent}%`).join(", ")}. Скидка посчитается в корзине.`;
    case "delivery":
      return p.minTotal ? `Бесплатная доставка при заказе от ${rubs(p.minTotal)}.` : "Бесплатная доставка любого заказа.";
  }
}

/** Живые акции, которые касаются товара, кроме обычной скидки % (она уже в цене) */
export function cartPromosFor(db: Database, product: Product): Promotion[] {
  return db.promotions.filter((p) => kindOf(p) !== "percent" && isPromotionLive(p) && promotionMatches(p, product));
}

export type QuoteItem = { productId: string; price: number; qty: number };
export type CartQuote = {
  /** скидки по акциям: «3=2 на гель-лаки: −690 ₽» */
  discounts: { promoId: string; title: string; amount: number }[];
  /** заработанные подарки */
  gifts: { promoId: string; title: string; text: string }[];
  /** подсказки: «добавьте ещё 1 товар…», «до подарка осталось…» */
  hints: { promoId: string; text: string; href: string; progress?: number }[];
  /** доставка бесплатна по акции */
  freeDelivery: boolean;
  total: number;
};

/** Считает акции корзины. Цены в items — уже со скидкой % (как на сайте). */
export function quoteCart(db: Database, items: QuoteItem[]): CartQuote {
  const q: CartQuote = { discounts: [], gifts: [], hints: [], freeDelivery: false, total: 0 };
  const products = new Map(db.products.map((p) => [p.id, p]));
  const live = db.promotions.filter((p) => kindOf(p) !== "percent" && isPromotionLive(p));
  const orderSum = items.reduce((s, i) => s + i.price * i.qty, 0);
  for (const promo of live) {
    const mine = items.filter((i) => {
      const p = products.get(i.productId);
      return p && promotionMatches(promo, p);
    });
    const sum = mine.reduce((s, i) => s + i.price * i.qty, 0);
    const units = mine.flatMap((i) => Array.from({ length: i.qty }, () => i.price)).sort((a, b) => b - a);
    const href = `/sale/${promo.slug}`;
    switch (kindOf(promo)) {
      case "bundle": {
        const b = Math.max(2, promo.buyQty ?? 3), free = Math.max(1, b - Math.max(1, promo.payQty ?? 2));
        let amount = 0;
        for (let g = 0; g + b <= units.length; g += b) amount += units.slice(g + b - free, g + b).reduce((s, x) => s + x, 0);
        if (amount > 0) q.discounts.push({ promoId: promo.id, title: promo.title, amount });
        const rest = units.length % b;
        if (units.length > 0 && rest > 0) q.hints.push({ promoId: promo.id, href, progress: rest / b, text: `Добавьте ещё ${goods(b - rest)} из акции «${promo.title}» — ${free > 1 ? "самые дешёвые будут" : "самый дешёвый будет"} в подарок` });
        break;
      }
      case "gift": {
        const min = promo.minTotal ?? 0;
        if (mine.length && sum >= min) q.gifts.push({ promoId: promo.id, title: promo.title, text: promo.giftText || "подарок" });
        else if (mine.length || promo.scope === "all") q.hints.push({ promoId: promo.id, href, progress: min ? sum / min : 0, text: `До подарка «${promo.giftText || promo.title}» осталось ${rubs(min - sum)}` });
        break;
      }
      case "tiers": {
        const tiers = [...(promo.tiers ?? [])].filter((t) => t.percent > 0).sort((a, b) => a.from - b.from);
        const got = [...tiers].reverse().find((t) => sum >= t.from);
        if (got) q.discounts.push({ promoId: promo.id, title: `${promo.title}: −${got.percent}%`, amount: Math.round((sum * got.percent) / 100) });
        const next = tiers.find((t) => sum < t.from);
        if (next && (mine.length || promo.scope === "all")) q.hints.push({ promoId: promo.id, href, progress: sum / next.from, text: `Ещё ${rubs(next.from - sum)} — и скидка ${next.percent}% по акции «${promo.title}»` });
        break;
      }
      case "delivery": {
        const min = promo.minTotal ?? 0;
        if (orderSum >= min) q.freeDelivery = true;
        else if (orderSum > 0) q.hints.push({ promoId: promo.id, href, progress: orderSum / min, text: `До бесплатной доставки по акции осталось ${rubs(min - orderSum)}` });
        break;
      }
    }
  }
  q.total = q.discounts.reduce((s, d) => s + d.amount, 0);
  return q;
}
