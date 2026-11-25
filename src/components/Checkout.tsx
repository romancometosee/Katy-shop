"use client";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { useCart } from "./CartProvider";
import ProductImage from "./ProductImage";
import { GiftIcon, MinusIcon, PlusIcon, TrashIcon } from "./Icons";
import { rub } from "@/lib/format";
import { checkPromoCode, loyaltyForPhone, placeOrder } from "@/lib/actions";
import PromoHints from "./PromoHints";
import { useCartQuote } from "./useCartQuote";

type Props = { freeDeliveryFrom: number; deliveryPrice: number; giftText: string; mode: "cart" | "checkout" };

export default function Checkout({ freeDeliveryFrom, deliveryPrice, giftText, mode }: Props) {
  const { lines, subtotal, setQty, remove, clear } = useCart();
  const [promo, setPromo] = useState("");
  const [applied, setApplied] = useState<{ code: string; percent: number } | null>(null);
  const [promoError, setPromoError] = useState("");
  const [delivery, setDelivery] = useState<"courier" | "pickup" | "post">("courier");
  const [error, setError] = useState("");
  const [done, setDone] = useState<number | null>(null);
  const [pending, start] = useTransition();

  const [phone, setPhone] = useState("");
  const [loyalty, setLoyalty] = useState(0);
  useEffect(() => {
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) { setLoyalty(0); return; }
    const t = setTimeout(() => loyaltyForPhone(phone).then((r) => setLoyalty(r.percent)).catch(() => {}), 400);
    return () => clearTimeout(t);
  }, [phone]);

  const quote = useCartQuote(lines);
  // база для скидок: товары без сертификатов, после акций корзины
  const goodsSum = lines.filter((l) => l.productId !== "gift-card" && l.productId !== "gift-box").reduce((s, l) => s + l.price * l.qty, 0);
  const base = Math.max(0, goodsSum - quote.total);
  // накопительная скидка и промокод не суммируются — действует бо́льшая
  const useLoyalty = loyalty > 0 && loyalty >= (applied?.percent ?? 0);
  const loyaltyDiscount = useLoyalty ? Math.round((base * loyalty) / 100) : 0;
  const codeDiscount = applied && !useLoyalty ? Math.round((base * applied.percent) / 100) : 0;
  const discount = quote.total + loyaltyDiscount + codeDiscount;
  const ship = delivery === "pickup" || quote.freeDelivery || subtotal - discount >= freeDeliveryFrom ? 0 : deliveryPrice;
  const total = subtotal - discount + ship;

  if (done)
    return (
      <div className="card mx-auto max-w-xl p-10 text-center">
        <p className="text-5xl">💐</p>
        <h2 className="h-display mt-4 text-4xl">Спасибо за заказ!</h2>
        <p className="mt-3 text-ink-soft">Номер заказа <b className="text-ink">№{done}</b>. Мы свяжемся с вами в ближайшее время, чтобы подтвердить детали. В посылку положим подарок: {giftText.toLowerCase()}.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn-dark">На главную</Link>
          <Link href="/account" className="btn-light">Мои заказы и скидка</Link>
        </div>
      </div>
    );

  if (!lines.length)
    return (
      <div className="card p-12 text-center">
        <p className="h-display text-3xl">Корзина пуста</p>
        <Link href="/catalog/parfyumeriya" className="btn-dark mt-6">В каталог</Link>
      </div>
    );

  const applyPromo = () =>
    start(async () => {
      setPromoError("");
      const r = await checkPromoCode(promo, subtotal);
      if (r.ok) setApplied({ code: r.code, percent: r.percent });
      else { setApplied(null); setPromoError(r.error); }
    });

  const submit = (fd: FormData) =>
    start(async () => {
      setError("");
      const get = (k: string) => String(fd.get(k) ?? "");
      const r = await placeOrder({
        items: lines.map((l) => ({ productId: l.productId, variantId: l.variantId, qty: l.qty, note: l.note })),
        customer: { name: get("name"), phone: get("phone"), email: get("email"), city: get("city"), address: get("address"), comment: get("comment") },
        delivery,
        promoCode: applied?.code,
      });
      if (r.ok) { clear(); setDone(r.number); window.scrollTo({ top: 0 }); }
      else setError(r.error);
    });

  const summary = (
    <div className="card h-fit space-y-4 p-6 lg:sticky lg:top-40">
      <p className="h-display text-2xl">Ваш заказ</p>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between"><span>Товары</span><span>{rub(subtotal)}</span></div>
        {quote.discounts.map((d) => <div key={d.promoId} className="flex justify-between gap-3 text-rose"><span>{d.title}</span><span className="shrink-0">−{rub(d.amount)}</span></div>)}
        {loyaltyDiscount > 0 && <div className="flex justify-between text-rose"><span>Накопительная скидка {loyalty}%</span><span>−{rub(loyaltyDiscount)}</span></div>}
        {codeDiscount > 0 && <div className="flex justify-between text-rose"><span>Промокод {applied?.code}</span><span>−{rub(codeDiscount)}</span></div>}
        {mode === "checkout" && <div className="flex justify-between"><span>Доставка</span><span>{ship ? rub(ship) : "бесплатно"}</span></div>}
        <div className="flex items-center gap-2 text-rose"><GiftIcon className="h-4 w-4" /> Подарок: {giftText.toLowerCase()}</div>
      </div>
      <PromoHints quote={quote} />
      <div className="flex gap-2">
        <input value={promo} onChange={(e) => setPromo(e.target.value)} placeholder="Промокод" className="input py-2.5" />
        <button type="button" onClick={applyPromo} className="btn-light px-4 py-2.5">ОК</button>
      </div>
      {promoError && <p className="text-xs text-rose">{promoError}</p>}
      {applied && !useLoyalty && <p className="text-xs text-emerald-700">Промокод применён: −{applied.percent}%</p>}
      {applied && useLoyalty && <p className="text-xs text-ink-soft">Ваша накопительная скидка {loyalty}% выгоднее промокода — применили её.</p>}
      {mode === "cart" && <p className="text-xs text-ink-soft">Постоянным покупателям накопительная скидка посчитается сама при оформлении по номеру телефона.</p>}
      <div className="flex justify-between border-t border-line pt-4 text-xl font-semibold"><span>Итого</span><span>{rub(total)}</span></div>
      {mode === "cart" ? (
        <Link href="/checkout" className="btn-dark w-full">Оформить заказ</Link>
      ) : (
        <button form="checkout-form" disabled={pending} className="btn-dark w-full">{pending ? "Отправляем…" : "Подтвердить заказ"}</button>
      )}
      {error && <p className="text-sm text-rose">{error}</p>}
    </div>
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      {mode === "cart" ? (
        <ul className="card divide-y divide-line px-6">
          {lines.map((l) => (
            <li key={l.variantId} className="flex gap-5 py-5">
              <Link href={l.slug.startsWith("/") ? l.slug : `/product/${l.slug}`} className="h-32 w-28 shrink-0 overflow-hidden rounded-2xl"><ProductImage images={l.image ? [l.image] : []} art={l.art} /></Link>
              <div className="flex flex-1 flex-col">
                <p className="text-xs font-bold uppercase tracking-wider text-ink-soft">{l.brandName}</p>
                <Link href={l.slug.startsWith("/") ? l.slug : `/product/${l.slug}`} className="text-lg hover:text-rose">{l.name}</Link>
                <p className="text-sm text-ink-soft">{l.variantLabel}</p>
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center rounded-full border border-line">
                    <button className="p-2" onClick={() => setQty(l.variantId, l.qty - 1)} aria-label="Меньше"><MinusIcon className="h-4 w-4" /></button>
                    <span className="w-6 text-center">{l.qty}</span>
                    <button className="p-2" onClick={() => setQty(l.variantId, l.qty + 1)} aria-label="Больше"><PlusIcon className="h-4 w-4" /></button>
                  </div>
                  <p className="text-lg font-semibold">{rub(l.price * l.qty)}</p>
                </div>
              </div>
              <button onClick={() => remove(l.variantId)} className="-m-2 self-start p-2 text-ink-soft hover:text-rose" aria-label="Удалить"><TrashIcon /></button>
            </li>
          ))}
        </ul>
      ) : (
        <form id="checkout-form" action={submit} className="card space-y-6 p-6 sm:p-8">
          <div>
            <p className="h-display mb-4 text-2xl">Контакты</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <input name="name" required placeholder="Имя *" className="input" />
              <input name="phone" required placeholder="Телефон *" className="input" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
              {loyalty > 0 && <p className="text-sm text-emerald-700 sm:col-span-2">Ваша накопительная скидка {loyalty}% — уже учтена в заказе.</p>}
              <input name="email" type="email" placeholder="E-mail" className="input sm:col-span-2" />
            </div>
          </div>
          <div>
            <p className="h-display mb-4 text-2xl">Доставка</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {([["courier", "Курьер", ship || delivery !== "courier" ? `${rub(deliveryPrice)}, бесплатно от ${rub(freeDeliveryFrom)}` : "бесплатно"], ["pickup", "Самовывоз", "бесплатно"], ["post", "Пункт выдачи / почта", "2–6 дней"]] as const).map(([k, t, d]) => (
                <label key={k} className={`cursor-pointer rounded-2xl border p-4 text-sm transition ${delivery === k ? "border-ink bg-sand" : "border-line"}`}>
                  <input type="radio" name="delivery" className="sr-only" checked={delivery === k} onChange={() => setDelivery(k)} />
                  <span className="block font-semibold">{t}</span>
                  <span className="text-xs text-ink-soft">{d}</span>
                </label>
              ))}
            </div>
            {delivery !== "pickup" && (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <input name="city" placeholder="Город" className="input" />
                <input name="address" placeholder="Адрес или пункт выдачи" className="input" />
              </div>
            )}
          </div>
          <textarea name="comment" rows={3} placeholder="Комментарий: пожелания по подарку, удобное время звонка" className="input" />
          <p className="text-xs text-ink-soft">Оплата при получении или по ссылке после подтверждения заказа менеджером.</p>
        </form>
      )}
      {summary}
    </div>
  );
}
