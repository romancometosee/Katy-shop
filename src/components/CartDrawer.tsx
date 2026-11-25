"use client";
import Link from "next/link";
import { useCart } from "./CartProvider";
import ProductImage from "./ProductImage";
import { CloseIcon, GiftIcon, MinusIcon, PlusIcon, TrashIcon } from "./Icons";
import { rub } from "@/lib/format";
import PromoHints from "./PromoHints";
import { useCartQuote } from "./useCartQuote";
import { useOverlay } from "./useOverlay";

export default function CartDrawer({ freeDeliveryFrom, giftText }: { freeDeliveryFrom: number; giftText: string }) {
  const { lines, subtotal, setQty, remove, drawerOpen, setDrawerOpen } = useCart();
  const quote = useCartQuote(lines, drawerOpen);
  useOverlay(drawerOpen, () => setDrawerOpen(false));
  if (!drawerOpen) return null;
  const total = subtotal - quote.total;
  const left = quote.freeDelivery ? 0 : Math.max(0, freeDeliveryFrom - total);
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
      <aside className="absolute inset-y-0 right-0 flex w-[92%] max-w-md flex-col bg-cream shadow-2xl sm:w-full">
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <h2 className="h-display text-2xl">Корзина</h2>
          <button onClick={() => setDrawerOpen(false)} aria-label="Закрыть"><CloseIcon className="h-6 w-6" /></button>
        </div>
        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <p className="h-display text-2xl">Пока пусто</p>
            <p className="text-sm text-ink-soft">Загляните в каталог — там более 5000 ароматов и средств ухода.</p>
            <Link href="/catalog/parfyumeriya" onClick={() => setDrawerOpen(false)} className="btn-dark">В каталог</Link>
          </div>
        ) : (
          <>
            <div className="space-y-3 border-b border-line bg-white px-6 py-4 text-sm">
              <div className="flex items-center gap-2 text-rose"><GiftIcon className="h-4 w-4" /> Подарок к заказу: {giftText.toLowerCase()}</div>
              {left > 0 ? (
                <div>
                  <p className="text-ink-soft">До бесплатной доставки осталось <b className="text-ink">{rub(left)}</b></p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-sand">
                    <div className="h-full rounded-full bg-gold" style={{ width: `${Math.min(100, (subtotal / freeDeliveryFrom) * 100)}%` }} />
                  </div>
                </div>
              ) : (
                <p className="font-semibold text-emerald-700">Доставка бесплатная 🎉</p>
              )}
              <PromoHints quote={quote} onNavigate={() => setDrawerOpen(false)} />
            </div>
            <ul className="flex-1 divide-y divide-line overflow-y-auto px-6">
              {lines.map((l) => (
                <li key={l.variantId} className="flex gap-4 py-4">
                  <Link href={l.slug.startsWith("/") ? l.slug : `/product/${l.slug}`} onClick={() => setDrawerOpen(false)} className="h-24 w-20 shrink-0 overflow-hidden rounded-xl">
                    <ProductImage images={l.image ? [l.image] : []} art={l.art} />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-soft">{l.brandName}</p>
                    <p className="truncate text-sm font-medium">{l.name}</p>
                    <p className="text-xs text-ink-soft">{l.variantLabel}</p>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center rounded-full border border-line bg-white">
                        <button className="p-2" onClick={() => setQty(l.variantId, l.qty - 1)} aria-label="Меньше"><MinusIcon className="h-3.5 w-3.5" /></button>
                        <span className="w-6 text-center text-sm">{l.qty}</span>
                        <button className="p-2" onClick={() => setQty(l.variantId, l.qty + 1)} aria-label="Больше"><PlusIcon className="h-3.5 w-3.5" /></button>
                      </div>
                      <div className="text-right">
                        {l.oldPrice && <p className="text-xs text-ink-soft line-through">{rub(l.oldPrice * l.qty)}</p>}
                        <p className="font-semibold">{rub(l.price * l.qty)}</p>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => remove(l.variantId)} className="-m-1.5 self-start p-2.5 text-ink-soft hover:text-rose" aria-label="Удалить"><TrashIcon className="h-4 w-4" /></button>
                </li>
              ))}
            </ul>
            <div className="border-t border-line bg-white px-6 py-5">
              {quote.discounts.map((d) => (
                <div key={d.promoId} className="mb-1.5 flex items-center justify-between gap-3 text-sm text-rose">
                  <span className="truncate">{d.title}</span>
                  <span className="shrink-0">−{rub(d.amount)}</span>
                </div>
              ))}
              <div className="mb-4 flex items-center justify-between text-lg">
                <span>Итого</span>
                <span className="font-semibold">{rub(total)}</span>
              </div>
              <Link href="/checkout" onClick={() => setDrawerOpen(false)} className="btn-dark w-full">Оформить заказ</Link>
              <div className="mt-3 flex items-center justify-between text-sm">
                <button onClick={() => setDrawerOpen(false)} className="text-ink-soft underline underline-offset-4 hover:text-ink">← Продолжить покупки</button>
                <Link href="/cart" onClick={() => setDrawerOpen(false)} className="text-ink-soft underline underline-offset-4 hover:text-ink">Перейти в корзину</Link>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
