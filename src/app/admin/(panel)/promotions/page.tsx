import Link from "next/link";
import { PageHead } from "@/components/admin/ui";
import { getDb } from "@/lib/db";
import { isPromotionLive, promotionMatches } from "@/lib/catalog";
import { dateRu, plural } from "@/lib/format";
import { KIND_NAMES, kindOf, promoHeadline } from "@/lib/promo";
import { deletePromoCode, savePromoCode } from "@/lib/admin-actions";

export default async function PromotionsAdmin() {
  const db = await getDb();
  return (
    <div>
      <PageHead title="Акции и промокоды" desc="Акция автоматически снижает цены на выбранные товары на сайте и показывает таймер. Промокод покупатель вводит в корзине." action={{ href: "/admin/promotions/new", label: "+ Новая акция" }} />
      <Link href="/admin/promotions/advent" className="mb-6 flex items-center justify-between gap-4 rounded-3xl border border-line bg-white p-5 transition hover:border-ink/30">
        <span><b className="block text-lg">✦ Адвент-календарь Katy</b><span className="text-sm text-ink-soft">24 товара дня на декабрь: каждый день новое окошко со скидкой</span></span>
        <span className="text-sm font-semibold">Настроить →</span>
      </Link>
      <div className="grid gap-4 md:grid-cols-2">
        {db.promotions.filter((p) => !p.id.startsWith("advent-")).map((p) => {
          const live = isPromotionLive(p);
          const n = db.products.filter((x) => promotionMatches(p, x)).length;
          return (
            <Link key={p.id} href={`/admin/promotions/${p.id}`} className="flex gap-5 rounded-3xl p-6 text-white transition hover:opacity-95" style={{ background: p.color }}>
              <div className="shrink-0"><p className="h-display text-5xl">{promoHeadline(p)}</p><p className="mt-1 text-[11px] uppercase tracking-wider text-white/70">{KIND_NAMES[kindOf(p)]}</p></div>
              <div className="flex-1">
                <p className="text-lg font-semibold">{p.title}</p>
                <p className="text-sm text-white/75">{p.subtitle}</p>
                <p className="mt-3 text-xs text-white/75">{dateRu(p.startsAt)} — {dateRu(p.endsAt)} · {n} {plural(n, "товар", "товара", "товаров")}</p>
              </div>
              <span className={`h-fit rounded-full px-3 py-1 text-xs font-semibold ${live ? "bg-emerald-400 text-ink" : "bg-white/20"}`}>{live ? "Идёт" : p.isActive ? "Запланирована / прошла" : "Выключена"}</span>
            </Link>
          );
        })}
      </div>

      <h2 className="h-display mb-4 mt-12 text-3xl">Промокоды</h2>
      <div className="card divide-y divide-line">
        {db.promoCodes.map((c) => (
          <div key={c.code} className="flex flex-wrap items-center gap-2 p-3">
            <form action={savePromoCode} className="flex flex-1 flex-wrap items-center gap-2">
              <input type="hidden" name="original" value={c.code} />
              <input name="code" defaultValue={c.code} className="input w-40 py-1.5 font-mono font-semibold" />
              <label className="text-xs text-ink-soft">Скидка % <input name="discountPercent" defaultValue={c.discountPercent} className="input ml-1 inline w-16 py-1.5" /></label>
              <label className="text-xs text-ink-soft">от суммы ₽ <input name="minTotal" defaultValue={c.minTotal} className="input ml-1 inline w-24 py-1.5" /></label>
              <label className="flex items-center gap-1 text-xs"><input type="checkbox" name="isActive" defaultChecked={c.isActive} /> Активен</label>
              <button className="rounded-full border border-line px-4 py-1.5 text-xs font-semibold">Сохранить</button>
            </form>
            <form action={deletePromoCode}><input type="hidden" name="code" value={c.code} /><button className="text-xs text-rose">Удалить</button></form>
          </div>
        ))}
        <form action={savePromoCode} className="flex flex-wrap items-center gap-2 bg-sand p-3">
          <input name="code" required placeholder="НОВЫЙКОД" className="input w-40 py-1.5 font-mono" />
          <label className="text-xs text-ink-soft">Скидка % <input name="discountPercent" defaultValue={10} className="input ml-1 inline w-16 py-1.5" /></label>
          <label className="text-xs text-ink-soft">от суммы ₽ <input name="minTotal" defaultValue={0} className="input ml-1 inline w-24 py-1.5" /></label>
          <input type="hidden" name="isActive" value="on" />
          <button className="btn-dark px-4 py-1.5">+ Создать</button>
        </form>
      </div>
    </div>
  );
}
