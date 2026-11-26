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

/** Блок «Подобрали для вас»: ряд рекомендаций (сначала из разделов, которые человек смотрел).
 *  Справа в заголовке — кнопка «Вы смотрели · N» с миниатюрами; по нажатию поверх ряда
 *  выезжает лента всех просмотренных товаров с кнопкой «Свернуть». */
const ROW = 8;
function Card({ s, tag }: { s: Seen; tag?: string }) {
  return (
    <Link href={`/product/${s.slug}`} className="group relative block w-40 shrink-0 snap-start sm:w-48">
      {tag && <span className="absolute left-2 top-2 z-10 rounded-full bg-sand px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-ink-soft">{tag}</span>}
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
}
export default function RecentlyViewed({ exclude, bare, fill = [] }: { exclude?: string; bare?: boolean; fill?: Seen[] }) {
  const [items, setItems] = useState<Seen[]>([]);
  const [open, setOpen] = useState(false);
  useEffect(() => setItems(read().filter((x) => x.slug !== exclude)), [exclude]);
  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [open]);
  if (items.length === 0) return null;
  const cats = new Set(items.map((x) => x.cat).filter(Boolean));
  const seen = new Set([...items.map((x) => x.slug), exclude]);
  const picks = fill
    .filter((x, i, a) => !seen.has(x.slug) && a.findIndex((y) => y.slug === x.slug) === i)
    .sort((a, b) => Number(cats.has(b.cat)) - Number(cats.has(a.cat)))
    .slice(0, ROW);
  // Нечего рекомендовать (например, на странице товара без подборки) — показываем просмотренные как раньше.
  const onlySeen = picks.length === 0;
  return (
    <section className={`${bare ? "" : "container-x"} mt-14 sm:mt-20`}>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[.25em] text-gold">Для вас</p>
          <h2 className="h-display text-3xl sm:text-4xl">{onlySeen ? "Вы недавно смотрели" : open ? "Вы недавно смотрели" : "Подобрали для вас"}</h2>
        </div>
        {!onlySeen && (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="flex shrink-0 items-center gap-2 rounded-full border border-line bg-white py-1.5 pl-1.5 pr-4 text-sm font-medium shadow-sm transition hover:border-ink/40"
          >
            {open ? (
              <>
                <span className="grid h-8 w-8 place-items-center rounded-full bg-sand text-base leading-none">×</span>
                Свернуть
              </>
            ) : (
              <>
                <span className="flex -space-x-3">
                  {items.slice(0, 3).map((s) => (
                    <span key={s.slug} className="grid h-8 w-8 place-items-center overflow-hidden rounded-full border-2 border-white bg-sand text-[8px] uppercase">
                      {s.image ? <img src={s.image} alt="" referrerPolicy="no-referrer" className="h-full w-full object-contain p-0.5" /> : s.brand.slice(0, 2)}
                    </span>
                  ))}
                </span>
                <span>Вы смотрели <span className="text-ink-soft">· {items.length}</span></span>
              </>
            )}
          </button>
        )}
      </div>
      <div className="relative">
        <div className={`no-scrollbar -mx-4 flex snap-x scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 transition duration-300 sm:mx-0 sm:px-0 ${open ? "pointer-events-none opacity-0" : "opacity-100"}`}>
          {(onlySeen ? items : picks).map((s) => <Card key={s.slug} s={s} />)}
        </div>
        {!onlySeen && (
          <div
            className={`absolute inset-0 -mx-2 rounded-3xl bg-cream px-2 transition duration-300 sm:-mx-4 sm:px-4 ${open ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"}`}
            aria-hidden={!open}
          >
            <div className="no-scrollbar flex h-full snap-x gap-4 overflow-x-auto pb-2">
              {items.map((s) => <Card key={s.slug} s={s} />)}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
