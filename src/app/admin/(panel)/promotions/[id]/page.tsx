import Link from "next/link";
import { notFound } from "next/navigation";
import PromotionForm from "@/components/admin/PromotionForm";
import { PageHead } from "@/components/admin/ui";
import { getDb } from "@/lib/db";
import { subcategoriesOf, topCategories } from "@/lib/catalog";

export default async function EditPromotion({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await getDb();
  const promo = id === "new" ? undefined : db.promotions.find((p) => p.id === id);
  if (id !== "new" && !promo) notFound();
  const brandName = (bid: string) => db.brands.find((b) => b.id === bid)?.name ?? "";
  return (
    <div>
      <Link href="/admin/promotions" className="text-sm text-ink-soft hover:underline">← Все акции</Link>
      <PageHead title={promo ? promo.title : "Новая акция"} />
      <PromotionForm
        promo={promo}
        categories={topCategories(db).flatMap((c) => [c, ...subcategoriesOf(db, c.id)])}
        brands={[...db.brands].sort((a, b) => a.name.localeCompare(b.name))}
        products={db.products.map((p) => ({ ...p, brandName: brandName(p.brandId) }))}
      />
    </div>
  );
}
