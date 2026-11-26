import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getDb } from "@/lib/db";
import { searchProducts, subcategoriesOf, topCategories } from "@/lib/catalog";
import { plural } from "@/lib/format";

export const metadata = { title: "Каталог" };

// Все разделы одной страницей — на случай, если человек набрал /catalog или пришёл из поиска
export default async function CatalogIndex() {
  const db = await getDb();
  return (
    <div className="container-x pt-8">
      <Breadcrumbs items={[{ name: "Каталог" }]} />
      <h1 className="h-display mt-6 text-4xl sm:text-5xl">Каталог</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {topCategories(db).map((c) => {
          const n = searchProducts(db, { category: c.id }).length;
          return (
            <div key={c.id} className="rounded-3xl p-6" style={{ background: c.art.bg }}>
              <Link href={`/catalog/${c.slug}`} className="group flex items-baseline justify-between gap-3">
                <span className="h-display text-3xl group-hover:underline">{c.name}</span>
                <span className="shrink-0 text-sm text-ink-soft">{n} {plural(n, "товар", "товара", "товаров")}</span>
              </Link>
              <ul className="mt-4 flex flex-wrap gap-2">
                {subcategoriesOf(db, c.id).map((s) => (
                  <li key={s.id}><Link href={`/catalog/${c.slug}/${s.slug}`} className="chip bg-white/70 px-3 py-1 text-sm">{s.name}</Link></li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
