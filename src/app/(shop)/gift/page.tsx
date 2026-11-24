import Breadcrumbs from "@/components/Breadcrumbs";
import GiftStudio from "@/components/GiftStudio";
import { getDb } from "@/lib/db";
import { searchProducts } from "@/lib/catalog";

export const metadata = { title: "Подарки: сертификаты и конструктор подарка", description: "Подарочный сертификат Katy с вашим пожеланием или подарок, собранный своими руками: коробка, наполнение и открытка." };

export default async function GiftPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const sp = await searchParams;
  const db = await getDb();
  // в конструктор — товары в наличии, сначала хиты и с фото
  const products = searchProducts(db, {})
    .filter((p) => p.variants.some((v) => v.stock > 0) && p.categoryId !== "nabory")
    .sort((a, b) => Number(b.images.length > 0) - Number(a.images.length > 0))
    .slice(0, 60);
  return (
    <div className="container-x pt-8">
      <Breadcrumbs items={[{ name: "Подарки" }]} />
      <p className="mt-6 text-xs font-semibold uppercase tracking-[.28em] text-rose">Подарки от Katy</p>
      <h1 className="h-display mt-2 text-5xl sm:text-6xl">Подарите красоту</h1>
      <p className="mt-3 max-w-xl text-ink-soft">Сертификат на любую сумму с вашим пожеланием или подарок, собранный своими руками: выберите коробку, наполнение и напишите открытку.</p>
      <div className="mt-10">
        <GiftStudio products={products} initialTab={sp.tab === "box" ? "box" : "card"} />
      </div>
    </div>
  );
}
