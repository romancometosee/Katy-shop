"use client";
import { useEffect } from "react";
import { useCart } from "./CartProvider";
import ProductImage from "./ProductImage";
import { CloseIcon } from "./Icons";

/** Плашка «Добавлено в корзину»: появляется внизу на 3 секунды и не мешает выбирать дальше */
export default function AddedToast() {
  const { toast, hideToast, setDrawerOpen, count } = useCart();
  // пока видна плашка, на телефоне прячем кнопку Katy, чтобы они не накладывались
  useEffect(() => {
    if (toast) document.documentElement.dataset.toast = "1";
    else delete document.documentElement.dataset.toast;
  }, [toast]);
  if (!toast) return null;
  const { line, qty } = toast;
  return (
    <div key={toast.id} role="status" aria-live="polite" className="toast-in toast-pos fixed inset-x-3 z-[45] mx-auto flex max-w-md items-center gap-3 rounded-2xl bg-ink p-2.5 pr-3 text-white shadow-2xl sm:inset-x-auto sm:right-6 sm:top-28 sm:bottom-auto lg:top-44">
      <div className="h-12 w-10 shrink-0 overflow-hidden rounded-lg bg-white">
        <ProductImage images={line.image ? [line.image] : []} art={line.art} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">Добавлено в корзину{qty > 1 ? ` · ${qty} шт.` : ""}</p>
        <p className="truncate text-xs text-white/65">{line.brandName} {line.name}</p>
      </div>
      <button onClick={() => setDrawerOpen(true)} className="shrink-0 rounded-full bg-white px-3.5 py-2 text-xs font-semibold text-ink">Корзина · {count}</button>
      <button onClick={hideToast} className="-mr-1 shrink-0 p-1.5 text-white/60 hover:text-white" aria-label="Скрыть"><CloseIcon className="h-4 w-4" /></button>
    </div>
  );
}
