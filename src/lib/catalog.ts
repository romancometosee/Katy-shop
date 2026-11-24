// Работа с каталогом: цены с учётом акций, фильтры, поиск
import type { Database, Product, Promotion, Category, Gender } from "./types";

export type PricedVariant = {
  id: string;
  label: string;
  price: number; // итоговая цена
  oldPrice?: number; // цена до скидки
  stock: number;
};

export type ProductView = {
  id: string;
  slug: string;
  name: string;
  brandId: string;
  brandName: string;
  brandSlug: string;
  categoryId: string;
  subcategoryId?: string;
  shortDescription: string;
  images: string[];
  art: Product["art"];
  variants: PricedVariant[];
  price: number; // минимальная итоговая цена
  oldPrice?: number;
  discountPercent: number;
  promoTitle?: string;
  isHit: boolean;
  isNew: boolean;
  rating: number;
  reviewsCount: number;
  gender?: Gender;
  family?: string;
};

export function isPromotionLive(p: Promotion, at = new Date()) {
  return p.isActive && new Date(p.startsAt) <= at && at <= new Date(p.endsAt);
}

export function promotionMatches(p: Promotion, product: Product) {
  switch (p.scope) {
    case "all":
      return true;
    case "category":
      return p.targetIds.includes(product.categoryId) || (!!product.subcategoryId && p.targetIds.includes(product.subcategoryId));
    case "brand":
      return p.targetIds.includes(product.brandId);
    case "products":
      return p.targetIds.includes(product.id);
  }
}

export function bestPromotion(db: Database, product: Product): Promotion | undefined {
  return db.promotions
    .filter((p) => isPromotionLive(p) && promotionMatches(p, product))
    .sort((a, b) => b.discountPercent - a.discountPercent)[0];
}

export function toView(db: Database, product: Product): ProductView {
  const brand = db.brands.find((b) => b.id === product.brandId);
  const promo = bestPromotion(db, product);
  const pct = promo?.discountPercent ?? 0;
  const variants: PricedVariant[] = product.variants.map((v) => {
    if (pct > 0) {
      const price = Math.round((v.price * (100 - pct)) / 100 / 10) * 10;
      return { id: v.id, label: v.label, price, oldPrice: v.oldPrice && v.oldPrice > v.price ? v.oldPrice : v.price, stock: v.stock };
    }
    return { id: v.id, label: v.label, price: v.price, oldPrice: v.oldPrice && v.oldPrice > v.price ? v.oldPrice : undefined, stock: v.stock };
  });
  const cheapest = [...variants].sort((a, b) => a.price - b.price)[0];
  const ownDiscount = cheapest?.oldPrice ? Math.round((1 - cheapest.price / cheapest.oldPrice) * 100) : 0;
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    brandId: product.brandId,
    brandName: brand?.name ?? "",
    brandSlug: brand?.slug ?? "",
    categoryId: product.categoryId,
    subcategoryId: product.subcategoryId,
    shortDescription: product.shortDescription,
    images: product.images,
    art: product.art,
    variants,
    price: cheapest?.price ?? 0,
    oldPrice: cheapest?.oldPrice,
    discountPercent: Math.max(pct, ownDiscount),
    promoTitle: promo?.title,
    isHit: product.isHit,
    isNew: product.isNew,
    rating: product.rating,
    reviewsCount: product.reviews.filter((r) => r.approved).length,
    gender: product.gender,
    family: product.family,
  };
}

export type Filters = {
  ids?: string[];
  category?: string; // id раздела
  subcategory?: string; // id подраздела
  brands?: string[];
  genders?: string[];
  families?: string[];
  priceMin?: number;
  priceMax?: number;
  q?: string;
  sale?: boolean;
  hit?: boolean;
  isNew?: boolean;
  sort?: "popular" | "price-asc" | "price-desc" | "new" | "rating" | "discount";
};

export function searchProducts(db: Database, f: Filters): ProductView[] {
  const q = f.q?.trim().toLowerCase();
  let list = db.products.filter((p) => p.isActive);
  if (f.ids) list = list.filter((p) => f.ids!.includes(p.id));
  if (f.category) list = list.filter((p) => p.categoryId === f.category);
  if (f.subcategory) list = list.filter((p) => p.subcategoryId === f.subcategory);
  if (f.brands?.length) list = list.filter((p) => f.brands!.includes(p.brandId));
  if (f.genders?.length) list = list.filter((p) => p.gender && f.genders!.includes(p.gender));
  if (f.families?.length) list = list.filter((p) => p.family && f.families!.includes(p.family));
  if (f.hit) list = list.filter((p) => p.isHit);
  if (f.isNew) list = list.filter((p) => p.isNew);
  if (q) {
    list = list.filter((p) => {
      const brand = db.brands.find((b) => b.id === p.brandId)?.name ?? "";
      const notes = p.notes ? [...p.notes.top, ...p.notes.heart, ...p.notes.base].join(" ") : "";
      return [p.name, brand, p.shortDescription, p.family ?? "", notes, p.tags.join(" ")].join(" ").toLowerCase().includes(q);
    });
  }
  let views = list.map((p) => toView(db, p));
  if (f.sale) views = views.filter((v) => v.discountPercent > 0);
  if (f.priceMin !== undefined) views = views.filter((v) => v.price >= f.priceMin!);
  if (f.priceMax !== undefined) views = views.filter((v) => v.price <= f.priceMax!);
  const created = new Map(list.map((p) => [p.id, p.createdAt]));
  switch (f.sort) {
    case "price-asc":
      views.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      views.sort((a, b) => b.price - a.price);
      break;
    case "new":
      views.sort((a, b) => (created.get(b.id)! > created.get(a.id)! ? 1 : -1));
      break;
    case "rating":
      views.sort((a, b) => b.rating - a.rating);
      break;
    case "discount":
      views.sort((a, b) => b.discountPercent - a.discountPercent);
      break;
    default:
      views.sort((a, b) => Number(b.isHit) - Number(a.isHit) || b.reviewsCount - a.reviewsCount || b.rating - a.rating);
  }
  return views;
}

export const topCategories = (db: Database) =>
  db.categories.filter((c) => !c.parentId).sort((a, b) => a.order - b.order);

export const subcategoriesOf = (db: Database, parentId: string) =>
  db.categories.filter((c) => c.parentId === parentId).sort((a, b) => a.order - b.order);

export function categoryPath(db: Database, c: Category) {
  const parent = c.parentId ? db.categories.find((x) => x.id === c.parentId) : undefined;
  return parent ? `/catalog/${parent.slug}/${c.slug}` : `/catalog/${c.slug}`;
}

export const genderLabel: Record<string, string> = { women: "Женский", men: "Мужской", unisex: "Унисекс" };
