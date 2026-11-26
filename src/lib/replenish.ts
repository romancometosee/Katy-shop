// «Пора пополнить»: по истории заказов подсказываем, что скоро закончится
import type { Database, Order, Product } from "./types";
import { isDecant } from "./catalog";

/** Примерно на сколько дней хватает (по подразделу) */
const DAYS: Record<string, number> = {
  "volosy--shampuni": 45, "volosy--maski-i-kondicionery": 50, "volosy--masla": 90, "volosy--stayling": 60,
  "uhod-za-licom--ochishchenie": 50, "uhod-za-licom--tonery": 60, "uhod-za-licom--syvorotki": 50, "uhod-za-licom--kremy": 60, "uhod-za-licom--maski": 60, "uhod-za-licom--spf": 45,
  "telo--dush": 40, "telo--kremy-dlya-tela": 50, "telo--skraby": 60, "telo--dymki": 60,
  "nogti--baza-i-top": 75, "nogti--uhod-za-nogtyami": 75,
};
const TOP: Record<string, number> = { volosy: 50, "uhod-za-licom": 60, telo: 50 };

export function lastsDays(p: Product, variantLabel: string): number | null {
  if (p.categoryId === "parfyumeriya") return isDecant(variantLabel) ? 30 : null; // большой флакон — надолго
  if (p.categoryId === "makiyazh") return /тушь|тональн|пудр|консилер/i.test(p.name) ? 90 : null;
  return (p.subcategoryId && DAYS[p.subcategoryId]) || TOP[p.categoryId] || null;
}

export type Refill = { product: Product; variantId: string; variantLabel: string; boughtAt: string; days: number; overdue: boolean };

/** Товары из прошлых заказов, которые, скорее всего, заканчиваются (не больше 4) */
export function refills(db: Database, orders: Order[], now = Date.now()): Refill[] {
  const seen = new Set<string>();
  const out: Refill[] = [];
  const sorted = orders.filter((o) => o.status !== "cancelled").sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  for (const o of sorted) {
    for (const i of o.items) {
      if (seen.has(i.productId)) continue; // смотрим только последнюю покупку товара
      seen.add(i.productId);
      const p = db.products.find((x) => x.id === i.productId && x.isActive);
      if (!p) continue;
      const v = p.variants.find((x) => x.id === i.variantId);
      if (!v || v.stock <= 0) continue;
      const base = lastsDays(p, v.label);
      if (!base) continue;
      const days = base * Math.max(1, Math.min(i.qty, 3));
      const passed = (now - new Date(o.createdAt).getTime()) / 864e5;
      if (passed < days * 0.8 || passed > days * 3) continue;
      out.push({ product: p, variantId: v.id, variantLabel: v.label, boughtAt: o.createdAt, days, overdue: passed >= days });
    }
  }
  return out.sort((a, b) => Number(b.overdue) - Number(a.overdue)).slice(0, 4);
}

/** «примерно на полтора месяца» */
export function lastsText(days: number) {
  if (days < 40) return "примерно на месяц";
  if (days < 55) return "примерно на полтора месяца";
  if (days < 75) return "примерно на два месяца";
  if (days < 105) return "примерно на три месяца";
  return `примерно на ${Math.round(days / 30)} мес.`;
}
