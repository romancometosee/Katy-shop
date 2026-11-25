import Link from "next/link";
import { PageHead } from "@/components/admin/ui";
import { getDb } from "@/lib/db";
import { addPro, approvePro, deletePro, newProCode, rejectPro, saveProCategories } from "@/lib/admin-actions";
import { PRO_DEFAULT_DISCOUNT, PRO_DISCOUNTS, PRO_KINDS, proCategories } from "@/lib/pro";
import { normPhone } from "@/lib/club";
import { dateRu, rub } from "@/lib/format";
import type { ProAccount } from "@/lib/types";

// Katy PRO: заявки мастеров и салонов, их скидки и коды входа
export default async function ProAdmin() {
  const db = await getDb();
  const pros = db.pros ?? [];
  const pending = pros.filter((p) => p.status === "pending");
  const approved = pros.filter((p) => p.status === "approved");
  const rejected = pros.filter((p) => p.status === "rejected");
  const cats = db.categories.filter((c) => !c.parentId);
  const active = proCategories(db);
  const bought = (phone: string) => db.orders.filter((o) => o.proDiscount && normPhone(o.customer.phone) === phone && o.status !== "cancelled").reduce((s, o) => s + o.total, 0);

  const who = (p: ProAccount) => (
    <td className="p-4">
      <span className="font-medium">{p.name}</span>
      <span className="block text-xs text-ink-soft"><a href={`tel:+${p.phone}`}>+{p.phone}</a> · {PRO_KINDS[p.kind] ?? p.kind}{p.city ? ` · ${p.city}` : ""}</span>
      {p.salon && <span className="block text-xs text-ink-soft">{p.salon}</span>}
      {p.social && <span className="block max-w-xs truncate text-xs">{/^https?:\/\//.test(p.social) ? <a href={p.social} target="_blank" rel="noreferrer" className="underline">{p.social}</a> : p.social}</span>}
      {p.comment && <span className="block max-w-xs text-xs text-ink-soft">«{p.comment}»</span>}
    </td>
  );
  const discountForm = (p: ProAccount, label: string) => (
    <form action={approvePro} className="flex items-center gap-2">
      <input type="hidden" name="phone" value={p.phone} />
      <select name="discount" defaultValue={p.discount || PRO_DEFAULT_DISCOUNT} className="input w-auto py-1.5">
        {[...new Set([...PRO_DISCOUNTS, p.discount].filter(Boolean))].sort((a, b) => a - b).map((d) => <option key={d} value={d}>−{d}%</option>)}
      </select>
      <button className="btn-dark px-4 py-2 text-xs">{label}</button>
    </form>
  );

  return (
    <div>
      <PageHead title="Katy PRO" desc="Мастера и салоны. Мастер оставляет заявку на странице /pro → вы одобряете и выбираете скидку → сообщаете мастеру код (по телефону или в мессенджере). Мастер входит в личный кабинет по телефону и этому коду — и видит свои цены на профессиональные товары. Обычные покупатели ничего этого не видят." />

      <p className="h-display mb-3 text-2xl">Новые заявки ({pending.length})</p>
      <div className="card mb-8 overflow-x-auto p-0">
        <table className="w-full min-w-[640px] text-sm">
          <tbody>
            {pending.map((p) => (
              <tr key={p.phone} className="border-t border-line align-top first:border-0">
                {who(p)}
                <td className="p-4 text-ink-soft">{dateRu(p.createdAt)}</td>
                <td className="p-4">{discountForm(p, "Одобрить")}</td>
                <td className="p-4 text-right"><form action={rejectPro}><input type="hidden" name="phone" value={p.phone} /><button className="text-xs text-ink-soft underline">Отклонить</button></form></td>
              </tr>
            ))}
            {!pending.length && <tr><td className="p-6 text-center text-ink-soft">Новых заявок нет. Ссылка «Katy PRO» есть внизу сайта и в личном кабинете.</td></tr>}
          </tbody>
        </table>
      </div>

      <p className="h-display mb-3 text-2xl">Мастера и салоны ({approved.length})</p>
      <div className="card mb-8 overflow-x-auto p-0">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="text-left text-xs uppercase tracking-wider text-ink-soft"><tr><th className="p-4">Кто</th><th className="p-4">Код для входа</th><th className="p-4">Закупки</th><th className="p-4">Скидка</th><th className="p-4" /></tr></thead>
          <tbody>
            {approved.map((p) => (
              <tr key={p.phone} className="border-t border-line align-top">
                {who(p)}
                <td className="p-4"><span className="rounded-lg bg-sand px-2.5 py-1 font-mono text-base tracking-widest">{p.code}</span><form action={newProCode} className="mt-1"><input type="hidden" name="phone" value={p.phone} /><button className="text-[11px] text-ink-soft underline">новый код</button></form></td>
                <td className="p-4">{rub(bought(p.phone))}<Link href={`/admin/club/${p.phone}`} className="block text-xs text-ink-soft underline">карточка клиента</Link></td>
                <td className="p-4">{discountForm(p, "Сохранить")}</td>
                <td className="p-4 text-right"><form action={rejectPro}><input type="hidden" name="phone" value={p.phone} /><button className="text-xs text-ink-soft underline">Отключить</button></form></td>
              </tr>
            ))}
            {!approved.length && <tr><td className="p-6 text-center text-ink-soft">Пока никого</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <form action={addPro} className="card space-y-3 p-5">
          <p className="h-display text-2xl">Добавить мастера вручную</p>
          <p className="text-xs text-ink-soft">Например, ваш постоянный мастер из магазина. Код для входа появится в таблице выше.</p>
          <div className="grid gap-2 sm:grid-cols-2">
            <input name="name" required placeholder="Имя или салон *" className="input" />
            <input name="phone" required placeholder="Телефон *" className="input" />
            <select name="kind" className="input">{Object.entries(PRO_KINDS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
            <input name="city" placeholder="Город" className="input" />
            <select name="discount" defaultValue={PRO_DEFAULT_DISCOUNT} className="input">{PRO_DISCOUNTS.map((d) => <option key={d} value={d}>−{d}%</option>)}</select>
          </div>
          <button className="btn-dark w-full">Добавить</button>
        </form>
        <form action={saveProCategories} className="card space-y-3 p-5">
          <p className="h-display text-2xl">На какие разделы цены PRO</p>
          <p className="text-xs text-ink-soft">Скидка мастера действует только на эти разделы. На остальное мастер покупает как обычный покупатель.</p>
          <div className="grid grid-cols-2 gap-2">
            {cats.map((c) => <label key={c.id} className="flex items-center gap-2 text-sm"><input type="checkbox" name="cat" value={c.id} defaultChecked={active.includes(c.id)} /> {c.name}</label>)}
          </div>
          <button className="btn-dark w-full">Сохранить</button>
        </form>
      </div>

      {rejected.length > 0 && (
        <details className="mt-8">
          <summary className="cursor-pointer text-sm text-ink-soft">Отклонённые и отключённые ({rejected.length})</summary>
          <div className="card mt-3 overflow-x-auto p-0"><table className="w-full text-sm"><tbody>
            {rejected.map((p) => (
              <tr key={p.phone} className="border-t border-line align-top first:border-0">{who(p)}<td className="p-4">{discountForm(p, "Одобрить")}</td><td className="p-4 text-right"><form action={deletePro}><input type="hidden" name="phone" value={p.phone} /><button className="text-xs text-ink-soft underline">Удалить</button></form></td></tr>
            ))}
          </tbody></table></div>
        </details>
      )}
    </div>
  );
}
