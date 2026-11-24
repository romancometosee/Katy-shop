import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getDb } from "@/lib/db";

export const metadata = { title: "Бренды А–Я" };

export default async function BrandsPage() {
  const db = await getDb();
  const counts = new Map<string, number>();
  db.products.filter((p) => p.isActive).forEach((p) => counts.set(p.brandId, (counts.get(p.brandId) ?? 0) + 1));
  const brands = [...db.brands].sort((a, b) => a.name.localeCompare(b.name));
  const groups = new Map<string, typeof brands>();
  brands.forEach((b) => {
    const l = b.name[0].toUpperCase();
    groups.set(l, [...(groups.get(l) ?? []), b]);
  });
  const letters = [...groups.keys()];
  return (
    <div className="container-x pt-8">
      <Breadcrumbs items={[{ name: "Бренды" }]} />
      <h1 className="h-display mt-6 text-5xl sm:text-6xl">Бренды А–Я</h1>
      <p className="mt-3 text-ink-soft">Все марки нашего магазина — от легендарных домов до редкой ниши.</p>

      <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-3 lg:grid-cols-6">
        {brands.filter((b) => b.isPopular).slice(0, 12).map((b) => (
          <Link key={b.id} href={`/brands/${b.slug}`} className="grid h-24 place-items-center bg-white px-3 text-center font-serif text-xl transition hover:bg-sand">{b.name}</Link>
        ))}
      </div>

      <div className="sticky top-[132px] z-10 mt-10 flex flex-wrap gap-1 bg-cream/95 py-3 backdrop-blur">
        {letters.map((l) => (
          <a key={l} href={`#l-${l}`} className="grid h-9 w-9 place-items-center rounded-full border border-line bg-white text-sm font-semibold hover:bg-ink hover:text-white">{l}</a>
        ))}
      </div>

      <div className="mt-6 space-y-10">
        {letters.map((l) => (
          <div key={l} id={`l-${l}`} className="grid scroll-mt-48 gap-4 border-t border-line pt-6 sm:grid-cols-[80px_1fr]">
            <p className="h-display text-5xl text-gold">{l}</p>
            <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
              {groups.get(l)!.map((b) => (
                <li key={b.id}>
                  <Link href={`/brands/${b.slug}`} className="group flex items-baseline justify-between gap-2">
                    <span className="text-lg group-hover:text-rose">{b.name}</span>
                    <span className="text-xs text-ink-soft">{counts.get(b.id) ?? 0}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
