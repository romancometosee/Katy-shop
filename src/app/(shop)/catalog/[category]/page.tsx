import { notFound } from "next/navigation";
import CatalogView, { type SP } from "@/components/CatalogView";
import { getDb } from "@/lib/db";
import { subcategoriesOf } from "@/lib/catalog";

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const db = await getDb();
  return { title: db.categories.find((c) => !c.parentId && c.slug === category)?.name };
}

export default async function CategoryPage({ params, searchParams }: { params: Promise<{ category: string }>; searchParams: Promise<SP> }) {
  const { category } = await params;
  const sp = await searchParams;
  const db = await getDb();
  const cat = db.categories.find((c) => !c.parentId && c.slug === category);
  if (!cat) notFound();
  const subs = subcategoriesOf(db, cat.id);
  const href = `/catalog/${cat.slug}`;
  return (
    <CatalogView
      db={db}
      title={cat.name}
      description={cat.description}
      crumbs={[{ name: cat.name }]}
      base={{ category: cat.id }}
      sp={sp}
      links={[{ name: "Все", href }, ...subs.map((s) => ({ name: s.name, href: `${href}/${s.slug}` }))]}
      activeLink={href}
    />
  );
}
