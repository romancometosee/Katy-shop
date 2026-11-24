"use client";
import { useState } from "react";
import { useCart } from "./CartProvider";
import { GiftIcon, HeartIcon, MinusIcon, PlusIcon, ShieldIcon, TruckIcon } from "./Icons";
import { rub } from "@/lib/format";
import type { ProductView } from "@/lib/catalog";

export default function ProductBuy({ p, giftText, freeDeliveryFrom }: { p: ProductView; giftText: string; freeDeliveryFrom: number }) {
  const { add, favorites, toggleFavorite } = useCart();
  const preferred = p.variants[Math.floor((p.variants.length - 1) / 2)];
  const firstAvailable = preferred?.stock > 0 ? preferred : p.variants.find((v) => v.stock > 0) ?? p.variants[0];
  const [vid, setVid] = useState(firstAvailable?.id);
  const [qty, setQty] = useState(1);
  const v = p.variants.find((x) => x.id === vid) ?? p.variants[0];
  const fav = favorites.includes(p.id);
  if (!v) return null;

  return (
    <div>
      <div className="flex items-end gap-3">
        <span className={`text-3xl font-semibold ${v.oldPrice ? "text-rose" : ""}`}>{rub(v.price)}</span>
        {v.oldPrice && <span className="pb-1 text-lg text-ink-soft line-through">{rub(v.oldPrice)}</span>}
        {v.oldPrice && <span className="mb-1.5 rounded-full bg-rose px-2.5 py-0.5 text-xs font-bold text-white">−{Math.round((1 - v.price / v.oldPrice) * 100)}%</span>}
      </div>
      {p.promoTitle && <p className="mt-1 text-sm font-semibold text-rose">Акция «{p.promoTitle}»</p>}

      {p.variants.length > 1 && (
        <div className="mt-6">
          <p className="label">Объём</p>
          <div className="flex flex-wrap gap-2">
            {p.variants.map((x) => (
              <button
                key={x.id}
                onClick={() => setVid(x.id)}
                disabled={x.stock <= 0}
                className={`rounded-2xl border px-4 py-3 text-left text-sm transition disabled:opacity-40 ${x.id === v.id ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-ink/40"}`}
              >
                <span className="block font-semibold">{x.label}</span>
                <span className={`text-xs ${x.id === v.id ? "text-white/70" : "text-ink-soft"}`}>{x.stock > 0 ? rub(x.price) : "нет в наличии"}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 flex gap-3">
        <div className="flex items-center rounded-full border border-line bg-white">
          <button className="p-3" onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Меньше"><MinusIcon className="h-4 w-4" /></button>
          <span className="w-6 text-center">{qty}</span>
          <button className="p-3" onClick={() => setQty(qty + 1)} aria-label="Больше"><PlusIcon className="h-4 w-4" /></button>
        </div>
        <button
          disabled={v.stock <= 0}
          onClick={() => add({ productId: p.id, variantId: v.id, slug: p.slug, name: p.name, brandName: p.brandName, variantLabel: v.label, price: v.price, oldPrice: v.oldPrice, image: p.images[0], art: p.art }, qty)}
          className="btn-dark flex-1 py-4"
        >
          {v.stock > 0 ? "Добавить в корзину" : "Нет в наличии"}
        </button>
        <button onClick={() => toggleFavorite(p.id)} className={`grid w-14 place-items-center rounded-full border border-line bg-white ${fav ? "text-rose" : ""}`} aria-label="В избранное">
          <HeartIcon className={`h-5 w-5 ${fav ? "fill-current" : ""}`} />
        </button>
      </div>

      <ul className="mt-6 space-y-3 rounded-3xl bg-white p-5 text-sm">
        <li className="flex items-center gap-3"><GiftIcon className="h-5 w-5 text-rose" /> Подарок к заказу: {giftText.toLowerCase()}</li>
        <li className="flex items-center gap-3"><ShieldIcon className="h-5 w-5 text-gold" /> Оригинал с гарантией подлинности</li>
        <li className="flex items-center gap-3"><TruckIcon className="h-5 w-5 text-ink-soft" /> Бесплатная доставка от {rub(freeDeliveryFrom)}</li>
      </ul>
    </div>
  );
}
