"use client";
/* eslint-disable @next/next/no-img-element */
// «Соберите уход»: текущий товар + дополняющие его средства, отмечаешь галочками
// и добавляешь всё в корзину одной кнопкой.
import Link from "next/link";
import { useState } from "react";
import { useCart } from "./CartProvider";
import ProductImage from "./ProductImage";
import { rub } from "@/lib/format";
import type { ProductView } from "@/lib/catalog";

type Step = { step: string; product: ProductView };

export default function RoutineBuilder({ title, current, currentStep, steps }: { title: string; current: ProductView; currentStep: string; steps: Step[] }) {
  const { add, setDrawerOpen } = useCart();
  const all: Step[] = [{ step: currentStep, product: current }, ...steps];
  const [on, setOn] = useState<boolean[]>(all.map(() => true));
  const pick = (p: ProductView) => [...p.variants].filter((v) => v.stock > 0).sort((a, b) => a.price - b.price)[0];
  const chosen = all.filter((_, i) => on[i]);
  const total = chosen.reduce((s, x) => s + (pick(x.product)?.price ?? 0), 0);

  return (
    <section className="reveal mt-14 overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#f7ede4] via-white to-[#f3e9f1] p-6 sm:p-10">
      <p className="text-xs font-semibold uppercase tracking-[.25em] text-rose">Подобрали к этому товару</p>
      <h2 className="h-display mt-2 text-3xl sm:text-4xl">{title}</h2>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-[repeat(var(--n),minmax(0,1fr))]" style={{ ["--n" as string]: all.length }}>
        {all.map((x, i) => {
          const v = pick(x.product);
          return (
            <div key={x.product.id} className={`relative flex flex-col rounded-3xl bg-white p-4 shadow-sm transition ${on[i] ? "" : "opacity-50"}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Шаг {i + 1} · {x.step}</span>
                <button
                  type="button"
                  onClick={() => setOn(on.map((o, j) => (j === i ? !o : o)))}
                  aria-label={on[i] ? "Убрать из набора" : "Добавить в набор"}
                  className={`relative flex h-6 w-6 items-center justify-center rounded-full border text-xs transition after:absolute after:-inset-2.5 after:content-[''] ${on[i] ? "border-ink bg-ink text-white" : "border-line bg-white"}`}
                >
                  {on[i] ? "✓" : ""}
                </button>
              </div>
              <Link href={`/product/${x.product.slug}`} className="mx-auto mt-3 block aspect-square w-32 overflow-hidden rounded-2xl">
                <ProductImage images={x.product.images} art={x.product.art} label={x.product.brandName} />
              </Link>
              <p className="mt-3 text-[11px] font-bold uppercase tracking-wider text-ink-soft">{x.product.brandName}</p>
              <Link href={`/product/${x.product.slug}`} className="line-clamp-2 text-sm hover:text-rose">{x.product.name}</Link>
              <p className="mt-auto pt-2 font-semibold">{v ? rub(v.price) : "нет в наличии"}{v && x.product.variants.length > 1 ? <span className="ml-1 text-xs font-normal text-ink-soft">· {v.label}</span> : null}</p>
              {i < all.length - 1 && <span className="absolute -right-3 top-1/2 z-10 hidden h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-cream text-ink-soft lg:flex">+</span>}
            </div>
          );
        })}
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-ink-soft">
          Выбрано {chosen.length} из {all.length} · <span className="text-lg font-semibold text-ink">{rub(total)}</span>
        </p>
        <button
          type="button"
          disabled={!chosen.length}
          onClick={() => {
            for (const x of chosen) {
              const v = pick(x.product);
              if (v) add({ productId: x.product.id, variantId: v.id, slug: x.product.slug, name: x.product.name, brandName: x.product.brandName, variantLabel: v.label, price: v.price, oldPrice: v.oldPrice, image: x.product.images[0], art: x.product.art, max: v.stock });
            }
            setDrawerOpen(true);
          }}
          className="btn-dark px-8 py-3 disabled:opacity-40"
        >
          Добавить набор в корзину
        </button>
      </div>
    </section>
  );
}
