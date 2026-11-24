"use client";
import { useState } from "react";
import { Field, Toggle } from "./ui";
import { deletePromotion, savePromotion } from "@/lib/admin-actions";
import type { Brand, Category, Product, Promotion, PromotionScope } from "@/lib/types";

const colors = ["#1c1917", "#9e3a52", "#c2546b", "#b8935a", "#2b6cb0", "#4b3a63", "#2f5d50"];
const toInput = (iso: string) => iso.slice(0, 10);

export default function PromotionForm({ promo, categories, brands, products }: { promo?: Promotion; categories: Category[]; brands: Brand[]; products: (Product & { brandName: string })[] }) {
  const [scope, setScope] = useState<PromotionScope>(promo?.scope ?? "category");
  const [color, setColor] = useState(promo?.color ?? colors[0]);
  const [percent, setPercent] = useState(promo?.discountPercent ?? 15);
  const [title, setTitle] = useState(promo?.title ?? "");
  const [subtitle, setSubtitle] = useState(promo?.subtitle ?? "");
  const [q, setQ] = useState("");
  const sel = (id: string) => promo?.targetIds.includes(id);
  const now = new Date();

  return (
    <form action={savePromotion} className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <input type="hidden" name="id" value={promo?.id ?? ""} />
      <input type="hidden" name="color" value={color} />
      <div className="card space-y-4 p-6">
        <Field label="Название акции *"><input name="title" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Например: Неделя нишевой парфюмерии" className="input" /></Field>
        <Field label="Подзаголовок"><input name="subtitle" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="−20% на всю нишу" className="input" /></Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Скидка, %"><input name="discountPercent" value={percent} onChange={(e) => setPercent(Number(e.target.value.replace(/\D/g, "")))} className="input" /></Field>
          <Field label="Начало"><input type="date" name="startsAt" defaultValue={toInput(promo?.startsAt ?? now.toISOString())} className="input" /></Field>
          <Field label="Конец"><input type="date" name="endsAt" defaultValue={toInput(promo?.endsAt ?? new Date(now.getTime() + 7 * 864e5).toISOString())} className="input" /></Field>
        </div>
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
          <p className="h-display text-5xl">−{percent || 0}%</p>
          <p className="mt-1 text-lg font-semibold">{title || "Название акции"}</p>
          <p className="text-sm text-white/75">{subtitle || "Подзаголовок"}</p>
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
