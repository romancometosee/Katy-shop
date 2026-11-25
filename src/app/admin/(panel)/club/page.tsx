import { PageHead } from "@/components/admin/ui";
import { getDb } from "@/lib/db";
import { dateRu } from "@/lib/format";

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
      <PageHead title="Клуб Katy" desc="Участники программы лояльности. Баллы начисляются автоматически за заказы на сайте с тем же номером телефона. Нажмите на имя — откроется карточка клиента со всеми покупками и историей баллов. Позже подключим вашу накопительную систему из магазинов." />
      <p className="mb-3 text-sm text-ink-soft">Участников: {members.length}{members.filter((m) => soon(m.birthday)).length ? ` · день рождения на этой неделе: ${members.filter((m) => soon(m.birthday)).length}` : ""}</p>
      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wider text-ink-soft">
            <tr><th className="p-4">Имя</th><th className="p-4">Телефон</th><th className="p-4">День рождения</th><th className="p-4">Баллы</th><th className="p-4">В клубе с</th></tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.phone} className="border-t border-line">
                <td className="p-4 font-medium"><a href={`/admin/club/${m.phone}`} className="underline underline-offset-4 hover:text-rose">{m.name}</a>{soon(m.birthday) && <span className="ml-2 rounded-full bg-rose px-2 py-0.5 text-[11px] font-bold text-white">🎂 скоро ДР</span>}</td>
                <td className="p-4">+{m.phone}</td>
                <td className="p-4">{m.birthday ? new Date(m.birthday).toLocaleDateString("ru-RU", { day: "numeric", month: "long" }) : "—"}</td>
                <td className="p-4 font-semibold">{m.points}</td>
                <td className="p-4 text-ink-soft">{dateRu(m.createdAt)}</td>
              </tr>
            ))}
            {!members.length && <tr><td colSpan={5} className="p-8 text-center text-ink-soft">Пока никто не вступил. Форма вступления — на странице /club.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
