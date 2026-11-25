"use client";
import { useOverlay } from "./useOverlay";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { CloseIcon } from "./Icons";

export type FacetOption = { value: string; label: string; count: number };

export default function FilterPanel({
  brands,
  genders,
  families,
  priceRange,
}: {
  brands: FacetOption[];
  genders: FacetOption[];
  families: FacetOption[];
  priceRange: [number, number];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);
  useOverlay(mobileOpen, () => setMobileOpen(false));
  const [min, setMin] = useState(params.get("min") ?? "");
  const [max, setMax] = useState(params.get("max") ?? "");
  const [brandQuery, setBrandQuery] = useState("");

  const selected = (key: string) => (params.get(key) ?? "").split(",").filter(Boolean);

  const push = (mutate: (p: URLSearchParams) => void) => {
    const p = new URLSearchParams(params.toString());
    mutate(p);
    router.push(`${pathname}?${p.toString()}`, { scroll: false });
  };
  const toggle = (key: string, value: string) =>
    push((p) => {
      const cur = selected(key);
      const next = cur.includes(value) ? cur.filter((x) => x !== value) : [...cur, value];
      if (next.length) p.set(key, next.join(","));
      else p.delete(key);
    });
  const flag = (key: string) => push((p) => (p.get(key) ? p.delete(key) : p.set(key, "1")));

  const group = (title: string, key: string, options: FacetOption[], searchable = false) =>
    options.length > 0 && (
      <div className="border-b border-line py-5">
        <p className="label">{title}</p>
        {searchable && options.length > 8 && (
          <input value={brandQuery} onChange={(e) => setBrandQuery(e.target.value)} placeholder="Найти бренд" className="input mb-3 py-2" />
        )}
        <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
          {options
            .filter((o) => !searchable || o.label.toLowerCase().includes(brandQuery.toLowerCase()))
            .map((o) => (
              <label key={o.value} className="flex cursor-pointer items-center gap-3 text-sm">
                <input type="checkbox" checked={selected(key).includes(o.value)} onChange={() => toggle(key, o.value)} className="h-4 w-4 accent-ink" />
                <span className="flex-1">{o.label}</span>
                <span className="text-xs text-ink-soft">{o.count}</span>
              </label>
            ))}
        </div>
      </div>
    );

  const panel = (
    <div>
      <div className="flex flex-wrap gap-2 border-b border-line pb-5">
        {[["sale", "Со скидкой"], ["hit", "Хиты"], ["new", "Новинки"]].map(([k, l]) => (
          <button key={k} onClick={() => flag(k)} className={`chip ${params.get(k) ? "chip-active" : ""}`}>{l}</button>
        ))}
      </div>
      <div className="border-b border-line py-5">
        <p className="label">Цена, ₽</p>
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            push((p) => {
              if (min) p.set("min", min); else p.delete("min");
              if (max) p.set("max", max); else p.delete("max");
            });
          }}
        >
          <input value={min} onChange={(e) => setMin(e.target.value.replace(/\D/g, ""))} placeholder={`от ${priceRange[0]}`} className="input py-2" inputMode="numeric" />
          <input value={max} onChange={(e) => setMax(e.target.value.replace(/\D/g, ""))} placeholder={`до ${priceRange[1]}`} className="input py-2" inputMode="numeric" />
          <button className="rounded-xl bg-ink px-3 py-2 text-sm text-white">OK</button>
        </form>
      </div>
      {group("Для кого", "gender", genders)}
      {group("Семейство аромата", "family", families)}
      {group("Бренд", "brand", brands, true)}
      {params.toString() && (
        <button onClick={() => router.push(pathname)} className="mt-5 text-sm font-semibold underline underline-offset-4">Сбросить фильтры</button>
      )}
    </div>
  );

  return (
    <>
      <button onClick={() => setMobileOpen(true)} className="btn-light w-full lg:hidden">Фильтры</button>
      <aside className="hidden lg:block">{panel}</aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 right-0 w-[88%] max-w-sm overflow-y-auto bg-cream p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="h-display text-2xl">Фильтры</p>
              <button onClick={() => setMobileOpen(false)} aria-label="Закрыть"><CloseIcon className="h-6 w-6" /></button>
            </div>
            {panel}
            <button onClick={() => setMobileOpen(false)} className="btn-dark mt-6 w-full">Показать</button>
          </div>
        </div>
      )}
    </>
  );
}
