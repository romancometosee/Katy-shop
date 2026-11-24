import type { Database } from "./types";
import type { Article } from "./journal";

/** Фото товаров статьи для обложки (до трёх) */
export const articleImages = (db: Database, a: Article) =>
  a.products
    .map((s) => db.products.find((p) => p.slug === s && p.isActive)?.images[0])
    .filter((x): x is string => Boolean(x))
    .slice(0, 3);
