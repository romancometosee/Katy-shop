import type { MetadataRoute } from "next";
import { getDb } from "@/lib/db";
import { articles } from "@/lib/journal";
import { SITE_URL } from "@/lib/site";
import { isPromotionLive } from "@/lib/catalog";

export const dynamic = "force-dynamic";

// Карта сайта для Яндекса и Google: все разделы, товары, бренды, статьи и акции
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const db = await getDb();
  const now = new Date();
  const u = (path: string, priority: number, changeFrequency: "daily" | "weekly" | "monthly" = "weekly", lastModified: Date | string = now) => ({ url: `${SITE_URL}${path}`, priority, changeFrequency, lastModified });
  const cats = db.categories;
  const top = cats.filter((c) => !c.parentId);
  return [
    u("/", 1, "daily"),
    ...["/sale", "/brands", "/club", "/gift", "/podbor", "/journal", "/delivery", "/stores", "/raspiv", "/about", "/advent", "/legal/oferta", "/legal/vozvrat", "/legal/privacy"].map((p) => u(p, 0.6)),
    ...top.map((c) => u(`/catalog/${c.slug}`, 0.9, "daily")),
    ...cats.filter((c) => c.parentId).map((c) => { const parent = cats.find((p) => p.id === c.parentId); return parent ? u(`/catalog/${parent.slug}/${c.slug}`, 0.8, "daily") : null; }).filter(Boolean) as MetadataRoute.Sitemap,
    ...db.products.filter((p) => p.isActive).map((p) => u(`/product/${p.slug}`, 0.7, "weekly", p.createdAt)),
    ...db.brands.map((b) => u(`/brands/${b.slug}`, 0.6)),
    ...articles.map((a) => u(`/journal/${a.slug}`, 0.5, "monthly")),
    ...db.promotions.filter((p) => isPromotionLive(p)).map((p) => u(`/sale/${p.slug}`, 0.6, "daily")),
  ];
}
