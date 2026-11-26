"use client";
import { useState } from "react";
import { useCart, type CartLine } from "./CartProvider";

// «Повторить заказ»: кладёт в корзину всё, что есть в наличии, по сегодняшним ценам
export default function RepeatOrder({ lines, missing, label = "Повторить заказ" }: { lines: CartLine[]; missing: number; label?: string }) {
  const { add, setDrawerOpen } = useCart();
  const [done, setDone] = useState(false);
  if (!lines.length) return <span className="text-xs text-ink-soft">Этих товаров сейчас нет в наличии</span>;
  return (
    <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-1">
      <button
        type="button"
        onClick={() => {
          for (const { qty, ...l } of lines) add(l, qty);
          setDone(true);
          setDrawerOpen(true);
        }}
        className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-4 py-2 text-xs font-semibold transition hover:border-ink"
      >
        ↻ {done ? "Добавлено в корзину" : label}
      </button>
      {missing > 0 && <span className="text-xs text-ink-soft">{missing === 1 ? "1 товара" : `${missing} товаров`} сейчас нет — остальное добавим</span>}
    </span>
  );
}
