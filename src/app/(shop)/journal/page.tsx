import Breadcrumbs from "@/components/Breadcrumbs";
import JournalCard from "@/components/JournalCard";
import { getDb } from "@/lib/db";
import { articles } from "@/lib/journal";
import { articleImages } from "@/lib/journal-images";

export const metadata = { title: "Журнал Katy — советы и подборки", description: "Как выбрать аромат, ухаживать за кожей, волосами и ногтями. Советы и подборки от консультантов Katy." };

export default async function JournalPage() {
  const db = await getDb();
  const [first, ...rest] = articles;
  return (
    <div className="container-x pt-8">
      <Breadcrumbs items={[{ name: "Журнал" }]} />
      <p className="mt-6 text-xs font-semibold uppercase tracking-[.28em] text-rose">Советы и подборки</p>
      <h1 className="h-display mt-2 text-5xl sm:text-6xl">Журнал Katy</h1>
      <p className="mt-3 max-w-xl text-ink-soft">Рассказываем, как выбирать и правильно использовать косметику и ароматы. Коротко и по делу.</p>
      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <JournalCard a={first} images={articleImages(db, first)} big />
        <div className="grid gap-8 sm:grid-cols-2">
          {rest.slice(0, 2).map((a) => <JournalCard key={a.slug} a={a} images={articleImages(db, a)} />)}
        </div>
      </div>
      <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {rest.slice(2).map((a) => <JournalCard key={a.slug} a={a} images={articleImages(db, a)} />)}
      </div>
    </div>
  );
}
