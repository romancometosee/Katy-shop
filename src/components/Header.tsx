"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "./CartProvider";
import ProductArt from "./ProductArt";
import PhotoFan from "./PhotoFan";
import { categoryImages } from "@/lib/productImages";
import { BagIcon, ChevronDown, ChevronRight, CloseIcon, HeartIcon, MenuIcon, SearchIcon } from "./Icons";
import type { ProductArt as Art } from "@/lib/types";

export type NavItem = {
  name: string;
  href: string;
  description: string;
  art: Art;
  subs: { name: string; href: string }[];
  brands: { name: string; href: string }[];
};

export default function Header({ shopName, announcement, nav }: { shopName: string; announcement: string; nav: NavItem[] }) {
  const { count, favorites, setDrawerOpen } = useCart();
  const [open, setOpen] = useState<string | null>(null);
  const [mobile, setMobile] = useState(false);
  const [mobileSub, setMobileSub] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const router = useRouter();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setMobile(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  const parts = announcement.split("·").map((s) => s.trim()).filter(Boolean);

  return (
    <header className="sticky top-0 z-40">
      {/* бегущая строка */}
      <div className="overflow-hidden bg-ink py-2 text-[11px] font-medium uppercase tracking-[.2em] text-white/90">
        <div className="animate-marquee flex w-max gap-12 whitespace-nowrap">
          {[...parts, ...parts, ...parts, ...parts].map((p, i) => (
            <span key={i} className="flex items-center gap-12">
              {p} <span className="text-gold-light">✦</span>
            </span>
          ))}
        </div>
      </div>

      <div className="relative border-b border-line bg-cream/95 backdrop-blur" onMouseLeave={() => setOpen(null)}>
        <div className="container-x flex h-16 items-center gap-4 lg:h-20">
          <button className="-ml-2 p-2 lg:hidden" aria-label="Меню" onClick={() => setMobile(true)}>
            <MenuIcon className="h-6 w-6" />
          </button>
          <Link href="/" className="flex flex-col leading-none">
            <span className="h-display text-3xl tracking-[.25em] lg:text-4xl">{shopName.toUpperCase()}</span>
            <span className="mt-1 hidden text-[10px] uppercase tracking-[.35em] text-ink-soft sm:block">parfum · beauty</span>
          </Link>

          <form onSubmit={submit} className="mx-auto hidden max-w-md flex-1 lg:block">
            <label className="relative block">
              <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Аромат, бренд или нота — например, «ваниль»"
                className="w-full rounded-full border border-line bg-white py-2.5 pl-11 pr-4 text-sm outline-none focus:border-ink/40"
              />
            </label>
          </form>

          <div className="ml-auto flex items-center gap-1 lg:ml-0">
            <Link href="/search" className="p-2 lg:hidden" aria-label="Поиск">
              <SearchIcon className="h-6 w-6" />
            </Link>
            <Link href="/favorites" className="relative p-2" aria-label="Избранное">
              <HeartIcon className="h-6 w-6" />
              {favorites.length > 0 && (
                <span className="absolute right-0 top-0 grid h-4 min-w-4 place-items-center rounded-full bg-rose px-1 text-[10px] font-bold text-white">{favorites.length}</span>
              )}
            </Link>
            <button onClick={() => setDrawerOpen(true)} className="relative p-2" aria-label="Корзина">
              <BagIcon className="h-6 w-6" />
              {count > 0 && (
                <span className="absolute right-0 top-0 grid h-4 min-w-4 place-items-center rounded-full bg-ink px-1 text-[10px] font-bold text-white">{count}</span>
              )}
            </button>
          </div>
        </div>

        {/* меню разделов */}
        <nav className="container-x hidden lg:block">
          <ul className="flex items-center justify-center gap-8 text-[13px] font-semibold uppercase tracking-wider">
            {nav.map((item) => (
              <li key={item.href} onMouseEnter={() => setOpen(item.href)}>
                <Link href={item.href} className={`flex items-center gap-1 border-b-2 py-3 transition ${open === item.href ? "border-ink" : "border-transparent hover:border-ink/30"}`}>
                  {item.name}
                </Link>
              </li>
            ))}
            <li onMouseEnter={() => setOpen(null)}>
              <Link href="/brands" className="block border-b-2 border-transparent py-3 hover:border-ink/30">Бренды</Link>
            </li>
            <li onMouseEnter={() => setOpen(null)}>
              <Link href="/podbor" className="block border-b-2 border-transparent py-3 hover:border-ink/30">Подбор аромата</Link>
            </li>
            <li onMouseEnter={() => setOpen(null)}>
              <Link href="/sale" className="block border-b-2 border-transparent py-3 text-rose hover:border-rose/40">Акции</Link>
            </li>
          </ul>
        </nav>

        {/* мега-меню */}
        {nav.map(
          (item) =>
            open === item.href && (
              <div key={item.href} className="absolute inset-x-0 top-full hidden border-b border-line bg-white shadow-xl shadow-black/5 lg:block">
                <div className="container-x grid grid-cols-12 gap-8 py-8">
                  <div className="col-span-3">
                    <p className="label">Разделы</p>
                    <ul className="space-y-2.5">
                      {item.subs.map((s) => (
                        <li key={s.href}>
                          <Link href={s.href} onClick={() => setOpen(null)} className="text-[15px] hover:text-rose">{s.name}</Link>
                        </li>
                      ))}
                      <li>
                        <Link href={item.href} onClick={() => setOpen(null)} className="text-[15px] font-semibold underline underline-offset-4">Смотреть всё</Link>
                      </li>
                    </ul>
                  </div>
                  <div className="col-span-4">
                    <p className="label">Популярные бренды</p>
                    <ul className="grid grid-cols-2 gap-x-6 gap-y-2.5">
                      {item.brands.map((b) => (
                        <li key={b.href}>
                          <Link href={b.href} onClick={() => setOpen(null)} className="text-[15px] hover:text-rose">{b.name}</Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Link href={item.href} onClick={() => setOpen(null)} className="col-span-5 flex overflow-hidden rounded-3xl" style={{ background: item.art.bg }}>
                    <div className="flex flex-1 flex-col justify-end p-6">
                      <p className="h-display text-3xl">{item.name}</p>
                      <p className="mt-2 text-sm text-ink-soft">{item.description}</p>
                      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold">Перейти <ChevronRight className="h-4 w-4" /></span>
                    </div>
                    {categoryImages[item.href.split("/").pop() ?? ""]?.length ? (
                      <PhotoFan images={categoryImages[item.href.split("/").pop() ?? ""]} className="h-48 w-56 shrink-0 self-end" />
                    ) : (
                      <ProductArt {...item.art} withBg={false} className="h-48 w-40 shrink-0" />
                    )}
                  </Link>
                </div>
              </div>
            ),
        )}
      </div>

      {/* мобильное меню */}
      {mobile && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobile(false)} />
          <div className="absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col overflow-y-auto bg-cream">
            <div className="flex items-center justify-between border-b border-line p-4">
              <span className="h-display text-2xl tracking-[.25em]">{shopName.toUpperCase()}</span>
              <button onClick={() => setMobile(false)} aria-label="Закрыть"><CloseIcon className="h-6 w-6" /></button>
            </div>
            <form onSubmit={submit} className="p-4">
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Поиск по магазину" className="input" />
            </form>
            <ul className="px-2">
              {nav.map((item) => (
                <li key={item.href} className="border-b border-line">
                  <button className="flex w-full items-center justify-between px-2 py-4 text-left font-semibold" onClick={() => setMobileSub(mobileSub === item.href ? null : item.href)}>
                    {item.name}
                    <ChevronDown className={`h-4 w-4 transition ${mobileSub === item.href ? "rotate-180" : ""}`} />
                  </button>
                  {mobileSub === item.href && (
                    <ul className="pb-3 pl-4">
                      <li><Link href={item.href} onClick={() => setMobile(false)} className="block py-2 text-sm font-semibold">Смотреть всё</Link></li>
                      {item.subs.map((s) => (
                        <li key={s.href}><Link href={s.href} onClick={() => setMobile(false)} className="block py-2 text-sm text-ink-soft">{s.name}</Link></li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
              {[["Бренды", "/brands"], ["Подбор аромата", "/podbor"], ["Акции", "/sale"], ["Доставка и оплата", "/delivery"]].map(([n, h]) => (
                <li key={h} className="border-b border-line">
                  <Link href={h} onClick={() => setMobile(false)} className="block px-2 py-4 font-semibold">{n}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </header>
  );
}
