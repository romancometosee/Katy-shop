"use client";
import Link from "next/link";
import { useCart } from "./CartProvider";
import ProductImage from "./ProductImage";
import { HeartIcon, StarIcon } from "./Icons";
import ShadeDots from "./ShadeDots";
import { rub } from "@/lib/format";
import type { ProductView } from "@/lib/catalog";

export default function ProductCard({ p }: { p: ProductView }) {
  const { add, favorites, toggleFavorite } = useCart();
  const fav = favorites.includes(p.id);
  const cheapest = [...p.variants].sort((a, b) => a.price - b.price)[0];
  const many = p.variants.length > 1;

  return (
    <div className="group relative flex flex-col">
      <div className="relative">
      <Link href={`/product/${p.slug}`} className="relative block aspect-[5/6] overflow-hidden rounded-3xl bg-sand">
        <ProductImage images={p.images} art={p.art} label={p.brandName} className="transition duration-500 group-hover:scale-105" />
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {p.discountPercent > 0 && <span className="rounded-full bg-rose px-2.5 py-1 text-[11px] font-bold text-white">−{p.discountPercent}%</span>}
          {p.isNew && <span className="rounded-full bg-ink px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white">Новинка</span>}
          {p.isHit && <span className="rounded-full bg-gold px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white">Хит</span>}
        </div>
      </Link>
      {/* быстрое добавление в корзину — выезжает снизу при наведении на фото */}
      {!many && (
        <button
          onClick={() => add({ productId: p.id, variantId: cheapest.id, slug: p.slug, name: p.name, brandName: p.brandName, variantLabel: cheapest.label, price: cheapest.price, oldPrice: cheapest.oldPrice, image: p.images[0], art: p.art })}
          className="absolute inset-x-3 bottom-3 hidden translate-y-2 rounded-full bg-ink/90 py-2.5 text-xs font-semibold text-white opacity-0 backdrop-blur transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 md:block"
        >
          Быстро в корзину
        </button>
      )}
      </div>
      <button
        onClick={() => toggleFavorite(p.id)}
        className={`absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 shadow-sm transition hover:scale-110 ${fav ? "text-rose" : "text-ink"}`}
        aria-label="В избранное"
      >
        <HeartIcon className={`h-5 w-5 ${fav ? "fill-current" : ""}`} />
      </button>
      <div className="flex flex-1 flex-col px-1 pt-4">
        <p className="text-[11px] font-bold uppercase tracking-[.15em] text-ink-soft">{p.brandName}</p>
        <Link href={`/product/${p.slug}`} className="mt-1 line-clamp-2 text-[15px] leading-snug hover:text-rose">{p.name}</Link>
        {p.shades && (
          <div className="mt-2">
            <ShadeDots shades={p.shades} current={p.slug} size="h-4 w-4" />
          </div>
        )}
        {many && (
          <div className="mt-2 flex flex-wrap gap-1">
            {p.variants.slice(0, 4).map((v) => <span key={v.id} className="rounded-md bg-sand px-1.5 py-0.5 text-[11px] text-ink-soft">{v.label.replace("Тестер ", "T ")}</span>)}
          </div>
        )}
        <div className="mt-1.5 flex items-center gap-1 text-xs text-ink-soft">
          <StarIcon className="h-3.5 w-3.5 text-gold" /> {p.rating.toFixed(1)} · {p.reviewsCount} отз.
        </div>
        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <div>
            {p.oldPrice && <p className="text-xs text-ink-soft line-through">{rub(p.oldPrice)}</p>}
            <p className={`text-lg font-semibold ${p.oldPrice ? "text-rose" : ""}`}>{many ? "от " : ""}{rub(p.price)}</p>
          </div>
          {many ? (
            <Link href={`/product/${p.slug}`} className="rounded-full border border-ink/15 px-4 py-2 text-xs font-semibold transition hover:bg-ink hover:text-white">Выбрать</Link>
          ) : (
            <button
              onClick={() =>
                add({ productId: p.id, variantId: cheapest.id, slug: p.slug, name: p.name, brandName: p.brandName, variantLabel: cheapest.label, price: cheapest.price, oldPrice: cheapest.oldPrice, image: p.images[0], art: p.art })
              }
              className="rounded-full bg-ink px-4 py-2 text-xs font-semibold text-white transition hover:bg-black"
            >
              В корзину
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
