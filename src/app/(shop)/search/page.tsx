import CatalogView, { type SP } from "@/components/CatalogView";
import { getDb } from "@/lib/db";
import VoiceSearchForm from "@/components/VoiceSearchForm";

export const metadata = { title: "Поиск" };

export default async function SearchPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q) ?? "";
  const db = await getDb();
  return (
    <>
      <div className="container-x pt-8">
        <VoiceSearchForm key={q} variant="page" defaultValue={q} placeholder="Товар, бренд или нота — или скажите голосом" autoFocus={!q} />
      </div>
      <CatalogView db={db} title={q ? `«${q}»` : "Все товары"} description={q ? "Результаты поиска по названию, бренду и нотам" : undefined} crumbs={[{ name: "Поиск" }]} base={{ q }} sp={sp} />
    </>
  );
}
