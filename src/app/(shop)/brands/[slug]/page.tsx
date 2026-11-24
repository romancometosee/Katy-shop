import { notFound } from "next/navigation";
import CatalogView, { type SP } from "@/components/CatalogView";
import { getDb } from "@/lib/db";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await getDb();
  return { title: db.brands.find((b) => b.slug === slug)?.name };
}

export default async function BrandPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<SP> }) {
  const { slug } = await params;
  const sp = await searchParams;
  const db = await getDb();
  const brand = db.brands.find((b) => b.slug === slug);
  if (!brand) notFound();
  return (
    <CatalogView
      db={db}
      title={brand.name}
      description={`${brand.description} Страна: ${brand.country}.`}
      crumbs={[{ name: "Бренды", href: "/brands" }, { name: brand.name }]}
      base={{ brands: [brand.id] }}
      sp={sp}
    />
  );
}
