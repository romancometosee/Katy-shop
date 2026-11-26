import Link from "next/link";
import { PageHead } from "@/components/admin/ui";
import { getDb } from "@/lib/db";
import { closeStockAlert } from "@/lib/admin-actions";
import { dateRu } from "@/lib/format";

// «Сообщить о поступлении»: кто ждёт какой товар
export default async function Waitlist() {
  const db = await getDb();
  const alerts = db.stockAlerts ?? [];
  const info = (a: (typeof alerts)[number]) => {
    const p = db.products.find((x) => x.id === a.productId);
    const v = p?.variants.find((x) => x.id === a.variantId);
    const brand = db.brands.find((b) => b.id === p?.brandId)?.name ?? "";
    return { p, v, name: p ? `${brand} ${p.name}` : "Товар удалён" };
  };
  const ready = alerts.filter((a) => a.notifiedAt);
  const waiting = alerts.filter((a) => !a.notifiedAt);
  // сколько человек ждут каждый товар — чтобы понять, что заказать у поставщика
  const top = Object.entries(waiting.reduce<Record<string, number>>((m, a) => ((m[`${a.productId}|${a.variantId}`] = (m[`${a.productId}|${a.variantId}`] ?? 0) + 1), m), {})).sort((a, b) => b[1] - a[1]);

  const row = (a: (typeof alerts)[number], showSms: boolean) => {
    const { p, v, name } = info(a);
    return (
      <tr key={a.id} className="border-t border-line">
        <td className="p-4">{p ? <Link href={`/admin/products/${p.id}`} className="underline underline-offset-4 hover:text-rose">{name}</Link> : name}<span className="block text-xs text-ink-soft">{v?.label}</span></td>
        <td className="p-4 whitespace-nowrap"><a href={`tel:+${a.phone}`} className="font-medium">+{a.phone}</a></td>
        <td className="p-4 text-ink-soft">{dateRu(showSms ? a.notifiedAt! : a.createdAt)}</td>
        {showSms && <td className="p-4">{a.smsSent ? <span className="text-emerald-700">SMS отправлено</span> : <span className="font-semibold text-rose">Позвоните клиенту</span>}</td>}
        <td className="p-4 text-right"><form action={closeStockAlert}><input type="hidden" name="id" value={a.id} /><button className="text-xs text-ink-soft underline">{showSms ? "Готово" : "Удалить"}</button></form></td>
      </tr>
    );
  };

  return (
    <div>
      <PageHead title="Ждут поступления" desc="Покупатели нажали «Сообщить о поступлении» на товаре, которого нет. Когда вы ставите товару остаток больше нуля, клиенты попадают в список «Товар поступил». SMS уйдёт само, когда подключим SMS-сервис, а пока им можно позвонить." />
      {top.length > 0 && (
        <div className="card mb-6 p-5">
          <p className="h-display text-2xl">Чего ждут больше всего</p>
          <p className="text-xs text-ink-soft">Подсказка, что заказать у поставщика в первую очередь</p>
          <ul className="mt-3 space-y-1 text-sm">
            {top.slice(0, 10).map(([k, n]) => { const [productId, variantId] = k.split("|"); const { name, v } = info({ productId, variantId } as (typeof alerts)[number]); return <li key={k} className="flex justify-between gap-3"><span>{name} <span className="text-ink-soft">· {v?.label}</span></span><b>{n} чел.</b></li>; })}
          </ul>
        </div>
      )}
      {ready.length > 0 && (
        <>
          <p className="h-display mb-3 text-2xl">Товар поступил ({ready.length})</p>
          <div className="card mb-8 overflow-x-auto p-0"><table className="w-full text-sm"><tbody>{ready.map((a) => row(a, true))}</tbody></table></div>
        </>
      )}
      <p className="h-display mb-3 text-2xl">Ждут ({waiting.length})</p>
      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <tbody>
            {waiting.map((a) => row(a, false))}
            {!waiting.length && <tr><td className="p-8 text-center text-ink-soft">Пока никто не ждёт. Кнопка «Сообщить о поступлении» появляется на товаре, когда его остаток 0.</td></tr>}
          </tbody>
        </table>
      </div>
      <p className="h-display mb-3 mt-10 text-2xl">Подписались на новости ({(db.subscribers ?? []).length})</p>
      <div className="card p-5 text-sm">
        {(db.subscribers ?? []).length ? (
          <>
            <p className="mb-2 text-xs text-ink-soft">Адреса из формы в подвале сайта. Их можно скопировать в сервис рассылок.</p>
            <textarea readOnly rows={Math.min(8, (db.subscribers ?? []).length + 1)} className="input font-mono text-xs" value={[...(db.subscribers ?? [])].reverse().map((x) => x.email).join("\n")} />
          </>
        ) : (
          <p className="text-ink-soft">Пока никто. Форма «Ваш e-mail для скидок» — в самом низу сайта.</p>
        )}
      </div>
    </div>
  );
}
