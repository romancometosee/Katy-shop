"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const items = [
  ["/admin", "Обзор", "◎"],
  ["/admin/orders", "Заказы", "▤"],
  ["/admin/products", "Товары и цены", "◇"],
  ["/admin/club", "Клуб Katy", "✦"],
  ["/admin/promotions", "Акции и промокоды", "%"],
  ["/admin/banners", "Баннеры на главной", "▭"],
  ["/admin/categories", "Разделы каталога", "☰"],
  ["/admin/brands", "Бренды", "B"],
  ["/admin/settings", "Настройки", "⚙"],
];

export default function AdminNav({ newOrders }: { newOrders: number }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const active = (h: string) => (h === "/admin" ? path === h : path.startsWith(h));
  const links = (
    <ul className="space-y-1">
      {items.map(([h, l, i]) => (
        <li key={h}>
          <Link href={h} onClick={() => setOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${active(h) ? "bg-white text-ink" : "text-white/70 hover:bg-white/10 hover:text-white"}`}>
            <span className="w-5 text-center">{i}</span>
            <span className="flex-1">{l}</span>
            {h === "/admin/orders" && newOrders > 0 && <span className="rounded-full bg-rose px-2 py-0.5 text-[11px] font-bold text-white">{newOrders}</span>}
          </Link>
        </li>
      ))}
    </ul>
  );
  return (
    <>
      <div className="flex items-center justify-between bg-ink px-4 py-3 text-white lg:hidden">
        <span className="h-display text-2xl tracking-[.25em]">KATY</span>
        <button onClick={() => setOpen(!open)} className="rounded-lg border border-white/20 px-3 py-1 text-sm">Меню</button>
      </div>
      {open && <div className="bg-ink px-3 pb-4 lg:hidden">{links}</div>}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-ink p-4 lg:flex">
        <Link href="/admin" className="px-3 py-4">
          <span className="h-display block text-3xl tracking-[.25em] text-white">KATY</span>
          <span className="text-[11px] uppercase tracking-[.25em] text-white/50">управление</span>
        </Link>
        <nav className="mt-4 flex-1">{links}</nav>
        <Link href="/" target="_blank" className="rounded-xl px-3 py-2.5 text-sm text-white/70 hover:bg-white/10">↗ Открыть сайт</Link>
      </aside>
    </>
  );
}
