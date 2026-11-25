import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import AccountLogin from "@/components/AccountLogin";
import { getDb } from "@/lib/db";
import { currentCustomer, smsEnabled } from "@/lib/customer";
import { logout } from "@/lib/account-actions";
import { DISCOUNT_LEVELS, discountLevel, normPhone, totalSpend } from "@/lib/club";
import { dateRu, rub } from "@/lib/format";
import { toView } from "@/lib/catalog";
import RepeatOrder from "@/components/RepeatOrder";
import { proFor } from "@/lib/pro";
import type { CartLine } from "@/components/CartProvider";

export const metadata = { title: "Личный кабинет", robots: { index: false } };

const STATUS: Record<string, [string, string]> = {
  new: ["Принят", "bg-sand text-ink"],
  confirmed: ["Подтверждён", "bg-blue-50 text-blue-800"],
  shipped: ["В пути", "bg-amber-50 text-amber-800"],
  done: ["Получен", "bg-emerald-50 text-emerald-800"],
  cancelled: ["Отменён", "bg-rose/10 text-rose"],
};

export default async function AccountPage() {
  const phone = await currentCustomer();
  if (!phone)
    return (
      <div className="container-x pt-8">
        <Breadcrumbs items={[{ name: "Личный кабинет" }]} />
        <div className="mt-10"><AccountLogin sms={await smsEnabled()} /></div>
      </div>
    );

  const db = await getDb();
  const member = (db.members ?? []).find((m) => m.phone === phone);
  const orders = db.orders.filter((o) => normPhone(o.customer.phone) === phone);
  const spend = totalSpend(db, phone);
  const level = discountLevel(spend);
  const next = level.next;
  const maxPercent = DISCOUNT_LEVELS[DISCOUNT_LEVELS.length - 1].percent;
  const storeBuys = (member?.history ?? []).filter((h) => h.kind === "storeSpend");
  const pro = proFor(db, phone);
  const name = member?.name ?? pro?.name ?? orders[0]?.customer.name ?? "";
  // для «Повторить заказ»: что из заказа есть сейчас и по какой цене
  const repeat = (o: (typeof orders)[number]) => {
    const lines: CartLine[] = [];
    let missing = 0;
    for (const i of o.items) {
      const raw = db.products.find((x) => x.id === i.productId && x.isActive);
      if (!raw) { if (i.productId !== "gift-card" && i.productId !== "gift-box") missing++; continue; }
      const p = toView(db, raw);
      const v = p.variants.find((x) => x.id === i.variantId);
      if (!v || v.stock <= 0) { missing++; continue; }
      lines.push({ productId: p.id, variantId: v.id, slug: p.slug, name: p.name, brandName: p.brandName, variantLabel: v.label, price: v.price, oldPrice: v.oldPrice, image: p.images[0], art: p.art, qty: Math.min(i.qty, v.stock) });
    }
    return { lines, missing };
  };

  return (
    <div className="container-x pt-8">
      <Breadcrumbs items={[{ name: "Личный кабинет" }]} />
      <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.28em] text-rose">Личный кабинет</p>
          <h1 className="h-display mt-2 text-5xl leading-none sm:text-6xl">{name ? `Здравствуйте, ${name}` : "Здравствуйте!"}</h1>
          <p className="mt-2 text-ink-soft">+{phone}</p>
        </div>
        <form action={logout}><button className="text-sm text-ink-soft underline underline-offset-4 hover:text-ink">Выйти</button></form>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[380px_1fr]">
        {/* карта клуба: накопительная скидка */}
        <div className="space-y-6">
          {pro && (
            <Link href="/pro" className="block rounded-[1.75rem] border border-[#e8c98f] bg-white p-6">
              <p className="text-xs font-semibold uppercase tracking-[.28em] text-[#b8935a]">Katy PRO · {pro.salon || "мастер"}</p>
              <p className="h-display mt-1 text-4xl">−{pro.discount}%</p>
              <p className="text-sm text-ink-soft">ваша цена мастера на профессиональные товары — уже в ценах на сайте</p>
            </Link>
          )}
          <div className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-[#1c1917] to-[#3a2e2a] p-7 text-[#e8c98f] shadow-xl">
            <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-[#e8c98f]/20 blur-2xl" />
            <p className="h-display text-2xl tracking-[.3em]">KATY</p>
            <p className="text-[10px] uppercase tracking-[.35em] opacity-70">{member ? "club card" : "накопительная скидка"}</p>
            <p className="h-display mt-8 text-6xl leading-none">{level.percent}%</p>
            <p className="text-sm opacity-80">ваша накопительная скидка</p>
            <p className="mt-4 text-xs opacity-70">Сумма покупок: {rub(spend)}</p>
            {next ? (
              <div className="mt-3">
                <div className="h-1.5 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-[#e8c98f]" style={{ width: `${Math.min(100, (spend / next.from) * 100)}%` }} /></div>
                <p className="mt-1.5 text-xs opacity-70">До скидки {next.percent}% осталось {rub(next.from - spend)}</p>
              </div>
            ) : (
              <p className="mt-3 text-xs opacity-70">У вас максимальная скидка {maxPercent}%</p>
            )}
          </div>
          <p className="px-1 text-xs text-ink-soft">Скидка считается сама при оформлении заказа на этот номер телефона и растёт с каждой покупкой — в магазинах и на сайте.</p>
          {!member && (
            <div className="rounded-[1.75rem] bg-sand p-7">
              <p className="h-display text-2xl">Вступите в Клуб Katy</p>
              <p className="mt-2 text-sm text-ink-soft">Бесплатно: подарок на день рождения и ранний доступ к закрытым акциям.</p>
              <Link href="/club" className="btn-dark mt-4">Вступить в клуб</Link>
            </div>
          )}

          {storeBuys.length ? (
            <div className="card p-6">
              <p className="h-display text-2xl">Покупки в магазинах</p>
              <ul className="mt-3 divide-y divide-line text-sm">
                {storeBuys.slice(0, 30).map((h, i) => (
                  <li key={i} className="flex items-center justify-between gap-3 py-2.5">
                    <span>
                      {h.note || "Покупка в магазине"}
                      <span className="block text-xs text-ink-soft">{dateRu(h.at)}</span>
                    </span>
                    <b>{rub(h.amount ?? 0)}</b>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        {/* история покупок */}
        <div>
          <div className="mb-4 flex items-baseline justify-between">
            <p className="h-display text-3xl">Мои заказы</p>
            <p className="text-sm text-ink-soft">{orders.length ? `Всего заказов: ${orders.length}` : ""}</p>
          </div>
          {orders.length === 0 && (
            <div className="card p-8 text-center text-ink-soft">
              Заказов пока нет. <Link href="/" className="text-ink underline">Перейти к покупкам</Link>
            </div>
          )}
          <div className="space-y-4">
            {orders.map((o) => (
              <details key={o.id} className="card group p-5 sm:p-6" open={o === orders[0]}>
                <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-4 gap-y-1">
                  <span className="font-semibold">Заказ №{o.number}</span>
                  <span className="text-sm text-ink-soft">{dateRu(o.createdAt)}</span>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS[o.status]?.[1] ?? ""}`}>{STATUS[o.status]?.[0] ?? o.status}</span>
                  <span className="ml-auto font-semibold">{rub(o.total)}</span>
                </summary>
                <ul className="mt-4 divide-y divide-line border-t border-line text-sm">
                  {o.items.map((i, k) => {
                    const p = db.products.find((x) => x.id === i.productId);
                    return (
                      <li key={k} className="flex items-center justify-between gap-3 py-2.5">
                        <span>{p ? <Link href={`/product/${p.slug}`} className="hover:text-rose">{i.name}</Link> : i.name} <span className="text-ink-soft">· {i.variantLabel} × {i.qty}</span></span>
                        <span className="shrink-0">{rub(i.price * i.qty)}</span>
                      </li>
                    );
                  })}
                </ul>
                <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-ink-soft">
                  {o.discount > 0 && <span>Скидка: −{rub(o.discount)}</span>}
                  <span>Доставка: {o.deliveryPrice ? rub(o.deliveryPrice) : "бесплатно"}</span>
                  {o.loyaltyPercent ? <span className="text-emerald-700">Накопительная скидка {o.loyaltyPercent}%</span> : null}
                  {o.pointsEarned ? <span className="text-emerald-700">Начислено баллов: +{o.pointsEarned}</span> : null}
                  {o.status !== "cancelled" && <span className="w-full sm:ml-auto sm:w-auto"><RepeatOrder {...repeat(o)} /></span>}
                </div>
              </details>
            ))}
          </div>
          {!pro && <p className="mt-6 text-sm text-ink-soft">Вы мастер или салон? <Link href="/pro" className="font-semibold text-ink underline underline-offset-4">Katy PRO</Link> — профессиональные цены для мастеров.</p>}
          <p className="mt-6 text-xs text-ink-soft">Покупки в магазинах Katy появятся здесь, когда подключим кассы магазинов.</p>
        </div>
      </div>
    </div>
  );
}
