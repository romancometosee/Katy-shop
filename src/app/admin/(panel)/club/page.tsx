import { PageHead } from "@/components/admin/ui";
import { getDb } from "@/lib/db";
import { dateRu, rub } from "@/lib/format";
import { discountLevel, totalSpend } from "@/lib/club";

// Участники Клуба Katy
export default async function ClubAdmin() {
  const db = await getDb();
  const members = db.members ?? [];
  const today = new Date();
  const soon = (b?: string) => {
    if (!b) return false;
    const d = new Date(b);
    const next = new Date(today.getFullYear(), d.getMonth(), d.getDate());
    const diff = (next.getTime() - today.getTime()) / 86400000;
    return diff >= -1 && diff <= 7;
  };
  return (
    <div>
      <PageHead title="Клуб Katy" desc="Накопительная скидка: чем больше сумма покупок клиента, тем выше его скидка. Она сама применяется при заказе на сайте с тем же номером телефона. Нажмите на имя — откроется карточка клиента: там все покупки и форма «Покупка в магазине». Пороги скидки — в файле club.ts (DISCOUNT_LEVELS)." />
      <p className="mb-3 text-sm text-ink-soft">Участников: {members.length}{members.filter((m) => soon(m.birthday)).length ? ` · день рождения на этой неделе: ${members.filter((m) => soon(m.birthday)).length}` : ""}</p>
      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wider text-ink-soft">
            <tr><th className="p-4">Имя</th><th className="p-4">Телефон</th><th className="p-4">День рождения</th><th className="p-4">Скидка</th><th className="p-4">Сумма покупок</th><th className="p-4">В клубе с</th></tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.phone} className="border-t border-line">
                <td className="p-4 font-medium"><a href={`/admin/club/${m.phone}`} className="underline underline-offset-4 hover:text-rose">{m.name}</a>{soon(m.birthday) && <span className="ml-2 rounded-full bg-rose px-2 py-0.5 text-[11px] font-bold text-white">🎂 скоро ДР</span>}</td>
                <td className="p-4">+{m.phone}</td>
                <td className="p-4">{m.birthday ? new Date(m.birthday).toLocaleDateString("ru-RU", { day: "numeric", month: "long" }) : "—"}</td>
                <td className="p-4 font-semibold">{discountLevel(totalSpend(db, m.phone)).percent}%</td>
                <td className="p-4">{rub(totalSpend(db, m.phone))}</td>
                <td className="p-4 text-ink-soft">{dateRu(m.createdAt)}</td>
              </tr>
            ))}
            {!members.length && <tr><td colSpan={6} className="p-8 text-center text-ink-soft">Пока никто не вступил. Форма вступления — на странице /club.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
