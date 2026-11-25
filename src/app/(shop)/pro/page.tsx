import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import ProApply from "@/components/ProApply";
import { getDb } from "@/lib/db";
import { currentCustomer } from "@/lib/customer";
import { proCategories, proFor } from "@/lib/pro";

export const metadata = { title: "Katy PRO — для мастеров и салонов", description: "Профессиональные цены на гель-лаки, базы, топы и уход для волос для мастеров маникюра, парикмахеров и салонов." };

export default async function ProPage() {
  const db = await getDb();
  const phone = await currentCustomer();
  const pro = proFor(db, phone);
  const pending = phone && (db.pros ?? []).some((p) => p.phone === phone && p.status === "pending");
  const cats = db.categories.filter((c) => proCategories(db).includes(c.id));
  return (
    <div className="container-x pt-8">
      <Breadcrumbs items={[{ name: "Katy PRO" }]} />
      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#1c1917] to-[#3a2e2a] p-8 text-[#e8c98f] sm:p-10">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#e8c98f]/15 blur-3xl" />
          <p className="text-xs font-semibold uppercase tracking-[.28em] opacity-70">Для мастеров и салонов</p>
          <h1 className="h-display mt-3 text-5xl sm:text-6xl">Katy PRO</h1>
          <p className="mt-3 max-w-md text-white/80">Профессиональные цены для мастеров маникюра, парикмахеров, косметологов и салонов{cats.length ? `: ${cats.map((c) => c.name.toLowerCase()).join(", ")}` : ""}.</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {[["Цены мастера", "ниже обычных на профессиональные товары"], ["Всё в одном месте", "гель-лаки, базы, топы, уход для волос"], ["Личный менеджер", "поможет с закупкой и новинками"], ["Первыми", "новинки, коллекции и обучение"]].map(([a, b]) => (
              <div key={a} className="rounded-2xl bg-white/5 p-4"><p className="h-display text-2xl">{a}</p><p className="text-xs text-white/70">{b}</p></div>
            ))}
          </div>
        </div>
        {pro ? (
          <div className="rounded-[2rem] bg-white p-8">
            <p className="text-xs font-semibold uppercase tracking-[.28em] text-rose">Вы в Katy PRO</p>
            <p className="h-display mt-2 text-6xl">−{pro.discount}%</p>
            <p className="text-ink-soft">ваша цена мастера на профессиональные товары</p>
            <div className="mt-6 flex flex-wrap gap-2">{cats.map((c) => <Link key={c.id} href={`/catalog/${c.slug}`} className="btn-dark">{c.name}</Link>)}</div>
          </div>
        ) : pending ? (
          <div className="rounded-[2rem] bg-white p-8 text-center">
            <p className="h-display text-3xl">Заявка на проверке</p>
            <p className="mt-2 text-ink-soft">Менеджер позвонит вам и сообщит код для входа.</p>
          </div>
        ) : (
          <ProApply />
        )}
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[["1", "Оставьте заявку", "Это займёт минуту"], ["2", "Мы проверим и позвоним", "Сообщим ваш код для входа"], ["3", "Покупайте по ценам PRO", "Войдите в личный кабинет по телефону и коду — цены мастера включатся сами"]].map(([n, t, d]) => (
          <div key={n} className="rounded-3xl bg-sand p-5"><p className="h-display text-4xl text-rose">{n}</p><p className="mt-1 font-semibold">{t}</p><p className="text-sm text-ink-soft">{d}</p></div>
        ))}
      </div>
      {!pro && <p className="mt-6 text-sm text-ink-soft">Уже одобрены? <Link href="/account" className="underline">Войдите в личный кабинет</Link> по телефону и коду мастера.</p>}
    </div>
  );
}
