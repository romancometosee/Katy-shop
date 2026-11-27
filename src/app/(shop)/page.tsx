import Link from "next/link";
import HeroSlider from "@/components/HeroSlider";
import TitleScreen from "@/components/TitleScreen";
import RecentlyViewed from "@/components/RecentlyViewed";
import Section from "@/components/Section";
import ProductRail from "@/components/ProductRail";
import RailTabs from "@/components/RailTabs";
import ProductArt from "@/components/ProductArt";
import PhotoFan from "@/components/PhotoFan";
import { categoryImages } from "@/lib/productImages";
import PromoCountdown from "@/components/PromoCountdown";
import { promoHeadline } from "@/lib/promo";
import AdventTeaser from "@/components/AdventTeaser";
import { GiftIcon, ShieldIcon, SparkIcon, TruckIcon, ChevronRight, StarIcon } from "@/components/Icons";
import { getDb } from "@/lib/db";
import { isDecant, isPromotionLive, searchProducts, topCategories } from "@/lib/catalog";
import { rub, plural } from "@/lib/format";
import JournalCard from "@/components/JournalCard";
import { articles } from "@/lib/journal";
import { articleImages } from "@/lib/journal-images";

const notes = [
  { name: "Ваниль", color: "#f3e3c3" },
  { name: "Роза", color: "#f5cdd5" },
  { name: "Сандал", color: "#e6d2b5" },
  { name: "Уд", color: "#d7c3b1" },
  { name: "Жасмин", color: "#f6efd9" },
  { name: "Мускус", color: "#ece6e1" },
  { name: "Бергамот", color: "#e6efc9" },
  { name: "Кофе", color: "#dcc9b8" },
  { name: "Табак", color: "#e2cfb6" },
  { name: "Вишня", color: "#f0c4ca" },
];

export default async function HomePage() {
  const db = await getDb();
  const banners = db.banners.filter((b) => b.isActive).sort((a, b) => a.order - b.order);
  const cats = topCategories(db);
  const hits = searchProducts(db, { hit: true }).slice(0, 8);
  const news = searchProducts(db, { sort: "new" }).slice(0, 4);
  const sale = searchProducts(db, { sale: true, sort: "discount" }).slice(0, 4);
  const promos = db.promotions.filter((p) => isPromotionLive(p) && !p.dayDeal);
  const popularBrands = db.brands.filter((b) => b.isPopular).slice(0, 12);
  const s = db.settings;
  // рекомендации, которыми дополняется «Вы недавно смотрели»: хиты из всех разделов
  const picks = [...hits, ...searchProducts(db, { sort: "rating" }).slice(0, 24)].map((p) => ({ slug: p.slug, name: p.name, brand: p.brandName, image: p.images[0], price: p.price, cat: p.categoryId }));
  const decantCount = db.products.filter((p) => p.isActive && p.variants.some((v) => isDecant(v.label) && v.stock > 0)).length;

  return (
    <>
      <TitleScreen categories={cats} brands={db.brands.filter((b) => b.isPopular).map((b) => ({ name: b.name, slug: b.slug }))} />

      {/* преимущества */}
      <div className="container-x mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { icon: ShieldIcon, t: "100% оригинал", d: "Гарантия подлинности каждого средства" },
          { icon: GiftIcon, t: "Подарок в заказе", d: s.giftText },
          { icon: TruckIcon, t: "Доставка по России", d: `Бесплатно от ${rub(s.freeDeliveryFrom)}` },
          { icon: SparkIcon, t: "Подбор аромата", d: "Подскажем, что подойдёт именно вам" },
        ].map(({ icon: Icon, t, d }) => (
          <div key={t} className="flex flex-col items-start gap-3 rounded-2xl bg-white p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-5">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-sand text-gold"><Icon className="h-5 w-5" /></span>
            <div>
              <p className="text-sm font-semibold">{t}</p>
              <p className="text-xs text-ink-soft">{d}</p>
            </div>
          </div>
        ))}
      </div>

      {/* разделы */}
      <Section title="Каталог" kicker="Разделы магазина">
        <div className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-4 md:gap-4 md:overflow-visible md:px-0 lg:grid-cols-7">
          {cats.map((c) => (
            <Link key={c.id} href={`/catalog/${c.slug}`} className="group relative flex aspect-[3/4] w-[38vw] shrink-0 snap-start flex-col overflow-hidden rounded-3xl md:w-auto" style={{ background: c.art.bg }}>
              {categoryImages[c.slug]?.length ? (
                <PhotoFan images={categoryImages[c.slug]} className="mx-3 mt-5 h-[58%]" />
              ) : (
                <ProductArt {...c.art} withBg={false} className="mx-auto mt-4 h-[62%] transition duration-500 group-hover:-translate-y-1 group-hover:scale-105" />
              )}
              <div className="mt-auto p-4">
                <p className="h-display text-xl leading-tight sm:text-2xl">{c.name}</p>
                <p className="mt-1 flex items-center text-xs font-semibold text-ink-soft">
                  {(() => { const k = db.products.filter((p) => p.categoryId === c.id && p.isActive).length; return `${k} ${plural(k, "товар", "товара", "товаров")}`; })()} <ChevronRight className="h-3.5 w-3.5" />
                </p>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {/* баннеры акций и подборок — уже не на первом экране */}
      {banners.length > 0 && (
        <div className="container-x mt-12 sm:mt-16">
          <HeroSlider banners={banners} />
        </div>
      )}

      <RecentlyViewed fill={picks} />

      <Section title="Хиты продаж" kicker="Выбор покупателей" href="/search?hit=1">
        <ProductRail products={hits} />
      </Section>

      {/* акции — компактная лента: сколько акций заведено, столько и карточек */}
      {promos.length > 0 && (
        <Section title="Акции" kicker="Успейте купить" href="/sale" linkText="Все акции">
          <div className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">
            {promos.map((p) => (
              <Link key={p.id} href={`/sale/${p.slug}`} className="group relative flex w-[78%] shrink-0 snap-start flex-col justify-between overflow-hidden rounded-3xl p-5 text-white sm:w-auto" style={{ background: p.color }}>
                <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 transition group-hover:scale-110" />
                <div className="relative flex items-baseline gap-3">
                  <p className="h-display shrink-0 text-4xl">{promoHeadline(p)}</p>
                  <div className="min-w-0">
                    <p className="font-semibold leading-tight">{p.title}</p>
                    {p.subtitle && <p className="line-clamp-1 text-sm text-white/75">{p.subtitle}</p>}
                  </div>
                </div>
                <div className="relative mt-4 flex items-center justify-between text-sm">
                  <PromoCountdown endsAt={p.endsAt} />
                  <span className="hidden items-center gap-1 font-semibold sm:flex">Смотреть <ChevronRight className="h-4 w-4" /></span>
                </div>
              </Link>
            ))}
          </div>
        </Section>
      )}

      <AdventTeaser db={db} />

      <Section title="Новинки" kicker="Только что в магазине" href="/search?sort=new">
        <ProductRail products={news} />
      </Section>

      {/* распив и подбор аромата — две узкие полосы в одну строку */}
      <section className="container-x reveal mt-12 grid grid-cols-1 gap-3 md:grid-cols-2">
        <Link href="/raspiv" className="group relative flex min-w-0 items-center gap-4 overflow-hidden rounded-3xl bg-[#2a2220] px-5 py-4 text-cream sm:px-6">
          <span aria-hidden className="relative grid h-14 w-9 shrink-0 place-items-end rounded-b-xl rounded-t-md border-2 border-[#e8c98f]/70 pb-0.5 transition duration-500 group-hover:-translate-y-0.5">
            <span className="absolute -top-2 h-2 w-4 rounded-t bg-[#e8c98f]/80" />
            <span className="h-[55%] w-[82%] rounded-b-lg bg-gradient-to-t from-[#e8c98f] to-[#e8c98f]/40" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[.25em] text-[#e8c98f]">Распив · {decantCount >= 50 ? `${decantCount} ${plural(decantCount, "аромат", "аромата", "ароматов")}` : "оригиналы"}</p>
            <p className="h-display mt-0.5 text-2xl leading-tight">Ниша от 10 мл</p>
            <p className="mt-0.5 line-clamp-1 text-xs text-white/70">Оригинал в атомайзере 8–10 мл</p>
          </div>
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#e8c98f] text-ink transition group-hover:translate-x-0.5"><ChevronRight className="h-4 w-4" /></span>
        </Link>
        <div className="flex min-w-0 flex-col justify-center gap-2.5 rounded-3xl bg-blush px-5 py-4 sm:px-6">
          <Link href="/podbor" className="group flex items-center gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-[.25em] text-rose">Подбор · 4 вопроса</p>
              <p className="h-display mt-0.5 text-2xl leading-tight">Не знаете, какой аромат выбрать?</p>
            </div>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink text-white transition group-hover:translate-x-0.5"><ChevronRight className="h-4 w-4" /></span>
          </Link>
          <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1">
            {notes.map((n) => (
              <Link key={n.name} href={`/search?q=${encodeURIComponent(n.name.toLowerCase())}`} className="shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold transition hover:shadow-md" style={{ background: n.color }}>{n.name}</Link>
            ))}
          </div>
        </div>
      </section>

      {sale.length > 0 && (
        <Section title="Выгодно сейчас" kicker="Скидки" href="/sale">
          <ProductRail products={sale} />
        </Section>
      )}

      {/* хиты каждого раздела меню — одним блоком с вкладками, в том же порядке, что и меню */}
      <Section title="Популярное в разделах" kicker="Хиты каждого раздела">
        <RailTabs tabs={[
          ...cats.map((c) => ({ label: c.name, href: `/catalog/${c.slug}`, products: searchProducts(db, { category: c.id }).slice(0, 8) })),
          { label: "Распив", href: "/raspiv", products: searchProducts(db, { decant: true }).slice(0, 8) },
        ]} />
      </Section>

      {/* клуб и подарки */}
      <section className="container-x reveal mt-16 grid gap-4 md:grid-cols-2">
        <Link href="/club" className="group relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#1c1917] to-[#3a2e2a] p-6 text-[#e8c98f] sm:p-8">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#e8c98f]/15 blur-3xl transition duration-700 group-hover:scale-125" />
          <p className="text-xs font-semibold uppercase tracking-[.28em] opacity-70">Программа лояльности</p>
          <p className="h-display mt-2 text-3xl sm:text-4xl">Клуб Katy</p>
          <p className="mt-3 max-w-sm text-white/80">Накопительная скидка до 10%, которая растёт с каждой покупкой, и подарок на день рождения.</p>
          <span className="mt-4 inline-flex rounded-full bg-[#e8c98f] px-5 py-2.5 text-sm font-semibold text-ink transition group-hover:bg-white">Вступить в клуб</span>
        </Link>
        <Link href="/gift" className="group relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#f6d5d9] to-[#f9ece4] p-6 sm:p-8">
          <div className="absolute -bottom-6 right-6 hidden aspect-[1.6/1] w-48 rotate-[-8deg] rounded-2xl bg-gradient-to-br from-[#7a1f2b] to-[#b8475a] p-4 text-[#fff4e0] shadow-2xl transition duration-500 group-hover:rotate-[-3deg] sm:block">
            <p className="h-display text-xl tracking-[.3em]">KATY</p>
            <p className="h-display absolute bottom-4 left-4 text-3xl">5 000 ₽</p>
          </div>
          <p className="text-xs font-semibold uppercase tracking-[.28em] text-rose">Подарки</p>
          <p className="h-display mt-2 text-3xl sm:text-4xl">Сертификат<br />или подарок</p>
          <p className="mt-3 max-w-xs text-ink-soft">Сертификат на любую сумму с пожеланием или подарок, собранный своими руками.</p>
          <span className="mt-4 inline-flex rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white">Выбрать подарок</span>
        </Link>
      </section>

      <Section title="Журнал Katy" kicker="Советы и подборки" href="/journal" linkText="Все статьи">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {articles.slice(0, 3).map((a) => <JournalCard key={a.slug} a={a} images={articleImages(db, a)} />)}
        </div>
      </Section>

      {/* бренды */}
      <Section title="Популярные бренды" kicker="Только оригинал" href="/brands" linkText="Все бренды">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-3 lg:grid-cols-6">
          {popularBrands.map((b) => (
            <Link key={b.id} href={`/brands/${b.slug}`} className="grid h-28 place-items-center bg-white px-4 text-center font-serif text-xl tracking-wide transition hover:bg-sand">
              {b.name}
            </Link>
          ))}
        </div>
      </Section>

      {/* отзывы */}
      <Section title="Нам доверяют" kicker="Отзывы покупателей">
        <div className="grid gap-4 md:grid-cols-3">
          {db.products
            .flatMap((p) => p.reviews.filter((r) => r.approved).map((r) => ({ ...r, product: p.name })))
            .slice(0, 3)
            .map((r) => (
              <figure key={r.id} className="card p-7">
                <div className="flex gap-0.5 text-gold">{Array.from({ length: r.rating }, (_, i) => <StarIcon key={i} />)}</div>
                <blockquote className="mt-4 text-[15px] leading-relaxed">«{r.text}»</blockquote>
                <figcaption className="mt-5 text-sm"><b>{r.author}</b> <span className="text-ink-soft">о «{r.product}»</span></figcaption>
              </figure>
            ))}
        </div>
      </Section>
    </>
  );
}
