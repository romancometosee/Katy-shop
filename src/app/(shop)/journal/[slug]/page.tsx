import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import JournalCard from "@/components/JournalCard";
import PhotoFan from "@/components/PhotoFan";
import ProductCard from "@/components/ProductCard";
import { AskKatyButton } from "@/components/AskKaty";
import { getDb } from "@/lib/db";
import { searchProducts } from "@/lib/catalog";
import { dateRu } from "@/lib/format";
import { articles, findArticle } from "@/lib/journal";
import { articleImages } from "@/lib/journal-images";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const a = findArticle((await params).slug);
  return a ? { title: `${a.title} — Журнал Katy`, description: a.lead } : {};
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const a = findArticle((await params).slug);
  if (!a) notFound();
  const db = await getDb();
  const ids = a.products.map((s) => db.products.find((p) => p.slug === s)?.id).filter(Boolean) as string[];
  const products = searchProducts(db, { ids });
  const more = articles.filter((x) => x.slug !== a.slug).slice(0, 3);
  return (
    <div className="container-x pt-8">
      <Breadcrumbs items={[{ name: "Журнал", href: "/journal" }, { name: a.title }]} />
      <article className="mx-auto mt-8 max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[.25em] text-rose">{a.tag} · {a.minutes} мин чтения</p>
        <h1 className="h-display mt-3 text-4xl leading-tight sm:text-6xl">{a.title}</h1>
        <p className="mt-5 text-xl text-ink-soft">{a.lead}</p>
        <div className="relative mt-8 aspect-[16/8] overflow-hidden rounded-[2rem]" style={{ background: a.color }}>
          <div className="absolute inset-x-10 bottom-6 top-8">
            <PhotoFan images={articleImages(db, a)} className="h-full w-full" />
          </div>
        </div>
        <div className="mt-10 space-y-5 text-[17px] leading-relaxed">
          {a.body.map((t, i) => (t.startsWith("## ") ? <h2 key={i} className="h-display !mt-10 text-3xl">{t.slice(3)}</h2> : <p key={i}>{t}</p>))}
        </div>
        <p className="mt-8 text-sm text-ink-soft">{dateRu(a.date)}</p>
        <div className="mt-8 flex flex-wrap items-center gap-4 rounded-3xl bg-sand p-6">
          <p className="flex-1 text-sm">Остались вопросы? Katy подберёт средство под вашу кожу, волосы или повод.</p>
          <AskKatyButton className="btn-dark px-6 py-2.5">✦ Спросить Katy</AskKatyButton>
        </div>
      </article>

      {products.length > 0 && (
        <section className="mt-16">
          <h2 className="h-display text-3xl sm:text-4xl">Товары из статьи</h2>
          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
            {products.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        </section>
      )}

      <section className="mt-16">
        <div className="flex items-end justify-between">
          <h2 className="h-display text-3xl sm:text-4xl">Ещё в журнале</h2>
          <Link href="/journal" className="text-sm font-semibold hover:text-rose">Все статьи →</Link>
        </div>
        <div className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {more.map((x) => <JournalCard key={x.slug} a={x} images={articleImages(db, x)} />)}
        </div>
      </section>
    </div>
  );
}
