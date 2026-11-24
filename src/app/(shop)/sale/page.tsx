import Link from "next/link";
import CatalogView, { type SP } from "@/components/CatalogView";
import PromoCountdown from "@/components/PromoCountdown";
import { getDb } from "@/lib/db";
import { isPromotionLive } from "@/lib/catalog";
import { promoHeadline } from "@/lib/promo";
import AdventTeaser from "@/components/AdventTeaser";

export const metadata = { title: "Акции и скидки" };

export default async function SalePage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const db = await getDb();
  const promos = db.promotions.filter((p) => isPromotionLive(p) && !p.dayDeal);
  return (
    <CatalogView
      db={db}
      title="Акции и скидки"
      description="Все товары со скидкой и в акциях. Цены уже пересчитаны, а «3=2» и подарки посчитаются в корзине."
      crumbs={[{ name: "Акции" }]}
      base={{ sale: true }}
      sp={sp}
      hero={
        <>
        <AdventTeaser db={db} compact />
        {promos.length > 0 && (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {promos.map((p) => (
              <Link key={p.id} href={`/sale/${p.slug}`} className="flex flex-col justify-between gap-6 rounded-3xl p-7 text-white sm:flex-row sm:items-end" style={{ background: p.color }}>
                <div>
                  <p className="h-display text-5xl">{promoHeadline(p)}</p>
                  <p className="mt-1 text-xl font-semibold">{p.title}</p>
                  <p className="text-white/75">{p.subtitle}</p>
                </div>
                <PromoCountdown endsAt={p.endsAt} />
              </Link>
            ))}
          </div>
        )}
        </>
      }
    />
  );
}
