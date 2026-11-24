import CatalogView, { type SP } from "@/components/CatalogView";
import { getDb } from "@/lib/db";

export const metadata = { title: "Поиск" };

export default async function SearchPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q) ?? "";
  const db = await getDb();
  return (
    <>
      <form action="/search" className="container-x pt-8">
        <input name="q" defaultValue={q} placeholder="Аромат, бренд или нота" className="input rounded-full py-4 text-base" autoFocus={!q} />
      </form>
      <CatalogView db={db} title={q ? `«${q}»` : "Все товары"} description={q ? "Результаты поиска по названию, бренду и нотам" : undefined} crumbs={[{ name: "Поиск" }]} base={{ q }} sp={sp} />
    </>
  );
}
