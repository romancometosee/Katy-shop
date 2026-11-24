/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import PhotoFan from "./PhotoFan";
import { SearchIcon } from "./Icons";
import type { Category } from "@/lib/types";
import { categoryImages } from "@/lib/productImages";

// Первый экран магазина: крупный заголовок, поиск, быстрые разделы
// и «живая» мозаика из настоящих фото товаров по разделам.

type Tile = { slug: string; name: string; note: string; bg: string; className: string };

const tiles: Tile[] = [
  { slug: "parfyumeriya", name: "Парфюмерия", note: "классика и ниша", bg: "#f6e9df", className: "col-span-2 row-span-2" },
  { slug: "nogti", name: "Ногти", note: "гель-лаки и уход", bg: "#f9e3e4", className: "row-span-2" },
  { slug: "volosy", name: "Волосы", note: "шампуни, бальзамы, масла", bg: "#f3ecdc", className: "" },
  { slug: "uhod-za-licom", name: "Уход", note: "сыворотки и кремы", bg: "#e6efe4", className: "" },
  { slug: "makiyazh", name: "Макияж", note: "помады, тушь, палетки", bg: "#f4e4ea", className: "col-span-2" },
  { slug: "telo", name: "Тело", note: "кремы и дымки", bg: "#f7eedf", className: "" },
];

export default function TitleScreen({ categories, brands }: { categories: Category[]; brands: { name: string; slug: string }[] }) {
  const has = new Set(categories.map((c) => c.slug));
  const shown = tiles.filter((t) => has.has(t.slug));
  return (
    <section className="relative overflow-hidden">
      {/* мягкие цветные пятна на фоне */}
      <div className="pointer-events-none absolute -left-32 -top-40 h-[28rem] w-[28rem] rounded-full bg-[#f6d5d9] opacity-60 blur-3xl katy-drift" />
      <div className="pointer-events-none absolute -right-24 top-24 h-[24rem] w-[24rem] rounded-full bg-[#f3e3c3] opacity-60 blur-3xl katy-drift [animation-delay:-7s]" />

      <div className="container-x relative grid items-center gap-10 pb-10 pt-8 lg:grid-cols-[1fr_1.15fr] lg:gap-14 lg:pb-16 lg:pt-14">
        <div className="animate-fade-up">
          <p className="text-xs font-semibold uppercase tracking-[.28em] text-rose">Парфюмерия · уход · макияж · волосы · ногти</p>
          <h1 className="h-display mt-5 text-[clamp(44px,6.4vw,92px)] leading-[0.98]">
            Вся красота <br className="hidden sm:block" />
            <span className="italic text-rose">в одном</span> месте
          </h1>
          <p className="mt-6 max-w-lg text-lg text-ink-soft">
            Оригинальная косметика и парфюмерия любимых брендов. Выбирайте спокойно — мы поможем подобрать и бережно доставим.
          </p>

          <form action="/search" className="mt-8 flex max-w-lg items-center gap-2 rounded-full border border-line bg-white p-1.5 pl-5 shadow-sm focus-within:border-ink">
            <SearchIcon className="h-5 w-5 shrink-0 text-ink-soft" />
            <input name="q" placeholder="Например, гель-лак OPI или Baccarat Rouge" className="min-w-0 flex-1 bg-transparent py-2 text-[15px] outline-none" />
            <button className="btn-dark shrink-0 px-6 py-2.5">Найти</button>
          </form>

          <div className="mt-5 flex flex-wrap gap-2">
            {shown.map((t) => (
              <Link key={t.slug} href={`/catalog/${t.slug}`} className="rounded-full bg-white/70 px-4 py-2 text-sm font-semibold backdrop-blur transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md">{t.name}</Link>
            ))}
          </div>
        </div>

        {/* мозаика разделов */}
        <div className="grid auto-rows-[118px] grid-cols-3 gap-3 sm:auto-rows-[150px] sm:gap-4">
          {shown.map((t, i) => (
            <Link
              key={t.slug}
              href={`/catalog/${t.slug}`}
              className={`group relative overflow-hidden rounded-[1.75rem] p-4 transition duration-500 hover:-translate-y-1 hover:shadow-xl animate-fade-up ${t.className}`}
              style={{ background: t.bg, animationDelay: `${0.08 * i + 0.1}s` }}
            >
              <div className="relative z-10">
                <p className="h-display text-xl leading-none sm:text-2xl">{t.name}</p>
                <p className="mt-1 hidden text-xs text-ink-soft sm:block">{t.note}</p>
              </div>
              {categoryImages[t.slug]?.length ? (
                <PhotoFan images={categoryImages[t.slug]} className="absolute inset-x-3 bottom-3 top-[38%]" />
              ) : null}
            </Link>
          ))}
        </div>
      </div>

      {/* бегущая строка брендов */}
      {brands.length > 0 && (
        <div className="border-y border-line bg-white/60 py-4">
          <div className="overflow-hidden">
            <div className="animate-marquee flex w-max gap-14 whitespace-nowrap">
              {[...brands, ...brands].map((b, i) => (
                <Link key={i} href={`/brands/${b.slug}`} className="h-display text-2xl uppercase tracking-[.15em] text-ink/50 transition hover:text-ink">{b.name}</Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
