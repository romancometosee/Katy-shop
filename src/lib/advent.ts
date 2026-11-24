// Адвент-календарь Katy: 24 окошка в декабре, за каждым — товар дня со скидкой.
// Каждое окошко — обычная акция «Товар дня» (один товар, один день), поэтому цены считаются как у любой акции.
import type { Database, Promotion } from "./types";

export const ADVENT_DAYS = 24;
export const ADVENT_COLOR = "#9e3a52";

/** Сегодняшняя дата по Москве: { y, m (1–12), d } */
export function moscowToday(now = new Date()) {
  const t = new Date(now.getTime() + 3 * 3600000);
  return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() };
}

/** Год ближайшего календаря: после 24 декабря — уже следующий */
export function adventYear(now = new Date()) {
  const { y, m, d } = moscowToday(now);
  return m === 12 && d > ADVENT_DAYS ? y + 1 : y;
}

export const adventId = (year: number, day: number) => `advent-${year}-12-${String(day).padStart(2, "0")}`;

export function adventDays(db: Database, year = adventYear()) {
  return Array.from({ length: ADVENT_DAYS }, (_, i) => {
    const day = i + 1;
    const promo: Promotion | undefined = db.promotions.find((p) => p.id === adventId(year, day) && p.isActive);
    const product = promo && db.products.find((p) => p.id === promo.targetIds[0] && p.isActive);
    return { day, promo, product };
  });
}

export function adventPromotion(year: number, day: number, productId: string, percent: number): Promotion {
  const date = `${year}-12-${String(day).padStart(2, "0")}`;
  return {
    id: adventId(year, day),
    slug: adventId(year, day),
    title: `Адвент-календарь Katy · ${day} декабря`,
    subtitle: "Товар дня",
    discountPercent: Math.min(90, Math.max(1, Math.round(percent))),
    scope: "products",
    targetIds: [productId],
    startsAt: new Date(`${date}T00:00:00+03:00`).toISOString(),
    endsAt: new Date(`${date}T23:59:59+03:00`).toISOString(),
    isActive: true,
    color: ADVENT_COLOR,
    kind: "percent",
    dayDeal: true,
  };
}

/** Есть ли в этом году хотя бы одно окошко */
export const hasAdvent = (db: Database, year = adventYear()) => db.promotions.some((p) => p.id.startsWith(`advent-${year}-`) && p.isActive);

/** Автозаполнение: хиты и товары с лучшим рейтингом из разных разделов, скидки 20–30% */
export function autoAdvent(db: Database, year = adventYear()): Promotion[] {
  const pool = db.products.filter((p) => p.isActive && p.variants.some((v) => v.stock > 0)).sort((a, b) => Number(b.isHit) - Number(a.isHit) || b.rating - a.rating);
  const byCat = new Map<string, string[]>();
  for (const p of pool) byCat.set(p.categoryId, [...(byCat.get(p.categoryId) ?? []), p.id]);
  const lists = [...byCat.values()];
  const picks: string[] = [];
  for (let i = 0; picks.length < ADVENT_DAYS && lists.some((l) => l.length > i); i++) for (const l of lists) if (l[i] && picks.length < ADVENT_DAYS) picks.push(l[i]);
  return picks.map((id, i) => adventPromotion(year, i + 1, id, [20, 25, 30][(i + 1) % 3]));
}
