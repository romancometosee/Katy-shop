import Link from "next/link";
import { PageHead, statusLabels } from "@/components/admin/ui";
import { getDb } from "@/lib/db";
import { addStoreSpend, adjustPoints } from "@/lib/admin-actions";
import { LOYALTY_MODE, POINTS_KIND, discountLevel, levelFor, normPhone, totalSpend, yearSpend } from "@/lib/club";
import { dateRu, rub } from "@/lib/format";

// Карточка клиента: все покупки, сумма за год, уровень и история баллов
export default async function CustomerCard({ params }: { params: Promise<{ phone: string }> }) {
  const phone = normPhone(decodeURIComponent((await params).phone));
  const db = await getDb();
  const member = (db.members ?? []).find((m) => m.phone === phone);
  const orders = db.orders.filter((o) => normPhone(o.customer.phone) === phone);
  const spend = yearSpend(db.orders, phone);
  const all = orders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + o.total, 0);
  const total = totalSpend(db, phone);
  const lvl = discountLevel(total);
  const discountMode = LOYALTY_MODE === "discount";
  const name = member?.name ?? orders[0]?.customer.name ?? "Клиент";
  return (
    <div>
      <Link href="/admin/club" className="text-sm text-ink-soft hover:underline">← Клуб Katy</Link>
      <PageHead title={name} desc={`+${phone}${member?.email ? ` · ${member.email}` : ""}${member?.birthday ? ` · день рождения ${new Date(member.birthday).toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}` : ""}`} />
      <div className="mb-8 grid gap-4 sm:grid-cols-4">
        {(discountMode
          ? [
              ["Накопительная скидка", `${lvl.percent}%`],
              ["Сумма покупок", lvl.next ? `${rub(total)} · до ${lvl.next.percent}% ещё ${rub(lvl.next.from - total)}` : rub(total)],
              ["Из них в магазинах", rub(member?.storeSpend ?? 0)],
              ["Заказы на сайте", `${orders.length} · ${rub(all)}`],
            ]
          : [
              ["Баллы", member ? String(member.points) : "не в клубе"],
              ["Уровень", member ? `${levelFor(spend).name} · ${levelFor(spend).percent}%` : "—"],
              ["Покупки за год", rub(spend)],
              ["Всего покупок", `${orders.length} · ${rub(all)}`],
            ]
        ).map(([k, v]) => (
          <div key={k} className="card p-5"><p className="text-xs uppercase tracking-wider text-ink-soft">{k}</p><p className="mt-1 text-xl font-semibold">{v}</p></div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="card p-0">
          <p className="h-display p-5 text-2xl">История покупок</p>
          <table className="w-full text-sm">
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t border-line align-top">
                  <td className="p-4 font-semibold">№{o.number}<span className="block text-xs font-normal text-ink-soft">{dateRu(o.createdAt)}</span></td>
                  <td className="p-4">{o.items.map((i, k) => <span key={k} className="block">{i.name} <span className="text-ink-soft">· {i.variantLabel} × {i.qty}</span></span>)}</td>
                  <td className="p-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusLabels[o.status][1]}`}>{statusLabels[o.status][0]}</span></td>
                  <td className="p-4 text-right font-semibold">{rub(o.total)}{o.loyaltyPercent ? <span className="block text-xs font-normal text-emerald-700">скидка {o.loyaltyPercent}%</span> : null}{o.pointsEarned ? <span className="block text-xs font-normal text-emerald-700">+{o.pointsEarned} баллов</span> : null}</td>
                </tr>
              ))}
              {!orders.length && <tr><td className="p-6 text-center text-ink-soft">Заказов на сайте пока нет</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="space-y-6">
          {discountMode && (
            <form action={addStoreSpend} className="card space-y-3 p-5">
              <p className="h-display text-2xl">Покупка в магазине</p>
              <p className="text-xs text-ink-soft">Сумма добавится к покупкам клиента, и скидка пересчитается сама. Чтобы исправить ошибку, введите сумму с минусом.</p>
              <input type="hidden" name="phone" value={phone} />
              <input name="amount" required inputMode="numeric" placeholder="Сумма, ₽, например 3500" className="input" />
              <input name="note" placeholder="Комментарий, например: магазин на Ленина" className="input" />
              <button className="btn-dark w-full">Добавить</button>
            </form>
          )}
          {member && !discountMode && (
            <form action={adjustPoints} className="card space-y-3 p-5">
              <p className="h-display text-2xl">Баллы вручную</p>
              <input type="hidden" name="phone" value={phone} />
              <div className="flex gap-2">
                <input name="points" required placeholder="+500 или −200" className="input" />
                <select name="kind" className="input w-auto"><option value="manual">Подарок / коррекция</option><option value="store">Покупка в магазине</option></select>
              </div>
              <input name="note" placeholder="Комментарий, например: покупка в магазине на Ленина" className="input" />
              <button className="btn-dark w-full">Сохранить</button>
            </form>
          )}
          <div className="card p-5">
            <p className="h-display text-2xl">{discountMode ? "История" : "История баллов"}</p>
            <ul className="mt-3 divide-y divide-line text-sm">
              {(member?.history ?? []).map((h, i) => (
                <li key={i} className="flex justify-between gap-3 py-2">
                  <span>{POINTS_KIND[h.kind] ?? h.kind}{h.orderNumber ? ` №${h.orderNumber}` : ""}{h.note && <span className="block text-xs text-ink-soft">{h.note}</span>}<span className="block text-xs text-ink-soft">{dateRu(h.at)}</span></span>
                  {h.kind === "storeSpend" ? <b>{(h.amount ?? 0) >= 0 ? "+" : ""}{rub(h.amount ?? 0)}</b> : <b className={h.points >= 0 ? "text-emerald-700" : "text-rose"}>{h.points >= 0 ? "+" : ""}{h.points}</b>}
                </li>
              ))}
              {!member?.history?.length && <li className="py-2 text-ink-soft">Пока пусто</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
