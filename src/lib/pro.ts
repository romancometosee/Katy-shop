// Katy PRO: цены для мастеров и салонов на профессиональные товары
import type { Database, Product, ProAccount } from "./types";

export const PRO_KINDS: Record<string, string> = {
  manicure: "Мастер маникюра",
  hair: "Парикмахер",
  brows: "Мастер бровей и ресниц",
  cosmetologist: "Косметолог",
  salon: "Салон",
  other: "Другое",
};
export const PRO_DISCOUNTS = [10, 15, 20, 25, 30];
export const PRO_DEFAULT_DISCOUNT = 20;
const DEFAULT_CATEGORIES = ["nogti", "volosy"];

export const proCategories = (db: Database) => db.settings.proCategories ?? DEFAULT_CATEGORIES;
export const isProProduct = (db: Database, p: Pick<Product, "categoryId">) => proCategories(db).includes(p.categoryId);

/** Одобренный мастер с этим телефоном */
export function proFor(db: Database, phone?: string): ProAccount | undefined {
  if (!phone) return undefined;
  return (db.pros ?? []).find((p) => p.phone === phone && p.status === "approved");
}

/** Цена мастера: от обычной цены варианта; если по акции дешевле — берём цену акции */
export function proPrice(basePrice: number, salePrice: number, discount: number) {
  return Math.min(salePrice, Math.round((basePrice * (100 - discount)) / 100));
}
