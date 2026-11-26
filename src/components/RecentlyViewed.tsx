"use client";
/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useEffect, useState } from "react";
import { rub } from "@/lib/format";

// «Вы недавно смотрели»: последние товары запоминаются в браузере покупателя (без регистрации).
export type Seen = { slug: string; name: string; brand: string; image?: string; price: number; cat?: string };
const KEY = "katy-seen";

function read(): Seen[] {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}

/** Ставится на страницу товара: запоминает его */
export function TrackView({ item }: { item: Seen }) {
  useEffect(() => {
    try {
      const list = [item, ...read().filter((x) => x.slug !== item.slug)].slice(0, 12);
      localStorage.setItem(KEY, JSON.stringify(list));
    } catch {}
  }, [item]);
  return null;
}

/** Лента «Вы недавно смотрели». Если просмотренных мало, ряд дополняется рекомендациями —
 *  сначала из тех же разделов, что человек смотрел, — чтобы справа не оставалось пустого места. */
const ROW = 6;
export default function RecentlyViewed({ exclude, bare, fill = [] }: { exclude?: string; bare?: boolean; fill?: Seen[] }) {
  const [items, setItems] = useState<Seen[]>([]);
  useEffect(() => setItems(read().filter((x) => x.slug !== exclude)), [exclude]);
  if (items.length === 0) return null;
  const cats = new Set(items.map((x) => x.cat).filter(Boolean));
  const seen = new Set([...items.map((x) => x.slug), exclude]);
  const extra = items.length >= ROW ? [] : fill
    .filter((x) => !seen.has(x.slug))
    .sort((a, b) => Number(cats.has(b.cat)) - Number(cats.has(a.cat)))
    .slice(0, ROW - items.length);
  const card = (s: Seen) => (
    <Link key={s.slug} href={`/product/${s.slug}`} className="group block w-40 shrink-0 snap-start sm:w-48">
      <div className="aspect-square overflow-hidden rounded-2xl bg-white">
        {s.image ? (
          <img src={s.image} alt="" referrerPolicy="no-referrer" className="h-full w-full object-contain p-3 brightness-[1.08] contrast-[1.03] transition duration-500 group-hover:scale-105" />
        ) : (
          <div className="grid h-full place-items-center p-3 text-center text-xs uppercase tracking-widest text-ink/60">{s.brand}</div>
        )}
      </div>
      <p className="mt-2 text-[11px] font-bold uppercase tracking-wider text-ink-soft">{s.brand}</p>
      <p className="line-clamp-1 text-sm">{s.name}</p>
      <p className="text-sm font-semibold">{rub(s.price)}</p>
    </Link>
  );
  return (
    <section className={`${bare ? "" : "container-x"} mt-14 sm:mt-20`}>
      <p className="mb-2 text-xs font-semibold uppercase tracking-[.25em] text-gold">Для вас</p>
      <h2 className="h-display mb-6 text-3xl sm:text-4xl">{extra.length ? "Вы смотрели и вам может понравиться" : "Вы недавно смотрели"}</h2>
      <div className="no-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
        {items.map(card)}
        {extra.length > 0 && (
          <>
            <div className="flex w-8 shrink-0 items-center justify-center" aria-hidden>
              <span className="h-3/5 w-px bg-line" />
            </div>
            {extra.map((s) => (
              <div key={s.slug} className="relative w-40 shrink-0 snap-start sm:w-48">
                <span className="absolute left-2 top-2 z-10 rounded-full bg-sand px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-ink-soft">Совет Katy</span>
                {card(s)}
              </div>
            ))}
          </>
        )}
      </div>
    </section>
  );
}
