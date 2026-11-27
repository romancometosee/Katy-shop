import Link from "next/link";
import { Suspense } from "react";
import Breadcrumbs from "./Breadcrumbs";
import FilterPanel, { type FacetOption } from "./FilterPanel";
import SortSelect from "./SortSelect";
import ProductCard from "./ProductCard";
import Pager from "./Pager";
import AskKatyButton from "./AskKatyButton";

const PER_PAGE = 48;
import { genderLabel, isDecant, searchProducts, type Filters } from "@/lib/catalog";
import type { Database } from "@/lib/types";
import { plural } from "@/lib/format";

export type SP = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const list = (v: string | string[] | undefined) => (one(v) ?? "").split(",").filter(Boolean);

export function filtersFromParams(sp: SP): Filters {
  const num = (v?: string) => (v && !isNaN(+v) ? +v : undefined);
  return {
    brands: list(sp.brand),
    genders: list(sp.gender),
    families: list(sp.family),
    priceMin: num(one(sp.min)),
    priceMax: num(one(sp.max)),
    sale: !!one(sp.sale),
    hit: !!one(sp.hit),
    isNew: !!one(sp.new),
    decant: !!one(sp.decant),
    collection: one(sp.collection),
    sort: (one(sp.sort) as Filters["sort"]) || "popular",
    q: one(sp.q),
  };
}

export default function CatalogView({
  db,
  title,
  description,
  crumbs,
  base,
  sp,
  links,
  activeLink,
  hero,
  hideTitle,
}: {
  db: Database;
  title: string;
  description?: string;
  crumbs: { name: string; href?: string }[];
  base: Filters;
  sp: SP;
  links?: { name: string; href: string }[];
  activeLink?: string;
  hero?: React.ReactNode;
  /** заголовок уже есть в шапке (страница бренда) */
  hideTitle?: boolean;
}) {
  const f = { ...filtersFromParams(sp), ...Object.fromEntries(Object.entries(base).filter(([, v]) => v !== undefined)) } as Filters;
  const products = searchProducts(db, f);
  const pages = Math.max(1, Math.ceil(products.length / PER_PAGE));
  const page = Math.min(pages, Math.max(1, parseInt(one(sp.page) ?? "1") || 1));
  const shown = products.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const all = searchProducts(db, { ...base, q: base.q ?? f.q });

  const count = (key: (p: (typeof all)[number]) => string | undefined) => {
    const m = new Map<string, number>();
    all.forEach((p) => { const k = key(p); if (k) m.set(k, (m.get(k) ?? 0) + 1); });
    return m;
  };
  const brandCounts = count((p) => p.brandId);
  const brands: FacetOption[] = db.brands.filter((b) => brandCounts.has(b.id)).map((b) => ({ value: b.id, label: b.name, count: brandCounts.get(b.id)! })).sort((a, b) => a.label.localeCompare(b.label));
  const gCounts = count((p) => p.gender);
  const genders: FacetOption[] = ["women", "men", "unisex"].filter((g) => gCounts.has(g)).map((g) => ({ value: g, label: genderLabel[g], count: gCounts.get(g)! }));
  const famCounts = count((p) => p.family);
  const families: FacetOption[] = [...famCounts.entries()].map(([v, c]) => ({ value: v, label: v, count: c })).sort((a, b) => b.count - a.count);
  const prices = all.map((p) => p.price);
  const priceRange: [number, number] = [prices.length ? Math.min(...prices) : 0, prices.length ? Math.max(...prices) : 0];

  return (
    <div className="container-x pt-8">
      <Breadcrumbs items={crumbs} />
      {hero}
      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          {hideTitle ? <p className="h-display text-3xl">{title}</p> : <h1 className="h-display text-5xl sm:text-6xl">{title}</h1>}
          {description && <p className="mt-3 max-w-2xl text-ink-soft">{description}</p>}
        </div>
        <p className="text-sm text-ink-soft">{products.length} {plural(products.length, "товар", "товара", "товаров")}</p>
      </div>

      {links && links.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-1.5 sm:gap-2">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={`chip shrink-0 px-3 py-1.5 text-[13px] sm:px-4 sm:py-2 sm:text-sm ${activeLink === l.href ? "chip-active" : ""}`}>{l.name}</Link>
          ))}
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr]">
        <Suspense>
          <FilterPanel brands={brands} genders={genders} families={families} priceRange={priceRange} decants={all.some((v) => v.variants.some((x) => isDecant(x.label)))} />
        </Suspense>
        <div>
          <div className="mb-6 flex justify-end">
            <Suspense><SortSelect /></Suspense>
          </div>
          {products.length === 0 ? (
            <div>
              <div className="card p-8 text-center sm:p-12">
                <p className="h-display text-3xl">Ничего не нашли</p>
                <p className="mx-auto mt-2 max-w-md text-ink-soft">
                  {base.q ? "Возможно, этого товара пока нет на сайте — но он может быть в магазине. Спросите Katy или загляните в разделы." : "Попробуйте изменить фильтры или поискать по-другому."}
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  {base.q && <AskKatyButton query={String(base.q)} label="Спросить Katy" className="btn-dark px-5 py-2.5" />}
                  {db.categories.filter((c) => !c.parentId).sort((a, b) => a.order - b.order).map((c) => (
                    <Link key={c.id} href={`/catalog/${c.slug}`} className="rounded-full border border-line px-4 py-2 text-sm hover:border-ink">{c.name}</Link>
                  ))}
                </div>
              </div>
              {(() => {
                const hits = searchProducts(db, {}).filter((p) => p.isHit).slice(0, 4);
                return hits.length > 0 && (
                  <div className="mt-10">
                    <p className="h-display mb-6 text-3xl">Чаще всего покупают</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 xl:grid-cols-4">{hits.map((p) => <ProductCard key={p.id} p={p} />)}</div>
                  </div>
                );
              })()}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 xl:grid-cols-4">
                {shown.map((p) => <ProductCard key={p.id} p={p} />)}
              </div>
              <Pager page={page} pages={pages} params={sp} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
