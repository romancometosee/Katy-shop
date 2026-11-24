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
  /** Оттенки той же линейки (гель-лаки, лаки, помады): кружочки цвета в карточке */
  shades?: Shade[];
  /** Название оттенка этого товара (без названия линейки) */
  shadeName?: string;
};

export type Shade = { slug: string; name: string; color: string };

// подразделы, где товары отличаются оттенком
const SHADE_SUBS = ["gel-laki", "laki", "guby"];
const shadeCache = new WeakMap<Database, Map<string, Shade[]>>();

/** Все оттенки линейки: те же бренд и подраздел, минимум два товара */
export function shadesFor(db: Database, product: Product): Shade[] | undefined {
  const sub = product.subcategoryId;
  if (!sub || !SHADE_SUBS.some((s) => sub.endsWith(`--${s}`))) return undefined;
  let cache = shadeCache.get(db);
  if (!cache) shadeCache.set(db, (cache = new Map()));
  const key = `${product.brandId}|${sub}`;
  let list = cache.get(key);
  if (!list) {
    const same = db.products.filter((p) => p.isActive && p.brandId === product.brandId && p.subcategoryId === sub);
    // общее начало названий («Гель-лак GelColor») убираем — остаётся имя оттенка
    const words = same.map((p) => p.name.split(" "));
    let common = 0;
    while (words.length > 1 && words.every((w) => w.length > common + 1 && w[common] === words[0][common])) common++;
    list = same.map((p, i) => ({ slug: p.slug, name: words[i].slice(common).join(" "), color: p.art.color }));
    cache.set(key, list);
  }
  return list.length > 1 ? list : undefined;
}

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
    ...(() => {
      const shades = shadesFor(db, product);
      return shades ? { shades, shadeName: shades.find((x) => x.slug === product.slug)?.name } : {};
    })(),
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

// служебные слова живой речи, которые не помогают искать товар
const STOP = new Set("есть ли у вас вас нас мне нужен нужна нужно нужны хочу хочется купить покажи покажите найди найдите сколько стоит стоят цена цену какой какая какие какое для под подскажите пожалуйста можно это там такой такая еще ещё или как где что чтобы".split(" "));

/** Слова запроса без служебных, укороченные до основы («шампуни» → «шамп…») */
export function queryStems(q: string) {
  return q
    .toLowerCase()
    .replace(/ё/g, "е")
    .split(/[^a-zа-я0-9]+/i)
    .filter((w) => w.length > 2 && !STOP.has(w))
    .map((w) => (w.length > 5 ? w.slice(0, w.length - 2) : w));
}

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
    const text = (p: Product) => {
      const brand = db.brands.find((b) => b.id === p.brandId)?.name ?? "";
      const notes = p.notes ? [...p.notes.top, ...p.notes.heart, ...p.notes.base].join(" ") : "";
      const cat = db.categories.find((c) => c.id === (p.subcategoryId ?? p.categoryId))?.name ?? "";
      return [p.name, brand, cat, p.shortDescription, p.family ?? "", notes, p.tags.join(" ")].join(" ").toLowerCase().replace(/ё/g, "е");
    };
    const exact = list.filter((p) => text(p).includes(q.replace(/ё/g, "е")));
    if (exact.length) list = exact;
    else {
      // фраза целиком не нашлась (часто так бывает при голосовом поиске:
      // «есть ли у вас шампунь Olaplex, сколько стоит») — ищем по отдельным словам
      const stems = queryStems(q);
      const scored = list.map((p) => {
        const t = text(p);
        return { p, s: stems.filter((w) => t.includes(w)).length };
      });
      const best = Math.max(0, ...scored.map((x) => x.s));
      list = best > 0 ? scored.filter((x) => x.s === best).map((x) => x.p) : [];
    }
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

// «Соберите уход»: какие подразделы дополняют товар (шаги ритуала)
const ROUTINE: Record<string, { title: string; steps: string[] }> = {
  "volosy--shampuni": { title: "Соберите уход за волосами", steps: ["volosy--maski-i-kondicionery", "volosy--masla"] },
  "volosy--maski-i-kondicionery": { title: "Соберите уход за волосами", steps: ["volosy--shampuni", "volosy--masla"] },
  "volosy--masla": { title: "Соберите уход за волосами", steps: ["volosy--shampuni", "volosy--maski-i-kondicionery"] },
  "volosy--stayling": { title: "Соберите уход за волосами", steps: ["volosy--shampuni", "volosy--masla"] },
  "nogti--gel-laki": { title: "Всё для маникюра", steps: ["nogti--baza-i-top", "nogti--uhod-za-nogtyami"] },
  "nogti--laki": { title: "Всё для маникюра", steps: ["nogti--uhod-za-nogtyami", "nogti--baza-i-top"] },
  "nogti--baza-i-top": { title: "Всё для маникюра", steps: ["nogti--gel-laki", "nogti--uhod-za-nogtyami"] },
  "nogti--uhod-za-nogtyami": { title: "Всё для маникюра", steps: ["nogti--laki", "nogti--gel-laki"] },
  "uhod-za-licom--ochishchenie": { title: "Соберите ритуал ухода", steps: ["uhod-za-licom--syvorotki", "uhod-za-licom--kremy"] },
  "uhod-za-licom--tonery": { title: "Соберите ритуал ухода", steps: ["uhod-za-licom--syvorotki", "uhod-za-licom--kremy"] },
  "uhod-za-licom--syvorotki": { title: "Соберите ритуал ухода", steps: ["uhod-za-licom--ochishchenie", "uhod-za-licom--kremy", "uhod-za-licom--spf"] },
  "uhod-za-licom--kremy": { title: "Соберите ритуал ухода", steps: ["uhod-za-licom--ochishchenie", "uhod-za-licom--syvorotki", "uhod-za-licom--spf"] },
  "uhod-za-licom--maski": { title: "Соберите ритуал ухода", steps: ["uhod-za-licom--ochishchenie", "uhod-za-licom--kremy"] },
  "uhod-za-licom--spf": { title: "Соберите ритуал ухода", steps: ["uhod-za-licom--ochishchenie", "uhod-za-licom--syvorotki"] },
  "makiyazh--lico": { title: "Завершите образ", steps: ["makiyazh--glaza", "makiyazh--guby"] },
  "makiyazh--glaza": { title: "Завершите образ", steps: ["makiyazh--lico", "makiyazh--brovi", "makiyazh--guby"] },
  "makiyazh--guby": { title: "Завершите образ", steps: ["makiyazh--lico", "makiyazh--glaza"] },
  "makiyazh--brovi": { title: "Завершите образ", steps: ["makiyazh--glaza", "makiyazh--lico"] },
  "telo--dush": { title: "Ритуал для тела", steps: ["telo--skraby", "telo--kremy-dlya-tela"] },
  "telo--skraby": { title: "Ритуал для тела", steps: ["telo--dush", "telo--kremy-dlya-tela"] },
  "telo--kremy-dlya-tela": { title: "Ритуал для тела", steps: ["telo--dush", "telo--dymki"] },
  "telo--dymki": { title: "Ритуал для тела", steps: ["telo--dush", "telo--kremy-dlya-tela"] },
};

/** Товары, которые дополняют этот: по одному на каждый шаг (сначала того же бренда, потом хиты) */
export function routineFor(db: Database, product: Product): { title: string; steps: { step: string; product: ProductView }[] } | undefined {
  const r = product.subcategoryId ? ROUTINE[product.subcategoryId] : undefined;
  if (!r) return undefined;
  const steps = r.steps
    .map((subId) => {
      const cands = db.products.filter((p) => p.isActive && p.subcategoryId === subId && p.variants.some((v) => v.stock > 0));
      if (!cands.length) return undefined;
      cands.sort((a, b) => Number(b.brandId === product.brandId) - Number(a.brandId === product.brandId) || Number(b.isHit) - Number(a.isHit) || b.rating - a.rating);
      const step = db.categories.find((c) => c.id === subId)?.name ?? "";
      return { step, product: toView(db, cands[0]) };
    })
    .filter((x): x is { step: string; product: ProductView } => Boolean(x));
  return steps.length ? { title: r.title, steps } : undefined;
}
