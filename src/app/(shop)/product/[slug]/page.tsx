import Link from "next/link";
import { notFound } from "next/navigation";
import { abs } from "@/lib/site";
import Breadcrumbs from "@/components/Breadcrumbs";
import ProductBuy from "@/components/ProductBuy";
import ProductTabs from "@/components/ProductTabs";
import ProductImage from "@/components/ProductImage";
import ProductRail from "@/components/ProductRail";
import Section from "@/components/Section";
import { StarIcon } from "@/components/Icons";
import ShadeDots from "@/components/ShadeDots";
import RecentlyViewed, { TrackView } from "@/components/RecentlyViewed";
import { getDb } from "@/lib/db";
import { genderLabel, routineFor, searchProducts, toView } from "@/lib/catalog";
import RoutineBuilder from "@/components/RoutineBuilder";
import { cartPromosFor, promoBadge, promoRules } from "@/lib/promo";
import { dateRu } from "@/lib/format";
import { submitReview } from "@/lib/actions";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await getDb();
  const p = db.products.find((x) => x.slug === slug);
  if (!p) return {};
  const brand = db.brands.find((b) => b.id === p.brandId)?.name;
  const v = toView(db, p);
  const title = `${brand} ${p.name}`;
  const description = `${p.shortDescription} Цена от ${v.price.toLocaleString("ru-RU")} ₽. Оригинал, подарок в каждом заказе.`;
  return {
    title,
    description,
    alternates: { canonical: `/product/${p.slug}` },
    openGraph: { type: "website", title: `${title} — ${v.price.toLocaleString("ru-RU")} ₽`, description: p.shortDescription, url: `/product/${p.slug}`, images: p.images[0] ? [{ url: abs(p.images[0]) }] : undefined },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await getDb();
  const product = db.products.find((x) => x.slug === slug && x.isActive);
  if (!product) notFound();
  const p = toView(db, product);
  const cat = db.categories.find((c) => c.id === product.categoryId);
  const sub = db.categories.find((c) => c.id === product.subcategoryId);
  const reviews = product.reviews.filter((r) => r.approved);
  const routine = routineFor(db, product);
  const related = searchProducts(db, { subcategory: product.subcategoryId }).filter((x) => x.id !== p.id).slice(0, 4);
  const sameBrand = searchProducts(db, { brands: [product.brandId] }).filter((x) => x.id !== p.id).slice(0, 4);

  const facts: [string, string][] = [
    ["Бренд", p.brandName],
    ...(p.gender ? ([["Для кого", genderLabel[p.gender]]] as [string, string][]) : []),
    ...(p.family ? ([["Семейство", p.family]] as [string, string][]) : []),
    ...(product.skinType?.length ? ([["Тип кожи", product.skinType.join(", ")]] as [string, string][]) : []),
    ["Страна бренда", db.brands.find((b) => b.id === product.brandId)?.country ?? ""],
  ];

  // данные для Яндекса и Google: цена, наличие, рейтинг — показываются прямо в поиске
  const ld = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${p.brandName} ${p.name}`,
    description: product.shortDescription,
    brand: { "@type": "Brand", name: p.brandName },
    image: p.images.map(abs),
    sku: product.id,
    ...(reviews.length ? { aggregateRating: { "@type": "AggregateRating", ratingValue: product.rating, reviewCount: reviews.length } } : {}),
    offers: p.variants.map((v) => ({
      "@type": "Offer",
      name: v.label,
      price: v.price,
      priceCurrency: "RUB",
      availability: v.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: abs(`/product/${p.slug}`),
    })),
  };

  return (
    <div className="container-x pt-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
      <Breadcrumbs
        items={[
          ...(cat ? [{ name: cat.name, href: `/catalog/${cat.slug}` }] : []),
          ...(sub && cat ? [{ name: sub.name, href: `/catalog/${cat.slug}/${sub.slug}` }] : []),
          { name: p.name },
        ]}
      />
      <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="space-y-3">
          <div className="relative aspect-square overflow-hidden rounded-[2rem] bg-sand">
            <ProductImage images={product.images} art={product.art} label={p.brandName} />
            <div className="absolute left-5 top-5 flex gap-2">
              {p.discountPercent > 0 && <span className="rounded-full bg-rose px-3 py-1 text-xs font-bold text-white">−{p.discountPercent}%</span>}
              {p.isNew && <span className="rounded-full bg-ink px-3 py-1 text-xs font-bold uppercase text-white">New</span>}
              {p.isHit && <span className="rounded-full bg-gold px-3 py-1 text-xs font-bold uppercase text-white">Хит</span>}
            </div>
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {product.images.slice(1, 5).map((src) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={src} src={src} alt="" className="aspect-square rounded-2xl object-cover" />
              ))}
            </div>
          )}
        </div>

        <div className="lg:pt-4">
          <Link href={`/brands/${p.brandSlug}`} className="text-sm font-bold uppercase tracking-[.2em] text-gold hover:text-ink">{p.brandName}</Link>
          <h1 className="h-display mt-2 text-4xl leading-tight sm:text-5xl">{p.name}</h1>
          <p className="mt-3 text-ink-soft">{p.shortDescription}</p>
          <div className="mt-3 flex items-center gap-2 text-sm">
            <span className="flex text-gold">{Array.from({ length: 5 }, (_, i) => <StarIcon key={i} filled={i < Math.round(p.rating)} />)}</span>
            <span className="font-semibold">{p.rating.toFixed(1)}</span>
            <span className="text-ink-soft">· {reviews.length} отзывов</span>
          </div>
          {p.shades && (
            <div className="mt-6">
              <p className="mb-2.5 text-sm">
                <span className="text-ink-soft">Оттенок:</span> <b>{p.shadeName}</b>
                <span className="text-ink-soft"> · ещё {p.shades.length - 1} в линейке</span>
              </p>
              <ShadeDots shades={p.shades} current={p.slug} max={24} size="h-8 w-8" />
            </div>
          )}
          {cartPromosFor(db, product).map((pr) => (
            <Link key={pr.id} href={`/sale/${pr.slug}`} className="group mt-6 flex items-center gap-4 rounded-2xl border border-line bg-white p-4 transition hover:border-ink/30">
              <span className="grid h-12 min-w-12 shrink-0 place-items-center rounded-xl px-2 text-sm font-bold text-white" style={{ background: pr.color }}>{promoBadge(pr)}</span>
              <span className="text-sm">
                <b className="block">{pr.title}</b>
                <span className="text-ink-soft">{promoRules(pr)} До {dateRu(pr.endsAt)}</span>
                <span className="mt-1 block text-xs font-semibold text-ink group-hover:text-rose">Все товары акции →</span>
              </span>
            </Link>
          ))}
          <div className="mt-8">
            <ProductBuy p={p} giftText={db.settings.giftText} freeDeliveryFrom={db.settings.freeDeliveryFrom} />
          </div>
          <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {facts.map(([k, v]) => (
              <div key={k} className="border-b border-line pb-2">
                <dt className="text-ink-soft">{k}</dt>
                <dd className="font-medium">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {routine && <RoutineBuilder title={routine.title} current={p} currentStep={sub?.name ?? ""} steps={routine.steps} />}

      <div className="mt-16">
        <ProductTabs description={product.description} notes={product.notes} reviews={reviews} productId={product.id} submitReview={submitReview} />
      </div>

      {related.length > 0 && (
        <Section title="Похожие товары" className="!mt-10 !px-0">
          <ProductRail products={related} />
        </Section>
      )}
      {sameBrand.length > 0 && (
        <Section title={`Ещё от ${p.brandName}`} href={`/brands/${p.brandSlug}`} className="!px-0">
          <ProductRail products={sameBrand} />
        </Section>
      )}
      <TrackView item={{ slug: p.slug, name: p.name, brand: p.brandName, image: p.images[0], price: p.price }} />
      <RecentlyViewed exclude={p.slug} bare />
    </div>
  );
}
