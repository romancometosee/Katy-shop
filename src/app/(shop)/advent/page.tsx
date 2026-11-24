import Link from "next/link";
import { cookies } from "next/headers";
import Breadcrumbs from "@/components/Breadcrumbs";
import ProductImage from "@/components/ProductImage";
import PromoCountdown from "@/components/PromoCountdown";
import { getDb } from "@/lib/db";
import { ADMIN_COOKIE, adminPassword, tokenFor } from "@/lib/auth";
import { ADVENT_COLOR, adventDays, adventYear, moscowToday } from "@/lib/advent";
import { rub } from "@/lib/format";

export const metadata = { title: "Адвент-календарь Katy", description: "24 окошка с 1 по 24 декабря: каждый день новый товар со скидкой только на один день." };

export default async function AdventPage({ searchParams }: { searchParams: Promise<{ day?: string }> }) {
  const db = await getDb();
  const year = adventYear();
  const days = adventDays(db, year);
  const t = moscowToday();
  let today = t.y === year && t.m === 12 ? t.d : 0; // 0 — декабрь ещё не начался
  // предпросмотр любого дня — только для администратора
  const sp = await searchParams;
  const isAdmin = (await cookies()).get(ADMIN_COOKIE)?.value === (await tokenFor(adminPassword()));
  const preview = isAdmin && sp.day ? Math.min(24, Math.max(1, Number(sp.day) || 1)) : 0;
  if (preview) today = preview;
  const brand = (id: string) => db.brands.find((b) => b.id === id)?.name ?? "";
  const open = days.find((d) => d.day === today);
  const dealPrice = (base: number, pct: number) => Math.round((base * (100 - pct)) / 100 / 10) * 10;

  return (
    <div className="container-x pt-8">
      <Breadcrumbs items={[{ name: "Акции", href: "/sale" }, { name: "Адвент-календарь" }]} />
      <div className="mt-8 max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[.28em]" style={{ color: ADVENT_COLOR }}>Декабрь {year}</p>
        <h1 className="h-display mt-2 text-5xl leading-none sm:text-7xl">Адвент-календарь Katy</h1>
        <p className="mt-4 text-lg text-ink-soft">Каждый день с 1 по 24 декабря открывается новое окошко. За ним товар со скидкой, которая действует только этот день. Заглядывайте каждое утро.</p>
        {preview > 0 && <p className="mt-3 rounded-xl bg-amber-50 px-4 py-2 text-sm text-amber-900">Предпросмотр для администратора: показан {preview} декабря. Покупатели видят календарь по настоящей дате.</p>}
      </div>

      {/* окошко сегодняшнего дня */}
      {open?.product && open.promo && (() => {
        const p = open.product;
        const base = Math.min(...p.variants.map((v) => v.price));
        return (
          <div className="mt-10 grid overflow-hidden rounded-[2rem] text-white md:grid-cols-[1fr_1.2fr]" style={{ background: "linear-gradient(135deg,#1c1917,#3a2027)" }}>
            <div className="aspect-[5/4] md:aspect-auto"><ProductImage images={p.images} art={p.art} label={brand(p.brandId)} /></div>
            <div className="flex flex-col justify-center gap-4 p-7 sm:p-10">
              <p className="text-xs font-semibold uppercase tracking-[.28em] text-[#e8c98f]">Окошко {open.day} · только сегодня</p>
              <div>
                <p className="text-sm uppercase tracking-[.15em] text-white/60">{brand(p.brandId)}</p>
                <p className="h-display text-3xl sm:text-4xl">{p.name}</p>
              </div>
              <div className="flex items-end gap-3">
                <p className="h-display text-5xl text-[#e8c98f]">−{open.promo.discountPercent}%</p>
                <p className="pb-1.5"><span className="mr-2 text-white/50 line-through">{rub(base)}</span><b className="text-xl">{rub(dealPrice(base, open.promo.discountPercent))}</b></p>
              </div>
              <div>
                <p className="mb-2 text-xs text-white/60">До конца предложения</p>
                <PromoCountdown endsAt={open.promo.endsAt} />
              </div>
              <Link href={`/product/${p.slug}`} className="mt-2 w-fit rounded-full bg-white px-7 py-3 text-sm font-semibold text-ink transition hover:bg-[#e8c98f]">Забрать со скидкой</Link>
            </div>
          </div>
        );
      })()}
      {today === 0 && (
        <div className="mt-10 rounded-[2rem] bg-sand p-8 text-center">
          <p className="h-display text-3xl">Первое окошко откроется 1 декабря</p>
          <p className="mt-2 text-ink-soft">Скидки до −30% на хиты парфюмерии, ухода, макияжа и ногтей. Каждый день — новый товар.</p>
        </div>
      )}

      {/* все окошки */}
      <div className="mt-10 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {days.map(({ day, product, promo }) => {
          const past = today > day;
          const isToday = today === day;
          if (isToday && product)
            return (
              <div key={day} className="relative aspect-square overflow-hidden rounded-3xl ring-2 ring-offset-2" style={{ background: ADVENT_COLOR, ["--tw-ring-color" as string]: ADVENT_COLOR }}>
                <div className="absolute inset-0 opacity-60"><ProductImage images={product.images} art={product.art} /></div>
                <span className="h-display absolute left-3 top-2 text-3xl text-white drop-shadow">{day}</span>
                <span className="absolute inset-x-2 bottom-2 rounded-full bg-white/90 py-1 text-center text-[11px] font-bold" style={{ color: ADVENT_COLOR }}>Сегодня −{promo?.discountPercent}%</span>
              </div>
            );
          if (past && product)
            return (
              <Link key={day} href={`/product/${product.slug}`} className="group relative aspect-square overflow-hidden rounded-3xl bg-sand">
                <div className="absolute inset-0 opacity-40 grayscale transition group-hover:opacity-70 group-hover:grayscale-0"><ProductImage images={product.images} art={product.art} /></div>
                <span className="h-display absolute left-3 top-2 text-3xl text-ink/50">{day}</span>
                <span className="absolute inset-x-2 bottom-2 truncate text-center text-[11px] text-ink-soft">{brand(product.brandId)}</span>
              </Link>
            );
          return (
            <div key={day} className="relative grid aspect-square place-items-center overflow-hidden rounded-3xl border border-[#e8c98f]/60 bg-gradient-to-br from-white to-[#f6ede3]">
              <span className="absolute right-3 top-3 text-xs text-[#c9a76a]">✦</span>
              <span className="h-display text-4xl sm:text-5xl" style={{ color: past ? "#b9aca4" : ADVENT_COLOR }}>{day}</span>
              <span className="absolute bottom-2 text-[10px] uppercase tracking-[.2em] text-ink-soft/70">{past ? "прошло" : "декабря"}</span>
            </div>
          );
        })}
      </div>
      <p className="mt-6 text-sm text-ink-soft">Скидка окошка действует с 00:00 до 23:59 по Москве. Количество товара ограничено.</p>
    </div>
  );
}
