import { notFound } from "next/navigation";
import CatalogView, { type SP } from "@/components/CatalogView";
import { getDb } from "@/lib/db";
import { subcategoriesOf } from "@/lib/catalog";

export async function generateMetadata({ params }: { params: Promise<{ category: string; sub: string }> }) {
  const { category, sub } = await params;
  const db = await getDb();
  const cat = db.categories.find((c) => !c.parentId && c.slug === category);
  return { title: db.categories.find((c) => c.parentId === cat?.id && c.slug === sub)?.name };
}

export default async function SubcategoryPage({ params, searchParams }: { params: Promise<{ category: string; sub: string }>; searchParams: Promise<SP> }) {
  const { category, sub } = await params;
  const sp = await searchParams;
  const db = await getDb();
  const cat = db.categories.find((c) => !c.parentId && c.slug === category);
  if (!cat) notFound();
  const subcat = db.categories.find((c) => c.parentId === cat.id && c.slug === sub);
  if (!subcat) notFound();
  const href = `/catalog/${cat.slug}`;
  return (
    <CatalogView
      db={db}
      title={subcat.name}
      description={subcat.description || cat.description}
      crumbs={[{ name: cat.name, href }, { name: subcat.name }]}
      base={{ category: cat.id, subcategory: subcat.id }}
      sp={sp}
      links={[{ name: "Все", href }, ...subcategoriesOf(db, cat.id).map((s) => ({ name: s.name, href: `${href}/${s.slug}` }))]}
      activeLink={`${href}/${subcat.slug}`}
    />
  );
}
