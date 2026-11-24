import { PageHead, statusLabels } from "@/components/admin/ui";
import { getDb } from "@/lib/db";
import { rub } from "@/lib/format";
import { setOrderStatus } from "@/lib/admin-actions";

const deliveryLabel = { courier: "Курьер", pickup: "Самовывоз", post: "Пункт выдачи / почта" };

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const db = await getDb();
  const orders = status ? db.orders.filter((o) => o.status === status) : db.orders;
  return (
    <div>
      <PageHead title="Заказы" desc="Новые заказы с сайта. Меняйте статус по мере обработки — покупателю удобно, когда заказ быстро подтверждают." />
      <div className="mb-6 flex flex-wrap gap-2">
        <a href="/admin/orders" className={`chip ${!status ? "chip-active" : ""}`}>Все ({db.orders.length})</a>
        {Object.entries(statusLabels).map(([k, [l]]) => (
          <a key={k} href={`/admin/orders?status=${k}`} className={`chip ${status === k ? "chip-active" : ""}`}>{l} ({db.orders.filter((o) => o.status === k).length})</a>
        ))}
      </div>
      {orders.length === 0 && <div className="card p-10 text-center text-ink-soft">Заказов нет.</div>}
      <div className="space-y-4">
        {orders.map((o) => (
          <details key={o.id} className="card group p-5" open={o.status === "new"}>
            <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-6 gap-y-2">
              <b className="text-lg">№{o.number}</b>
              <span className="text-sm text-ink-soft">{new Date(o.createdAt).toLocaleString("ru-RU")}</span>
              <span className="text-sm">{o.customer.name} · {o.customer.phone}</span>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusLabels[o.status][1]}`}>{statusLabels[o.status][0]}</span>
              <b className="ml-auto text-lg">{rub(o.total)}</b>
            </summary>
            <div className="mt-5 grid gap-6 border-t border-line pt-5 lg:grid-cols-3">
              <div className="text-sm lg:col-span-2">
                <table className="w-full">
                  <tbody>
                    {o.items.map((i) => (
                      <tr key={i.variantId} className="border-b border-line">
                        <td className="py-2">{i.name} <span className="text-ink-soft">· {i.variantLabel}</span>{i.note ? <span className="block text-xs text-rose">«{i.note}»</span> : null}</td>
                        <td className="py-2 text-right">{i.qty} × {rub(i.price)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-3 space-y-1 text-right">
                  {o.promos?.map((pr, k) => <p key={k}>{pr.gift ? `🎁 Положить в заказ: ${pr.gift} (${pr.title})` : `${pr.title}: −${rub(pr.amount)}`}</p>)}
                  {o.discount > 0 && <p>Скидка всего{o.promoCode ? ` (промокод ${o.promoCode})` : ""}: −{rub(o.discount)}</p>}
                  <p>Доставка: {o.deliveryPrice ? rub(o.deliveryPrice) : "бесплатно"}</p>
                  <p className="font-semibold">Итого: {rub(o.total)}</p>
                </div>
              </div>
              <div className="space-y-1 text-sm">
                <p><b>Доставка:</b> {deliveryLabel[o.delivery]}</p>
                {o.customer.city && <p><b>Город:</b> {o.customer.city}</p>}
                {o.customer.address && <p><b>Адрес:</b> {o.customer.address}</p>}
                {o.customer.email && <p><b>E-mail:</b> {o.customer.email}</p>}
                {o.customer.comment && <p><b>Комментарий:</b> {o.customer.comment}</p>}
                <p><b>Подарок:</b> {o.gift}</p>
                <form action={setOrderStatus} className="flex gap-2 pt-3">
                  <input type="hidden" name="id" value={o.id} />
                  <select name="status" defaultValue={o.status} className="input py-2">
                    {Object.entries(statusLabels).map(([k, [l]]) => <option key={k} value={k}>{l}</option>)}
                  </select>
                  <button className="btn-dark px-4 py-2">OK</button>
                </form>
              </div>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
