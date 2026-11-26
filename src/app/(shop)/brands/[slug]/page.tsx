import { notFound } from "next/navigation";
import CatalogView, { type SP } from "@/components/CatalogView";
import BrandHero from "@/components/BrandHero";
import { getDb } from "@/lib/db";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await getDb();
  const b = db.brands.find((x) => x.slug === slug);
  return { title: b?.name, description: b ? (b.story || b.description).slice(0, 160) : undefined };
}

export default async function BrandPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<SP> }) {
  const { slug } = await params;
  const sp = await searchParams;
  const db = await getDb();
  const brand = db.brands.find((b) => b.slug === slug);
  if (!brand) notFound();
  const own = db.products.filter((p) => p.brandId === brand.id && p.isActive);
  // коллекции бренда — как на сайтах парфюмерных домов
  const collections = [...new Set(own.map((p) => p.collection).filter(Boolean) as string[])].sort();
  const href = (c?: string) => `/brands/${brand.slug}${c ? `?collection=${encodeURIComponent(c)}` : ""}`;
  const active = typeof sp.collection === "string" ? sp.collection : undefined;
  return (
    <CatalogView
      db={db}
      title={active ? `Коллекция ${active}` : `Все товары ${brand.name}`}
      hideTitle
      hero={<BrandHero brand={brand} count={own.length} />}
      crumbs={[{ name: "Бренды", href: "/brands" }, { name: brand.name }]}
      base={{ brands: [brand.id] }}
      sp={sp}
      links={collections.length ? [{ name: "Все", href: href() }, ...collections.map((c) => ({ name: c, href: href(c) }))] : undefined}
      activeLink={href(active)}
    />
  );
}
