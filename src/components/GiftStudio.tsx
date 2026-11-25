"use client";
/* eslint-disable @next/next/no-img-element */
// Подарки: подарочный сертификат с живым предпросмотром и конструктор подарка
// (коробка → 2–5 товаров → открытка). Всё добавляется в корзину.
import { useMemo, useState } from "react";
import Link from "next/link";
import { useCart } from "./CartProvider";
import ProductImage from "./ProductImage";
import { rub } from "@/lib/format";
import { GIFT_AMOUNTS, GIFT_BOX, GIFT_BOXES, GIFT_DESIGNS, GIFT_MAX, GIFT_MIN } from "@/lib/club";
import type { ProductView } from "@/lib/catalog";

const rand = () => Math.random().toString(36).slice(2, 8);
const giftArt = { shape: "compact" as const, color: "#c9a46a", accent: "#1c1917", bg: "#f6eee3" };

export default function GiftStudio({ products, initialTab = "card" }: { products: ProductView[]; initialTab?: "card" | "box" }) {
  const [tab, setTab] = useState<"card" | "box">(initialTab);
  return (
    <div>
      <div className="inline-flex rounded-full bg-sand p-1">
        {([["card", "Подарочный сертификат"], ["box", "Собрать подарок"]] as const).map(([k, t]) => (
          <button key={k} type="button" onClick={() => setTab(k)} className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${tab === k ? "bg-ink text-white shadow" : "text-ink-soft hover:text-ink"}`}>
            {t}
          </button>
        ))}
      </div>
      <div className="mt-8">{tab === "card" ? <CardBuilder /> : <BoxBuilder products={products} />}</div>
    </div>
  );
}

function CardBuilder() {
  const { add } = useCart();
  const [amount, setAmount] = useState(3000);
  const [custom, setCustom] = useState("");
  const [design, setDesign] = useState(GIFT_DESIGNS[0]);
  const [to, setTo] = useState("");
  const [from, setFrom] = useState("");
  const [msg, setMsg] = useState("");
  const value = custom ? Number(custom.replace(/\D/g, "")) : amount;
  const valid = value >= GIFT_MIN && value <= GIFT_MAX;

  return (
    <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
      {/* предпросмотр */}
      <div className="lg:sticky lg:top-32 lg:self-start">
        <div className="relative mx-auto aspect-[1.6/1] w-full max-w-xl overflow-hidden rounded-[1.75rem] p-7 shadow-2xl transition-all duration-500 sm:p-9" style={{ background: design.bg, color: design.fg }}>
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full opacity-20 blur-2xl" style={{ background: design.fg }} />
          <div className="relative flex h-full flex-col">
            <div className="flex items-start justify-between">
              <div>
                <p className="h-display text-3xl tracking-[.3em] sm:text-4xl">KATY</p>
                <p className="mt-1 text-[10px] uppercase tracking-[.35em] opacity-70">подарочный сертификат</p>
              </div>
              <span className="text-2xl">✦</span>
            </div>
            <p className="h-display mt-auto text-5xl sm:text-6xl">{valid ? rub(value) : "— ₽"}</p>
            <div className="mt-3 flex items-end justify-between gap-4 text-sm opacity-90">
              <span className="line-clamp-2 max-w-[70%] italic">{msg || "Для самых красивых моментов"}</span>
              <span className="text-right text-xs">{to ? `для ${to}` : ""}{to && from ? <br /> : null}{from ? `от ${from}` : ""}</span>
            </div>
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-ink-soft">Сертификат действует год на весь ассортимент, в магазинах и на сайте.</p>
      </div>

      {/* настройки */}
      <div className="space-y-7">
        <div>
          <p className="mb-3 font-semibold">1. Сумма</p>
          <div className="flex flex-wrap gap-2">
            {GIFT_AMOUNTS.map((a) => (
              <button key={a} type="button" onClick={() => { setAmount(a); setCustom(""); }} className={`rounded-full border px-5 py-2.5 text-sm font-semibold transition ${!custom && amount === a ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-ink"}`}>
                {rub(a)}
              </button>
            ))}
            <input value={custom} onChange={(e) => setCustom(e.target.value)} inputMode="numeric" placeholder="Своя сумма" className="input w-36 rounded-full py-2.5" />
          </div>
          {custom && !valid && <p className="mt-2 text-xs text-rose">От {rub(GIFT_MIN)} до {rub(GIFT_MAX)}</p>}
        </div>
        <div>
          <p className="mb-3 font-semibold">2. Дизайн</p>
          <div className="grid grid-cols-4 gap-3">
            {GIFT_DESIGNS.map((d) => (
              <button key={d.id} type="button" onClick={() => setDesign(d)} className="text-left">
                <span className={`block aspect-[1.6/1] rounded-xl transition ${design.id === d.id ? "ring-2 ring-ink ring-offset-2 ring-offset-cream" : "hover:scale-105"}`} style={{ background: d.bg }} />
                <span className="mt-1.5 block text-xs text-ink-soft">{d.name}</span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-3 font-semibold">3. Подпись</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <input value={to} onChange={(e) => setTo(e.target.value.slice(0, 30))} placeholder="Кому, например «Анны»" className="input" />
            <input value={from} onChange={(e) => setFrom(e.target.value.slice(0, 30))} placeholder="От кого" className="input" />
          </div>
          <textarea value={msg} onChange={(e) => setMsg(e.target.value.slice(0, 140))} rows={2} placeholder="Пожелание (до 140 знаков)" className="input mt-3 resize-none" />
        </div>
        <button
          type="button"
          disabled={!valid}
          onClick={() =>
            add({
              productId: "gift-card",
              variantId: `gc-${value}-${design.id}-${rand()}`,
              slug: "/gift",
              name: "Подарочный сертификат Katy",
              brandName: "Katy",
              variantLabel: `${design.name}${to ? ` · для ${to}` : ""}`,
              price: value,
              art: { ...giftArt, bg: design.id === "noir" ? "#e9e4df" : giftArt.bg },
              note: [to && `Кому: ${to}`, from && `От: ${from}`, msg].filter(Boolean).join(" · ") || undefined,
            })
          }
          className="btn-dark w-full py-4 text-base disabled:opacity-40"
        >
          Добавить сертификат в корзину · {valid ? rub(value) : ""}
        </button>
      </div>
    </div>
  );
}

function BoxBuilder({ products }: { products: ProductView[] }) {
  const { add, setDrawerOpen } = useCart();
  const [box, setBox] = useState(GIFT_BOXES[0]);
  const [picked, setPicked] = useState<string[]>([]);
  const [filter, setFilter] = useState("all");
  const [card, setCard] = useState("");
  const cats = useMemo(() => {
    const m = new Map<string, string>();
    products.forEach((p) => m.set(p.categoryId, p.categoryId));
    return [...m.keys()];
  }, [products]);
  const names: Record<string, string> = { parfyumeriya: "Ароматы", "uhod-za-licom": "Уход", makiyazh: "Макияж", volosy: "Волосы", telo: "Тело", nogti: "Ногти", nabory: "Наборы" };
  const list = products.filter((p) => filter === "all" || p.categoryId === filter);
  const chosen = picked.map((id) => products.find((p) => p.id === id)!).filter(Boolean);
  const cheapest = (p: ProductView) => [...p.variants].filter((v) => v.stock > 0).sort((a, b) => a.price - b.price)[0] ?? p.variants[0];
  const total = chosen.reduce((s, p) => s + cheapest(p).price, 0) + GIFT_BOX.price;
  const toggle = (id: string) => setPicked((x) => (x.includes(id) ? x.filter((y) => y !== id) : x.length >= 5 ? x : [...x, id]));

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
      <div>
        <p className="mb-3 font-semibold">1. Упаковка</p>
        <div className="flex flex-wrap gap-3">
          {GIFT_BOXES.map((b) => (
            <button key={b.id} type="button" onClick={() => setBox(b)} className={`flex items-center gap-3 rounded-2xl border bg-white p-3 pr-5 text-sm transition ${box.id === b.id ? "border-ink shadow-md" : "border-line hover:border-ink/40"}`}>
              <span className="relative h-10 w-12 rounded-lg" style={{ background: b.color }}>
                <span className="absolute inset-y-0 left-1/2 w-1.5 -translate-x-1/2 bg-[#c9a46a]/80" />
              </span>
              {b.name}
            </button>
          ))}
        </div>

        <p className="mb-3 mt-8 font-semibold">2. Наполнение <span className="font-normal text-ink-soft">· выберите от 1 до 5 товаров</span></p>
        <div className="mb-4 flex flex-wrap gap-2">
          {["all", ...cats].map((c) => (
            <button key={c} type="button" onClick={() => setFilter(c)} className={`rounded-full px-4 py-1.5 text-sm transition ${filter === c ? "bg-ink text-white" : "bg-white hover:bg-sand"}`}>
              {c === "all" ? "Все" : names[c] ?? c}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {list.map((p) => {
            const on = picked.includes(p.id);
            return (
              <button key={p.id} type="button" onClick={() => toggle(p.id)} className={`relative rounded-2xl border bg-white p-2.5 text-left transition ${on ? "border-ink shadow-md" : "border-transparent hover:border-line"}`}>
                <span className={`absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full text-xs ${on ? "bg-ink text-white" : "border border-line bg-white"}`}>{on ? "✓" : "+"}</span>
                <span className="block aspect-square overflow-hidden rounded-xl"><ProductImage images={p.images} art={p.art} label={p.brandName} /></span>
                <span className="mt-2 block text-[10px] font-bold uppercase tracking-wider text-ink-soft">{p.brandName}</span>
                <span className="line-clamp-1 block text-sm">{p.name}</span>
                <span className="block text-sm font-semibold">{rub(cheapest(p).price)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* итог подарка */}
      <div className="lg:sticky lg:top-32 lg:self-start">
        <div className="rounded-[1.75rem] bg-white p-6 shadow-sm">
          <div className="relative mx-auto flex h-40 items-end justify-center overflow-hidden rounded-2xl" style={{ background: box.color }}>
            <span className="absolute inset-y-0 left-1/2 w-3 -translate-x-1/2 bg-[#c9a46a]/80" />
            <span className="absolute inset-x-0 top-1/3 h-3 bg-[#c9a46a]/80" />
            <div className="relative mb-3 flex gap-1">
              {chosen.slice(0, 5).map((p) => (
                <span key={p.id} className="h-16 w-12 overflow-hidden rounded-lg bg-white shadow">
                  {p.images[0] ? <img src={p.images[0]} alt="" referrerPolicy="no-referrer" className="h-full w-full object-contain" /> : null}
                </span>
              ))}
            </div>
          </div>
          <p className="h-display mt-4 text-2xl">Ваш подарок</p>
          <ul className="mt-3 space-y-1.5 text-sm">
            {chosen.map((p) => (
              <li key={p.id} className="flex justify-between gap-3"><span className="line-clamp-1">{p.brandName} {p.name}</span><span className="shrink-0">{rub(cheapest(p).price)}</span></li>
            ))}
            <li className="flex justify-between gap-3 text-ink-soft"><span>{box.name}</span><span>{rub(GIFT_BOX.price)}</span></li>
          </ul>
          <p className="mb-2 mt-5 text-sm font-semibold">3. Открытка</p>
          <textarea value={card} onChange={(e) => setCard(e.target.value.slice(0, 200))} rows={3} placeholder="Текст открытки, напишем от руки" className="input resize-none" />
          <div className="mt-4 flex items-center justify-between">
            <span className="text-ink-soft">Итого</span>
            <span className="h-display text-3xl">{rub(total)}</span>
          </div>
          <button
            type="button"
            disabled={!chosen.length}
            onClick={() => {
              chosen.forEach((p) => {
                const v = cheapest(p);
                add({ productId: p.id, variantId: v.id, slug: p.slug, name: p.name, brandName: p.brandName, variantLabel: v.label, price: v.price, oldPrice: v.oldPrice, image: p.images[0], art: p.art });
              });
              add({ productId: GIFT_BOX.id, variantId: `box-${box.id}-${rand()}`, slug: "/gift?tab=box", name: "Подарочная упаковка", brandName: "Katy", variantLabel: box.name, price: GIFT_BOX.price, art: { ...giftArt, bg: box.color }, note: card.trim() || undefined });
              setPicked([]);
              setCard("");
              setDrawerOpen(true);
            }}
            className="btn-dark mt-4 w-full py-3.5 disabled:opacity-40"
          >
            Добавить подарок в корзину
          </button>
          <p className="mt-3 text-center text-xs text-ink-soft">Соберём, упакуем и вложим открытку. <Link href="/delivery" className="underline">Доставка</Link></p>
        </div>
      </div>
    </div>
  );
}
