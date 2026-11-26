import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getDb } from "@/lib/db";
import { legalDocs } from "@/lib/legal";

export async function generateMetadata({ params }: { params: Promise<{ doc: string }> }) {
  const { doc } = await params;
  const d = legalDocs((await getDb()).settings).find((x) => x.slug === doc);
  return { title: d?.title ?? "Документы" };
}

export default async function LegalPage({ params }: { params: Promise<{ doc: string }> }) {
  const { doc } = await params;
  const docs = legalDocs((await getDb()).settings);
  const d = docs.find((x) => x.slug === doc);
  if (!d) notFound();
  return (
    <div className="container-x max-w-3xl pt-8">
      <Breadcrumbs items={[{ name: d.title }]} />
      <h1 className="h-display mt-6 text-4xl sm:text-5xl">{d.title}</h1>
      <nav className="no-scrollbar -mx-4 mt-6 flex gap-2 overflow-x-auto px-4">
        {docs.map((x) => (
          <Link key={x.slug} href={`/legal/${x.slug}`} className={`chip shrink-0 px-4 py-1.5 text-sm ${x.slug === d.slug ? "chip-active" : ""}`}>{x.short}</Link>
        ))}
      </nav>
      <div className="mt-8 space-y-8 text-[16px] leading-relaxed">
        {d.sections.map((s) => (
          <section key={s.h}>
            <h2 className="text-lg font-semibold">{s.h}</h2>
            {s.p.map((p) => <p key={p} className="mt-2 text-ink/85">{p}</p>)}
          </section>
        ))}
      </div>
    </div>
  );
}
