import Breadcrumbs from "@/components/Breadcrumbs";
import Checkout from "@/components/Checkout";
import { getDb } from "@/lib/db";

export const metadata = { title: "Корзина" };

export default async function Page() {
  const db = await getDb();
  const s = db.settings;
  return (
    <div className="container-x pt-8">
      <Breadcrumbs items={[{ name: "Корзина" }]} />
      <h1 className="h-display mb-8 mt-6 text-5xl">Корзина</h1>
      <Checkout mode="cart" freeDeliveryFrom={s.freeDeliveryFrom} deliveryPrice={s.deliveryPrice} giftText={s.giftText} />
    </div>
  );
}
