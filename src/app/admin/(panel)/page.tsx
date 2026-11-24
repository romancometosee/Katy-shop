import Link from "next/link";
import { PageHead, statusLabels } from "@/components/admin/ui";
import { getDb } from "@/lib/db";
import { isPromotionLive } from "@/lib/catalog";
import { dateRu, rub } from "@/lib/format";
import { moderateReview } from "@/lib/admin-actions";

export default async function Dashboard() {
  const db = await getDb();
  const orders = db.orders.filter((o) => o.status !== "cancelled");
  const revenue = orders.reduce((s, o) => s + o.total, 0);
  const pending = db.products.flatMap((p) => p.reviews.filter((r) => !r.approved).map((r) => ({ ...r, product: p })));
  const lowStock = db.products.flatMap((p) => p.variants.filter((v) => v.stock <= 2).map((v) => ({ p, v }))).slice(0, 8);
  const stats = [
    ["Заказов", String(db.orders.length), "/admin/orders"],
    ["Выручка", rub(revenue), "/admin/orders"],
    ["Товаров в каталоге", String(db.products.filter((p) => p.isActive).length), "/admin/products"],
    ["Акций идёт", String(db.promotions.filter((p) => isPromotionLive(p)).length), "/admin/promotions"],
  ];
  return (
    <div>
      <PageHead title="Добрый день!" desc="Здесь видно, что происходит в магазине. Слева — все разделы управления." />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(([l, v, h]) => (
          <Link key={l} href={h} className="card p-6 transition hover:shadow-md">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft">{l}</p>
            <p className="h-display mt-2 text-4xl">{v}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Link href="/admin/products/new" className="btn-dark">+ Добавить товар</Link>
        <Link href="/admin/promotions/new" className="btn-light">+ Запустить акцию</Link>
        <Link href="/admin/banners/new" className="btn-light">+ Новый баннер</Link>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <div className="card p-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="h-display text-2xl">Последние заказы</p>
            <Link href="/admin/orders" className="text-sm underline">Все</Link>
          </div>
          {db.orders.length === 0 ? <p className="text-sm text-ink-soft">Заказов пока нет. Они появятся здесь, как только покупатель оформит заказ на сайте.</p> : (
            <ul className="divide-y divide-line">
              {db.orders.slice(0, 6).map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <div>
                    <b>№{o.number}</b> · {o.customer.name}
                    <p className="text-xs text-ink-soft">{dateRu(o.createdAt)} · {o.items.length} поз.</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusLabels[o.status][1]}`}>{statusLabels[o.status][0]}</span>
                  <b>{rub(o.total)}</b>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card p-6">
          <p className="h-display mb-4 text-2xl">Отзывы на проверке ({pending.length})</p>
          {pending.length === 0 ? <p className="text-sm text-ink-soft">Новых отзывов нет.</p> : (
            <ul className="space-y-4">
              {pending.map((r) => (
                <li key={r.id} className="rounded-2xl bg-sand p-4 text-sm">
                  <p><b>{r.author}</b> · {"★".repeat(r.rating)} · <Link href={`/product/${r.product.slug}`} className="underline" target="_blank">{r.product.name}</Link></p>
                  <p className="mt-1">{r.text}</p>
                  <form action={moderateReview} className="mt-3 flex gap-2">
                    <input type="hidden" name="productId" value={r.product.id} />
                    <input type="hidden" name="reviewId" value={r.id} />
                    <button name="action" value="approve" className="rounded-full bg-ink px-4 py-1.5 text-xs font-semibold text-white">Опубликовать</button>
                    <button name="action" value="delete" className="rounded-full border border-line bg-white px-4 py-1.5 text-xs font-semibold">Удалить</button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card p-6 xl:col-span-2">
          <p className="h-display mb-4 text-2xl">Заканчиваются на складе</p>
          {lowStock.length === 0 ? <p className="text-sm text-ink-soft">Всё в наличии.</p> : (
            <ul className="grid gap-2 sm:grid-cols-2">
              {lowStock.map(({ p, v }) => (
                <li key={v.id} className="flex justify-between rounded-xl bg-sand px-4 py-2 text-sm">
                  <Link href={`/admin/products/${p.id}`} className="hover:underline">{p.name} · {v.label}</Link>
                  <b className={v.stock === 0 ? "text-rose" : ""}>{v.stock} шт</b>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
