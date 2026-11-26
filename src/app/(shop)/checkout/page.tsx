import Breadcrumbs from "@/components/Breadcrumbs";
import Checkout from "@/components/Checkout";
import { getDb } from "@/lib/db";

export const metadata = { title: "Оформление заказа" };

export default async function Page() {
  const db = await getDb();
  const s = db.settings;
  // пробники на выбор: популярные ароматы, которые есть в наличии
  const brand = new Map(db.brands.map((b) => [b.id, b.name]));
  const samples = /пробник/i.test(s.giftText)
    ? db.products
        .filter((p) => p.isActive && p.categoryId === "parfyumeriya" && p.variants.some((v) => v.stock > 0) && !/набор|свеч|диффузор|миниатюр/i.test(p.name))
        .sort((a, b) => Number(b.isHit) - Number(a.isHit) || b.rating - a.rating)
        .slice(0, 6)
        .map((p) => `${brand.get(p.brandId) ?? ""} ${p.name}`.trim())
    : [];
  return (
    <div className="container-x pt-8">
      <Breadcrumbs items={[{ name: "Оформление заказа" }]} />
      <h1 className="h-display mb-8 mt-6 text-5xl">Оформление заказа</h1>
      <Checkout mode="checkout" freeDeliveryFrom={s.freeDeliveryFrom} deliveryPrice={s.deliveryPrice} giftText={s.giftText} samples={samples} stores={s.stores ?? []} />
    </div>
  );
}
