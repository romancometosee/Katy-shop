import { notFound } from "next/navigation";
import CatalogView, { type SP } from "@/components/CatalogView";
import PromoCountdown from "@/components/PromoCountdown";
import { getDb } from "@/lib/db";
import { isPromotionLive, promotionMatches } from "@/lib/catalog";
import { dateRu } from "@/lib/format";
import { promoHeadline, promoRules } from "@/lib/promo";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const promo = (await getDb()).promotions.find((p) => p.slug === slug);
  return promo ? { title: promo.title, description: promo.subtitle } : {};
}

export default async function PromoPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<SP> }) {
  const { slug } = await params;
  const sp = await searchParams;
  const db = await getDb();
  const promo = db.promotions.find((p) => p.slug === slug);
  if (!promo) notFound();
  const live = isPromotionLive(promo);
  const ids = db.products.filter((p) => promotionMatches(promo, p)).map((p) => p.id);
  const base = { ids };
  return (
    <CatalogView
      db={db}
      title={promo.title}
      description={`${promo.subtitle}. ${live ? `Действует до ${dateRu(promo.endsAt)}.` : "Акция завершена."} Товаров в акции: ${ids.length}.`}
      crumbs={[{ name: "Акции", href: "/sale" }, { name: promo.title }]}
      base={base}
      sp={sp}
      hero={
        <div className="mt-6 flex flex-col justify-between gap-4 rounded-3xl p-8 text-white sm:flex-row sm:items-center" style={{ background: promo.color }}>
          <div>
            <p className="h-display text-6xl">{promoHeadline(promo)}</p>
            <p className="mt-2 max-w-xl text-white/80">{promoRules(promo)}</p>
          </div>
          {live && <PromoCountdown endsAt={promo.endsAt} />}
        </div>
      }
    />
  );
}
