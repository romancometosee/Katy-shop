"use client";
import { useState } from "react";
import { Field, Toggle } from "./ui";
import { deletePromotion, savePromotion } from "@/lib/admin-actions";
import type { Brand, Category, Product, Promotion, PromotionKind, PromotionScope } from "@/lib/types";
import { KIND_NAMES, promoHeadline, promoRules } from "@/lib/promo";

const colors = ["#1c1917", "#9e3a52", "#c2546b", "#b8935a", "#2b6cb0", "#4b3a63", "#2f5d50"];
/** дата для поля ввода — по московскому времени */
const toInput = (iso: string) => new Date(new Date(iso).getTime() + 3 * 3600000).toISOString().slice(0, 10);
const KINDS: [PromotionKind, string][] = [
  ["percent", "Цены на сайте сразу ниже"],
  ["bundle", "Самый дешёвый товар бесплатно"],
  ["gift", "Подарок к покупке"],
  ["tiers", "−5% от 3000, −10% от 5000…"],
  ["delivery", "Доставка 0 ₽"],
];

export default function PromotionForm({ promo, preset, categories, brands, products }: { promo?: Promotion; preset?: Partial<Promotion>; categories: Category[]; brands: Brand[]; products: (Product & { brandName: string })[] }) {
  const init: Partial<Promotion> = promo ?? preset ?? {};
  const [kind, setKind] = useState<PromotionKind>(init.kind ?? "percent");
  const [scope, setScope] = useState<PromotionScope>(init.scope ?? "category");
  const [color, setColor] = useState(init.color ?? colors[0]);
  const [percent, setPercent] = useState(init.discountPercent ?? 15);
  const [title, setTitle] = useState(init.title ?? "");
  const [subtitle, setSubtitle] = useState(init.subtitle ?? "");
  const [buyQty, setBuyQty] = useState(init.buyQty ?? 3);
  const [payQty, setPayQty] = useState(init.payQty ?? 2);
  const [minTotal, setMinTotal] = useState(init.minTotal ?? 0);
  const [giftText, setGiftText] = useState(init.giftText ?? "");
  const [tiers, setTiers] = useState(() => {
    const t = init.tiers ?? [{ from: 3000, percent: 5 }, { from: 5000, percent: 10 }, { from: 10000, percent: 15 }];
    return [0, 1, 2].map((i) => t[i] ?? { from: 0, percent: 0 });
  });
  const draft = { kind, discountPercent: percent, buyQty, payQty, minTotal, giftText, tiers: tiers.filter((t) => t.percent > 0) } as Promotion;
  const onlyNum = (v: string) => Number(v.replace(/\D/g, ""));
  const [q, setQ] = useState("");
  const sel = (id: string) => (promo ?? preset)?.targetIds?.includes(id);
  const now = new Date();

  return (
    <form action={savePromotion} className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <input type="hidden" name="id" value={promo?.id ?? ""} />
      <input type="hidden" name="color" value={color} />
      <input type="hidden" name="kind" value={kind} />
      {init.dayDeal && <input type="hidden" name="dayDeal" value="on" />}
      <div className="card space-y-4 p-6">
        <Field label="Механика">
          <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {KINDS.map(([k, d]) => (
              <button type="button" key={k} onClick={() => setKind(k)} className={`rounded-2xl border p-3 text-left text-sm transition ${kind === k ? "border-ink bg-sand" : "border-line hover:border-ink/30"}`}>
                <b className="block">{KIND_NAMES[k]}</b>
                <span className="text-xs text-ink-soft">{d}</span>
              </button>
            ))}
          </div>
        </Field>
        <Field label="Название акции *"><input name="title" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Например: Неделя нишевой парфюмерии" className="input" /></Field>
        <Field label="Подзаголовок"><input name="subtitle" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="−20% на всю нишу" className="input" /></Field>
        <div className="grid gap-4 sm:grid-cols-3">
          {kind === "percent" ? (
            <Field label="Скидка, %"><input name="discountPercent" value={percent} onChange={(e) => setPercent(onlyNum(e.target.value))} className="input" /></Field>
          ) : (
            <input type="hidden" name="discountPercent" value={percent || 1} />
          )}
          <Field label="Начало"><input type="date" name="startsAt" defaultValue={toInput(init.startsAt ?? now.toISOString())} className="input" /></Field>
          <Field label="Конец"><input type="date" name="endsAt" defaultValue={toInput(init.endsAt ?? new Date(now.getTime() + 7 * 864e5).toISOString())} className="input" /></Field>
        </div>
        {kind === "bundle" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Покупатель берёт, шт."><input name="buyQty" value={buyQty} onChange={(e) => setBuyQty(onlyNum(e.target.value))} className="input" /></Field>
            <Field label="А платит за, шт."><input name="payQty" value={payQty} onChange={(e) => setPayQty(onlyNum(e.target.value))} className="input" /></Field>
          </div>
        )}
        {kind === "gift" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Что дарим"><input name="giftText" value={giftText} onChange={(e) => setGiftText(e.target.value)} placeholder="миниатюра аромата 5 мл" className="input" /></Field>
            <Field label="От суммы, ₽ (0 — к любой покупке)"><input name="minTotal" value={minTotal} onChange={(e) => setMinTotal(onlyNum(e.target.value))} className="input" /></Field>
          </div>
        )}
        {kind === "delivery" && (
          <Field label="От суммы заказа, ₽ (0 — на любой заказ)"><input name="minTotal" value={minTotal} onChange={(e) => setMinTotal(onlyNum(e.target.value))} className="input" /></Field>
        )}
        {kind === "tiers" && (
          <Field label="Ступени скидки">
            <div className="space-y-2">
              {tiers.map((t, i) => (
                <div key={i} className="flex flex-wrap items-center gap-2 text-sm">
                  от <input name={`tierFrom${i}`} value={t.from} onChange={(e) => setTiers(tiers.map((x, j) => (j === i ? { ...x, from: onlyNum(e.target.value) } : x)))} className="input w-28 py-2" /> ₽ —
                  скидка <input name={`tierPercent${i}`} value={t.percent} onChange={(e) => setTiers(tiers.map((x, j) => (j === i ? { ...x, percent: onlyNum(e.target.value) } : x)))} className="input w-20 py-2" /> %
                </div>
              ))}
              <p className="text-xs text-ink-soft">Пустую ступень оставьте с 0%. Сумма считается по товарам акции в корзине.</p>
            </div>
          </Field>
        )}
        <Field label="На что действует">
          <div className="flex flex-wrap gap-2">
            {([["all", "Весь каталог"], ["category", "Разделы"], ["brand", "Бренды"], ["products", "Отдельные товары"]] as const).map(([k, l]) => (
              <label key={k} className={`chip cursor-pointer px-4 py-2 text-sm ${scope === k ? "chip-active" : ""}`}>
                <input type="radio" name="scope" value={k} checked={scope === k} onChange={() => setScope(k)} className="sr-only" />{l}
              </label>
            ))}
          </div>
        </Field>
        <div className={scope === "category" ? "grid gap-1 sm:grid-cols-2" : "hidden"}>
          {categories.map((c) => (
            <label key={c.id} className={`flex items-center gap-2 text-sm ${c.parentId ? "pl-5" : "font-semibold"}`}>
              <input type="checkbox" name="targets-category" value={c.id} defaultChecked={sel(c.id)} /> {c.name}
            </label>
          ))}
        </div>
        <div className={scope === "brand" ? "grid gap-1 sm:grid-cols-3" : "hidden"}>
          {brands.map((b) => (
            <label key={b.id} className="flex items-center gap-2 text-sm"><input type="checkbox" name="targets-brand" value={b.id} defaultChecked={sel(b.id)} /> {b.name}</label>
          ))}
        </div>
        <div className={scope === "products" ? "block" : "hidden"}>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Найти товар" className="input mb-2 py-2" />
          <div className="max-h-80 space-y-1 overflow-y-auto">
            {products.map((p) => (
              <label key={p.id} className={`flex items-center gap-2 text-sm ${q && !`${p.brandName} ${p.name}`.toLowerCase().includes(q.toLowerCase()) ? "hidden" : ""}`}>
                <input type="checkbox" name="targets-products" value={p.id} defaultChecked={sel(p.id)} /> <b>{p.brandName}</b> {p.name}
              </label>
            ))}
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <div className="rounded-3xl p-6 text-white" style={{ background: color }}>
          <p className="h-display text-5xl">{promoHeadline(draft)}</p>
          <p className="mt-1 text-lg font-semibold">{title || "Название акции"}</p>
          <p className="text-sm text-white/75">{subtitle || "Подзаголовок"}</p>
          <p className="mt-4 border-t border-white/20 pt-3 text-xs text-white/80">Покупатель увидит: {promoRules(draft)}</p>
        </div>
        <div className="card space-y-4 p-6">
          <p className="label">Цвет плашки</p>
          <div className="flex flex-wrap gap-2">
            {colors.map((c) => <button type="button" key={c} onClick={() => setColor(c)} className={`h-8 w-8 rounded-full ring-offset-2 ${color === c ? "ring-2 ring-ink" : ""}`} style={{ background: c }} aria-label={c} />)}
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-8 w-10" />
          </div>
          <Toggle name="isActive" defaultChecked={promo?.isActive ?? true} label="Акция включена" />
          <button className="btn-dark w-full">Сохранить акцию</button>
          {promo && <button formAction={deletePromotion} formNoValidate onClick={(e) => { if (!confirm("Удалить акцию?")) e.preventDefault(); }} className="w-full text-sm text-rose underline">Удалить</button>}
        </div>
      </div>
    </form>
  );
}
