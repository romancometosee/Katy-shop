import type { Brand } from "@/lib/types";

// Шапка страницы бренда: фото (если есть), год, страна и история с «Читать полностью»
export default function BrandHero({ brand, count }: { brand: Brand; count: number }) {
  const paras = (brand.story || brand.description || "").split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
  const facts = [brand.country, brand.founded && `с ${brand.founded} года`, `${count} ${count % 10 === 1 && count % 100 !== 11 ? "позиция" : [2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100) ? "позиции" : "позиций"} в Katy`].filter(Boolean);
  return (
    <section className="mt-6 overflow-hidden rounded-3xl bg-ink text-cream">
      <div className={`grid ${brand.image ? "md:grid-cols-2" : ""}`}>
        {brand.image && (
          <div className="relative aspect-[4/3] md:aspect-auto">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={brand.image} alt={brand.name} className="absolute inset-0 h-full w-full object-cover" />
          </div>
        )}
        <div className="p-7 sm:p-10 lg:p-14">
          <p className="text-xs font-semibold uppercase tracking-[.28em] text-gold-light">{facts.join(" · ")}</p>
          <h1 className="h-display mt-4 text-5xl leading-none tracking-[.04em] sm:text-7xl">{brand.name}</h1>
          {paras.length > 0 && (
            <div className="mt-6 max-w-2xl text-cream/80">
              <p>{paras[0]}</p>
              {paras.length > 1 && (
                <details className="group mt-3">
                  <summary className="cursor-pointer list-none text-sm font-semibold text-cream underline underline-offset-4 group-open:hidden">Читать историю полностью</summary>
                  <div className="space-y-3">{paras.slice(1).map((p, i) => <p key={i}>{p}</p>)}</div>
                </details>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
