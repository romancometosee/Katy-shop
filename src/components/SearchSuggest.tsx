"use client";
/* eslint-disable @next/next/no-img-element */
// Подсказки при вводе в поиск: товары с фото и ценой сразу под строкой поиска,
// ссылка на все результаты и вопрос консультанту Katy.
import Link from "next/link";
import { useEffect, useState } from "react";
import { rub } from "@/lib/format";
import { openAskKaty } from "./AskKaty";
import type { ProductView } from "@/lib/catalog";

export default function SearchSuggest({ q, open, onClose }: { q: string; open: boolean; onClose: () => void }) {
  const [items, setItems] = useState<ProductView[]>([]);
  const query = q.trim();

  useEffect(() => {
    if (query.length < 2) {
      setItems([]);
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      fetch(`/api/products?limit=6&words=${encodeURIComponent(query)}`, { signal: ctrl.signal })
        .then((r) => r.json())
        .then(setItems)
        .catch(() => {});
    }, 180);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [query]);

  if (!open || query.length < 2) return null;
  return (
    <div className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-3xl border border-line bg-white shadow-2xl animate-fade-up">
      {items.length > 0 ? (
        <ul className="max-h-[60vh] overflow-y-auto p-2">
          {items.map((p) => (
            <li key={p.id}>
              <Link href={`/product/${p.slug}`} onClick={onClose} className="flex items-center gap-3 rounded-2xl p-2 transition hover:bg-sand">
                <span className="h-12 w-10 shrink-0 overflow-hidden rounded-lg bg-white">
                  {p.images[0] ? <img src={p.images[0]} alt="" referrerPolicy="no-referrer" className="h-full w-full object-contain brightness-[1.08]" /> : null}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-ink-soft">{p.brandName}</span>
                  <span className="block truncate text-sm">{p.name}</span>
                </span>
                <span className={`shrink-0 text-sm font-semibold ${p.oldPrice ? "text-rose" : ""}`}>{p.variants.length > 1 ? "от " : ""}{rub(p.price)}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="px-5 py-4 text-sm text-ink-soft">Ничего не нашлось по словам «{query}». Попробуйте другое слово или спросите Katy.</p>
      )}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-cream/60 px-4 py-3 text-sm">
        <Link href={`/search?q=${encodeURIComponent(query)}`} onClick={onClose} className="font-semibold hover:text-rose">Все результаты →</Link>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => { onClose(); openAskKaty(query); }} className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-rose">
          ✦ Спросить Katy
        </button>
      </div>
    </div>
  );
}
