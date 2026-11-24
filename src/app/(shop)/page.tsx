import Link from "next/link";
import HeroSlider from "@/components/HeroSlider";
import TitleScreen from "@/components/TitleScreen";
import RecentlyViewed from "@/components/RecentlyViewed";
import Section from "@/components/Section";
import ProductRail from "@/components/ProductRail";
import ProductArt from "@/components/ProductArt";
import PhotoFan from "@/components/PhotoFan";
import { categoryImages, quizImages } from "@/lib/productImages";
import PromoCountdown from "@/components/PromoCountdown";
import { GiftIcon, ShieldIcon, SparkIcon, TruckIcon, ChevronRight, StarIcon } from "@/components/Icons";
import { getDb } from "@/lib/db";
import { isPromotionLive, searchProducts, topCategories } from "@/lib/catalog";
import { rub } from "@/lib/format";
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
  const niche = searchProducts(db, { subcategory: "parfyumeriya--nishevaya" }).slice(0, 4);
  const nails = searchProducts(db, { category: "nogti" }).slice(0, 8);
  const hair = searchProducts(db, { category: "volosy" }).slice(0, 8);
  const promos = db.promotions.filter((p) => isPromotionLive(p));
  const popularBrands = db.brands.filter((b) => b.isPopular).slice(0, 12);
  const s = db.settings;

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
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-7">
          {cats.map((c) => (
            <Link key={c.id} href={`/catalog/${c.slug}`} className="group relative flex aspect-[3/4] flex-col overflow-hidden rounded-3xl" style={{ background: c.art.bg }}>
              {categoryImages[c.slug]?.length ? (
                <PhotoFan images={categoryImages[c.slug]} className="mx-3 mt-5 h-[58%]" />
              ) : (
                <ProductArt {...c.art} withBg={false} className="mx-auto mt-4 h-[62%] transition duration-500 group-hover:-translate-y-1 group-hover:scale-105" />
              )}
              <div className="mt-auto p-4">
                <p className="h-display text-2xl leading-tight">{c.name}</p>
                <p className="mt-1 flex items-center text-xs font-semibold text-ink-soft">
                  {db.products.filter((p) => p.categoryId === c.id && p.isActive).length} товаров <ChevronRight className="h-3.5 w-3.5" />
                </p>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {/* баннеры акций и подборок — уже не на первом экране */}
      {banners.length > 0 && (
        <div className="container-x mt-20">
          <HeroSlider banners={banners} />
        </div>
      )}

      <RecentlyViewed />

      <Section title="Хиты продаж" kicker="Выбор покупателей" href="/search?hit=1">
        <ProductRail products={hits} />
      </Section>

      {/* акции */}
      {promos.length > 0 && (
        <Section title="Акции недели" kicker="Успейте купить" href="/sale" linkText="Все акции">
          <div className="grid gap-4 md:grid-cols-2">
            {promos.map((p) => (
              <Link key={p.id} href={`/sale/${p.slug}`} className="group relative flex min-h-56 flex-col justify-between overflow-hidden rounded-3xl p-8 text-white" style={{ background: p.color }}>
                <div className="absolute -right-10 -top-10 h-56 w-56 rounded-full bg-white/10 transition group-hover:scale-110" />
                <div className="absolute -bottom-16 right-20 h-40 w-40 rounded-full bg-white/5" />
                <div className="relative">
                  <p className="h-display text-6xl">−{p.discountPercent}%</p>
                  <p className="mt-2 text-2xl font-semibold">{p.title}</p>
                  <p className="mt-1 text-white/75">{p.subtitle}</p>
                </div>
                <div className="relative mt-6 flex items-center justify-between">
                  <PromoCountdown endsAt={p.endsAt} />
                  <span className="flex items-center gap-1 text-sm font-semibold">Смотреть <ChevronRight className="h-4 w-4" /></span>
                </div>
              </Link>
            ))}
          </div>
        </Section>
      )}

      <Section title="Новинки" kicker="Только что в магазине" href="/search?sort=new">
        <ProductRail products={news} />
      </Section>

      {/* подбор аромата */}
      <section className="container-x mt-20">
        <div className="relative overflow-hidden rounded-[2rem] bg-blush px-8 py-14 sm:px-14 lg:flex lg:items-center lg:justify-between">
          <div className="relative z-10 max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[.25em] text-rose">Персональный подбор</p>
            <h2 className="h-display mt-3 text-4xl sm:text-5xl">Не знаете, какой аромат выбрать?</h2>
            <p className="mt-4 text-ink-soft">Ответьте на 4 простых вопроса — мы подберём ароматы под ваш характер, сезон и любимые ноты. А в заказ положим пробники, чтобы вы точно не ошиблись.</p>
            <Link href="/podbor" className="btn-dark mt-8">Подобрать аромат</Link>
          </div>
          <Link href="/podbor" className="group mt-10 block h-64 w-full max-w-md sm:h-80 lg:mt-0">
            <PhotoFan images={quizImages} className="h-full w-full" />
          </Link>
        </div>
      </section>

      {/* ноты */}
      <Section title="Ароматы по нотам" kicker="Найдите свой любимый аккорд">
        <div className="flex flex-wrap gap-3">
          {notes.map((n) => (
            <Link key={n.name} href={`/search?q=${encodeURIComponent(n.name.toLowerCase())}`} className="rounded-full px-6 py-3 text-sm font-semibold transition hover:-translate-y-0.5 hover:shadow-md" style={{ background: n.color }}>
              {n.name}
            </Link>
          ))}
        </div>
      </Section>

      {sale.length > 0 && (
        <Section title="Выгодно сейчас" kicker="Скидки" href="/sale">
          <ProductRail products={sale} />
        </Section>
      )}

      {nails.length > 0 && (
        <Section title="Ногти" kicker="Гель-лаки, базы и уход" href="/catalog/nogti">
          <ProductRail products={nails} />
        </Section>
      )}

      {hair.length > 0 && (
        <Section title="Уход за волосами" kicker="Шампуни, бальзамы, маски и масла" href="/catalog/volosy">
          <ProductRail products={hair} />
        </Section>
      )}

      <Section title="Нишевая парфюмерия" kicker="Для ценителей" href="/catalog/parfyumeriya/nishevaya">
        <ProductRail products={niche} />
      </Section>

      <Section title="Журнал Katy" kicker="Советы и подборки" href="/journal" linkText="Все статьи">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {articles.slice(0, 3).map((a) => <JournalCard key={a.slug} a={a} images={articleImages(db, a)} />)}
        </div>
      </Section>

      {/* бренды */}
      <Section title="Популярные бренды" kicker="Более 300 марок" href="/brands" linkText="Все бренды">
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
