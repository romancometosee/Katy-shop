"use client";
import Link from "next/link";
import { useState } from "react";
import ProductRail from "./ProductRail";
import { ChevronRight } from "./Icons";
import type { ProductView } from "@/lib/catalog";

// Несколько подборок в одном блоке с вкладками — вместо отдельной ленты на каждый раздел
export default function RailTabs({ tabs }: { tabs: { label: string; href: string; products: ProductView[] }[] }) {
  const list = tabs.filter((t) => t.products.length);
  const [i, setI] = useState(0);
  const cur = list[i] ?? list[0];
  if (!cur) return null;
  return (
    <div>
      <div className="no-scrollbar -mx-4 mb-6 flex items-center gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0" role="tablist">
        {list.map((t, k) => (
          <button key={t.href} type="button" role="tab" aria-selected={k === i} onClick={() => setI(k)} className={`chip shrink-0 px-5 py-2 text-sm ${k === i ? "chip-active" : ""}`}>{t.label}</button>
        ))}
        <Link href={cur.href} className="ml-auto hidden shrink-0 items-center gap-1 text-sm font-semibold hover:underline sm:flex">Смотреть все <ChevronRight className="h-4 w-4" /></Link>
      </div>
      <ProductRail products={cur.products} />
    </div>
  );
}
