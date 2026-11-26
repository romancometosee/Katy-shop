"use server";
// Действия покупателя: отзыв, оформление заказа
import { revalidatePath } from "next/cache";
import { updateDb } from "./db";
import { toView } from "./catalog";
import { SCENT_WHEN, type Order, type ScentVotes } from "./types";
import { headers } from "next/headers";
import { quoteCart, type CartQuote } from "./promo";
import { isProProduct, proFor, proPrice, PRO_KINDS } from "./pro";
import { currentCustomer } from "./customer";
import { GIFT_BOX, GIFT_BOXES, LOYALTY_MODE, WELCOME_BONUS, discountLevel, normPhone, parseGiftCard, pointsForOrder, totalSpend, yearSpend } from "./club";

export async function submitReview(fd: FormData) {
  const productId = String(fd.get("productId"));
  const author = String(fd.get("author") ?? "").trim().slice(0, 60);
  const text = String(fd.get("text") ?? "").trim().slice(0, 2000);
  const rating = Math.min(5, Math.max(1, Number(fd.get("rating")) || 5));
  const profile = String(fd.get("profile") ?? "").trim().slice(0, 40) || undefined;
  if (!author || !text) return;
  await updateDb((db) => {
    const p = db.products.find((x) => x.id === productId);
    if (!p) return;
    p.reviews.unshift({ id: crypto.randomUUID(), author, text, rating, profile, date: new Date().toISOString(), approved: false });
  });
}

export type CheckoutInput = {
  items: { productId: string; variantId: string; qty: number; note?: string }[];
  customer: Order["customer"];
  delivery: Order["delivery"];
  promoCode?: string;
  /** пробник в подарок, который выбрал покупатель */
  sample?: string;
};

export type CheckoutResult = { ok: true; number: number } | { ok: false; error: string };

export async function checkPromoCode(code: string, subtotal: number) {
  const { getDb } = await import("./db");
  const db = await getDb();
  const pc = db.promoCodes.find((p) => p.isActive && p.code.toUpperCase() === code.trim().toUpperCase());
  if (!pc) return { ok: false as const, error: "Промокод не найден" };
  if (subtotal < pc.minTotal) return { ok: false as const, error: `Промокод действует от ${pc.minTotal} ₽` };
  return { ok: true as const, percent: pc.discountPercent, code: pc.code };
}

/** Скидки и подарки по акциям для корзины (цены берём с сервера, а не из браузера) */
export async function quoteCartAction(items: { productId: string; variantId: string; qty: number }[]): Promise<CartQuote> {
  const { getDb } = await import("./db");
  const db = await getDb();
  const priced = items.slice(0, 100).flatMap((it) => {
    const p = db.products.find((x) => x.id === it.productId && x.isActive);
    const v = p && toView(db, p).variants.find((x) => x.id === it.variantId);
    return v ? [{ productId: it.productId, price: v.price, qty: Math.max(1, Math.min(99, Math.floor(it.qty))) }] : [];
  });
  return quoteCart(db, priced);
}

const cut = (s: unknown, n: number) => (typeof s === "string" ? s.trim().slice(0, n) : "");

export async function placeOrder(input: CheckoutInput): Promise<CheckoutResult> {
  const c = input.customer;
  if (!c.name?.trim() || !c.phone?.trim()) return { ok: false, error: "Укажите имя и телефон" };
  if (!Array.isArray(input.items) || !input.items.length) return { ok: false, error: "Корзина пуста" };
  if (input.items.length > 100) return { ok: false, error: "Слишком много позиций в одном заказе — позвоните нам" };
  if (!["courier", "pickup", "post"].includes(input.delivery)) return { ok: false, error: "Выберите способ доставки" };
  const session = await currentCustomer();
  const result = await updateDb((db) => {
    // Katy PRO: вошедший мастер покупает проф. товары по своей цене
    const pro = proFor(db, session);
    const items: Order["items"] = [];
    for (const it of input.items) {
      const qty0 = Math.max(1, Math.min(20, Math.floor(Number(it.qty)) || 1));
      const note = it.note?.trim().slice(0, 300) || undefined;
      // подарочный сертификат: сумму и дизайн проверяем на сервере
      if (it.productId === "gift-card") {
        const gc = parseGiftCard(it.variantId);
        if (gc) items.push({ productId: "gift-card", variantId: it.variantId, name: "Подарочный сертификат Katy", variantLabel: `${gc.amount.toLocaleString("ru-RU")} ₽ · ${gc.design.name}`, price: gc.amount, qty: qty0, note });
        continue;
      }
      // подарочная упаковка из конструктора подарка
      if (it.productId === GIFT_BOX.id) {
        const box = GIFT_BOXES.find((b) => it.variantId === `box-${b.id}` || it.variantId.startsWith(`box-${b.id}-`));
        if (box) items.push({ productId: GIFT_BOX.id, variantId: it.variantId, name: "Подарочная упаковка", variantLabel: box.name, price: GIFT_BOX.price, qty: qty0, note });
        continue;
      }
      const p = db.products.find((x) => x.id === it.productId && x.isActive);
      const view = p && toView(db, p);
      const v = view?.variants.find((x) => x.id === it.variantId);
      const raw = p?.variants.find((x) => x.id === it.variantId);
      if (!p || !v || !raw) continue;
      const qty = Math.max(1, Math.min(99, Math.floor(Number(it.qty)) || 1));
      const asPro = pro && isProProduct(db, p);
      items.push({ productId: p.id, variantId: v.id, name: `${view!.brandName} ${p.name}`, variantLabel: v.label, price: asPro ? proPrice(raw.price, v.price, pro.discount) : v.price, qty, ...(asPro ? { pro: true } : {}) });
      raw.stock = Math.max(0, raw.stock - qty);
    }
    if (!items.length) return { ok: false as const, error: "Товары из корзины больше недоступны" };
    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    // акции корзины: 3=2, подарки, ступенчатые скидки, бесплатная доставка
    // товары по цене PRO в акциях и других скидках не участвуют — цена мастера уже самая выгодная
    const quote = quoteCart(db, items.filter((i) => i.productId !== "gift-card" && i.productId !== GIFT_BOX.id && !i.pro));
    let discount = quote.total;
    let promoCode: string | undefined;
    // база для скидок: товары без сертификатов, после акций корзины
    const goods = items.filter((i) => i.productId !== "gift-card" && i.productId !== GIFT_BOX.id && !i.pro).reduce((s, i) => s + i.price * i.qty, 0);
    const base = Math.max(0, goods - quote.total);
    // накопительная скидка по телефону; с промокодом не суммируется — берём бо́льшую
    const loyaltyPercent = LOYALTY_MODE === "discount" ? discountLevel(totalSpend(db, normPhone(c.phone))).percent : 0;
    let codePercent = 0;
    if (input.promoCode) {
      const pc = db.promoCodes.find((p) => p.isActive && p.code.toUpperCase() === input.promoCode!.trim().toUpperCase());
      if (pc && subtotal >= pc.minTotal) { codePercent = pc.discountPercent; promoCode = pc.code; }
    }
    const usedLoyalty = loyaltyPercent > 0 && loyaltyPercent >= codePercent;
    if (usedLoyalty) promoCode = undefined;
    const extraPercent = usedLoyalty ? loyaltyPercent : codePercent;
    discount += Math.round((base * extraPercent) / 100);
    const promos = [
      ...quote.discounts.map((d) => ({ title: d.title, amount: d.amount })),
      ...(usedLoyalty ? [{ title: `Накопительная скидка ${loyaltyPercent}%`, amount: Math.round((base * loyaltyPercent) / 100) }] : []),
      ...quote.gifts.map((g) => ({ title: g.title, amount: 0, gift: g.text })),
    ];
    const deliveryPrice = input.delivery === "pickup" || quote.freeDelivery || subtotal - discount >= db.settings.freeDeliveryFrom ? 0 : db.settings.deliveryPrice;
    const number = 1000 + db.orders.length + 1;
    // Клуб Katy: баллы за заказ участнику с этим телефоном (правила — в club.ts, pointsForOrder)
    const member = (db.members ?? []).find((m) => m.phone === normPhone(c.phone));
    let pointsEarned = 0;
    if (member && LOYALTY_MODE === "points") {
      // сертификаты баллами не облагаются — баллы начислятся, когда сертификатом оплатят товары
      const base = items.filter((i) => i.productId !== "gift-card").reduce((s, i) => s + i.price * i.qty, 0);
      pointsEarned = pointsForOrder({ goodsTotal: Math.max(0, base - discount), yearSpend: yearSpend(db.orders, member.phone) });
      member.points += pointsEarned;
      if (pointsEarned) (member.history ??= []).unshift({ at: new Date().toISOString(), kind: "order", points: pointsEarned, orderNumber: number });
    }
    db.orders.unshift({
      id: crypto.randomUUID(),
      number,
      createdAt: new Date().toISOString(),
      customer: {
        name: cut(c.name, 100), phone: cut(c.phone, 30), email: cut(c.email, 120), city: cut(c.city, 100), address: cut(c.address, 300), comment: cut(c.comment, 1000),
      },
      delivery: input.delivery,
      items,
      subtotal,
      discount,
      deliveryPrice,
      total: subtotal - discount + deliveryPrice,
      promoCode,
      promos: promos.length ? promos : undefined,
      pointsEarned: pointsEarned || undefined,
      loyaltyPercent: usedLoyalty ? loyaltyPercent : undefined,
      proDiscount: items.some((i) => i.pro) ? pro!.discount : undefined,
      gift: input.sample ? `${db.settings.giftText}: ${cut(input.sample, 120)}` : db.settings.giftText,
      status: "new",
    });
    return { ok: true as const, number };
  });
  revalidatePath("/admin");
  return result;
}

export type JoinResult = { ok: true; points: number; already: boolean; percent: number } | { ok: false; error: string };

/** Накопительная скидка по номеру телефона — для корзины */
export async function loyaltyForPhone(phone: string) {
  if (LOYALTY_MODE !== "discount") return { percent: 0 };
  const p = normPhone(phone ?? "");
  if (p.length !== 11) return { percent: 0 };
  const { getDb } = await import("./db");
  return { percent: discountLevel(totalSpend(await getDb(), p)).percent };
}

/** Вступление в Клуб Katy */
export async function joinClub(input: { name: string; phone: string; birthday?: string; email?: string; agree: boolean }): Promise<JoinResult> {
  const name = input.name?.trim().slice(0, 60);
  const phone = normPhone(input.phone ?? "");
  if (!name) return { ok: false, error: "Укажите имя" };
  if (phone.length !== 11) return { ok: false, error: "Проверьте номер телефона" };
  if (!input.agree) return { ok: false, error: "Нужно согласие с правилами клуба" };
  const birthday = /^\d{4}-\d{2}-\d{2}$/.test(input.birthday ?? "") ? input.birthday : undefined;
  const res = await updateDb((db) => {
    db.members ??= [];
    const found = db.members.find((m) => m.phone === phone);
    if (found) return { ok: true as const, points: found.points, already: true, percent: discountLevel(totalSpend(db, phone)).percent };
    db.members.unshift({ phone, name, birthday, email: input.email?.trim().slice(0, 100) || undefined, ...(LOYALTY_MODE === "points" ? { points: WELCOME_BONUS, history: [{ at: new Date().toISOString(), kind: "welcome" as const, points: WELCOME_BONUS }] } : { points: 0 }), createdAt: new Date().toISOString() });
    return { ok: true as const, points: LOYALTY_MODE === "points" ? WELCOME_BONUS : 0, already: false, percent: discountLevel(totalSpend(db, phone)).percent };
  });
  revalidatePath("/admin/club");
  return res;
}


/** «Сообщить о поступлении»: запоминаем телефон, оповестим, когда товар появится */
export async function subscribeStock(input: { productId: string; variantId: string; phone: string }) {
  const phone = normPhone(input.phone ?? "");
  if (phone.length !== 11) return { ok: false as const, error: "Проверьте номер телефона" };
  return updateDb((db) => {
    const p = db.products.find((x) => x.id === input.productId);
    const v = p?.variants.find((x) => x.id === input.variantId);
    if (!p || !v) return { ok: false as const, error: "Товар не найден" };
    db.stockAlerts ??= [];
    if (!db.stockAlerts.some((a) => a.productId === p.id && a.variantId === v.id && a.phone === phone && !a.notifiedAt)) {
      if (db.stockAlerts.length > 5000) db.stockAlerts.splice(0, db.stockAlerts.length - 5000);
      db.stockAlerts.push({ id: crypto.randomUUID(), productId: p.id, variantId: v.id, phone, createdAt: new Date().toISOString() });
    }
    return { ok: true as const };
  });
}

/** Katy PRO: цены мастера для товаров в корзине (только для вошедшего одобренного мастера) */
export async function proPricesAction(items: { productId: string; variantId: string }[]): Promise<{ discount: number; prices: Record<string, number> } | null> {
  const session = await currentCustomer();
  if (!session) return null;
  const { getDb } = await import("./db");
  const db = await getDb();
  const pro = proFor(db, session);
  if (!pro) return null;
  const prices: Record<string, number> = {};
  for (const it of items.slice(0, 100)) {
    const p = db.products.find((x) => x.id === it.productId && x.isActive);
    if (!p || !isProProduct(db, p)) continue;
    const raw = p.variants.find((x) => x.id === it.variantId);
    const v = toView(db, p).variants.find((x) => x.id === it.variantId);
    if (raw && v) prices[it.variantId] = proPrice(raw.price, v.price, pro.discount);
  }
  return { discount: pro.discount, prices };
}

/** Katy PRO: заявка мастера или салона */
export async function applyPro(input: { name: string; phone: string; kind: string; salon?: string; city?: string; social?: string; comment?: string }) {
  const phone = normPhone(input.phone ?? "");
  const name = input.name?.trim().slice(0, 80);
  if (!name || phone.length !== 11) return { ok: false as const, error: "Укажите имя и телефон" };
  const kind = PRO_KINDS[input.kind] ? input.kind : "other";
  const clip = (s?: string, n = 120) => s?.trim().slice(0, n) || undefined;
  return updateDb((db) => {
    db.pros ??= [];
    const found = db.pros.find((p) => p.phone === phone);
    if (found?.status === "approved") return { ok: true as const, status: "approved" as const };
    if (found) Object.assign(found, { name, kind, salon: clip(input.salon), city: clip(input.city, 60), social: clip(input.social), comment: clip(input.comment, 300), status: "pending", createdAt: new Date().toISOString() });
    else {
      if (db.pros.length > 3000) return { ok: false as const, error: "Попробуйте позже или позвоните нам" };
      db.pros.unshift({ phone, name, kind, salon: clip(input.salon), city: clip(input.city, 60), social: clip(input.social), comment: clip(input.comment, 300), status: "pending", discount: 0, createdAt: new Date().toISOString() });
    }
    return { ok: true as const, status: "pending" as const };
  });
}

/** Голос покупателя за стойкость, шлейф и «когда носить» аромата */
const scentHits = new Map<string, number[]>();
export async function voteScent(productId: string, vote: { longevity?: number; sillage?: number; when?: string[] }): Promise<ScentVotes | null> {
  // не больше 20 голосов за час с одного адреса
  const h = await headers();
  const ip = h.get("cf-connecting-ip") || h.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const now = Date.now();
  const list = (scentHits.get(ip) ?? []).filter((t) => now - t < 3600000);
  if (list.length >= 20) return null;
  scentHits.set(ip, [...list, now]);
  if (scentHits.size > 5000) scentHits.clear();
  const ok = (n?: number) => (Number.isInteger(n) && n! >= 1 && n! <= 5 ? n! : undefined);
  const lon = ok(vote.longevity), sil = ok(vote.sillage);
  const when = (Array.isArray(vote.when) ? vote.when : []).filter((w) => (SCENT_WHEN as readonly string[]).includes(w)).slice(0, 4);
  if (!lon && !sil && !when.length) return null;
  const res = await updateDb((db) => {
    const p = db.products.find((x) => x.id === productId);
    if (!p || p.categoryId !== "parfyumeriya") return null;
    const v = (p.scentVotes ??= { longevity: [0, 0, 0, 0, 0], sillage: [0, 0, 0, 0, 0], when: {}, total: 0 });
    if (lon) v.longevity[lon - 1]++;
    if (sil) v.sillage[sil - 1]++;
    for (const w of when) v.when[w] = (v.when[w] ?? 0) + 1;
    v.total++;
    return structuredClone(v);
  });
  revalidatePath("/product/[slug]", "page");
  return res;
}
