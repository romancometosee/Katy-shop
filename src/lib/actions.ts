"use server";
// Действия покупателя: отзыв, оформление заказа
import { revalidatePath } from "next/cache";
import { updateDb } from "./db";
import { toView } from "./catalog";
import type { Order } from "./types";
import { GIFT_BOX, GIFT_BOXES, WELCOME_BONUS, levelFor, normPhone, parseGiftCard } from "./club";

export async function submitReview(fd: FormData) {
  const productId = String(fd.get("productId"));
  const author = String(fd.get("author") ?? "").trim().slice(0, 60);
  const text = String(fd.get("text") ?? "").trim().slice(0, 2000);
  const rating = Math.min(5, Math.max(1, Number(fd.get("rating")) || 5));
  if (!author || !text) return;
  await updateDb((db) => {
    const p = db.products.find((x) => x.id === productId);
    if (!p) return;
    p.reviews.unshift({ id: crypto.randomUUID(), author, text, rating, date: new Date().toISOString(), approved: false });
  });
}

export type CheckoutInput = {
  items: { productId: string; variantId: string; qty: number; note?: string }[];
  customer: Order["customer"];
  delivery: Order["delivery"];
  promoCode?: string;
};

export type CheckoutResult = { ok: true; number: number } | { ok: false; error: string };

export async function checkPromoCode(code: string, subtotal: number) {
  const { getDb } = await import("./db");
  const db = await getDb();
  const pc = db.promoCodes.find((p) => p.isActive && p.code.toUpperCase() === code.trim().toUpperCase());
  if (!pc) return { ok: false as const, error: "Промокод не найден" };
  if (subtotal < pc.minTotal) return { ok: false as const, error: `Промокод действует от ${pc.minTotal} ₽` };
  return { ok: true as const, percent: pc.discountPercent, code: pc.code };
}

export async function placeOrder(input: CheckoutInput): Promise<CheckoutResult> {
  const c = input.customer;
  if (!c.name?.trim() || !c.phone?.trim()) return { ok: false, error: "Укажите имя и телефон" };
  if (!input.items.length) return { ok: false, error: "Корзина пуста" };
  const result = await updateDb((db) => {
    const items: Order["items"] = [];
    for (const it of input.items) {
      const qty0 = Math.max(1, Math.min(20, Math.floor(it.qty)));
      const note = it.note?.trim().slice(0, 300) || undefined;
      // подарочный сертификат: сумму и дизайн проверяем на сервере
      if (it.productId === "gift-card") {
        const gc = parseGiftCard(it.variantId);
        if (gc) items.push({ productId: "gift-card", variantId: it.variantId, name: "Подарочный сертификат Katy", variantLabel: `${gc.amount.toLocaleString("ru-RU")} ₽ · ${gc.design.name}`, price: gc.amount, qty: qty0, note });
        continue;
      }
      // подарочная упаковка из конструктора подарка
      if (it.productId === GIFT_BOX.id) {
        const box = GIFT_BOXES.find((b) => it.variantId === `box-${b.id}` || it.variantId.startsWith(`box-${b.id}-`));
        if (box) items.push({ productId: GIFT_BOX.id, variantId: it.variantId, name: "Подарочная упаковка", variantLabel: box.name, price: GIFT_BOX.price, qty: qty0, note });
        continue;
      }
      const p = db.products.find((x) => x.id === it.productId && x.isActive);
      const view = p && toView(db, p);
      const v = view?.variants.find((x) => x.id === it.variantId);
      const raw = p?.variants.find((x) => x.id === it.variantId);
      if (!p || !v || !raw) continue;
      const qty = Math.max(1, Math.min(99, Math.floor(it.qty)));
      items.push({ productId: p.id, variantId: v.id, name: `${view!.brandName} ${p.name}`, variantLabel: v.label, price: v.price, qty });
      raw.stock = Math.max(0, raw.stock - qty);
    }
    if (!items.length) return { ok: false as const, error: "Товары из корзины больше недоступны" };
    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    let discount = 0;
    let promoCode: string | undefined;
    if (input.promoCode) {
      const pc = db.promoCodes.find((p) => p.isActive && p.code.toUpperCase() === input.promoCode!.trim().toUpperCase());
      if (pc && subtotal >= pc.minTotal) {
        discount = Math.round((subtotal * pc.discountPercent) / 100);
        promoCode = pc.code;
      }
    }
    const deliveryPrice = input.delivery === "pickup" || subtotal - discount >= db.settings.freeDeliveryFrom ? 0 : db.settings.deliveryPrice;
    const number = 1000 + db.orders.length + 1;
    // Клуб Katy: баллы за заказ участнику с этим телефоном
    const member = (db.members ?? []).find((m) => m.phone === normPhone(c.phone));
    if (member) {
      const yearAgo = Date.now() - 365 * 86400000;
      const spend = db.orders.filter((o) => normPhone(o.customer.phone) === member.phone && o.status !== "cancelled" && new Date(o.createdAt).getTime() > yearAgo).reduce((s, o) => s + o.total, 0);
      // сертификаты баллами не облагаются — баллы начислятся, когда сертификатом оплатят товары
      const base = items.filter((i) => i.productId !== "gift-card").reduce((s, i) => s + i.price * i.qty, 0);
      member.points += Math.floor((Math.max(0, base - discount) * levelFor(spend).percent) / 100);
    }
    db.orders.unshift({
      id: crypto.randomUUID(),
      number,
      createdAt: new Date().toISOString(),
      customer: {
        name: c.name.trim(), phone: c.phone.trim(), email: c.email?.trim() ?? "", city: c.city?.trim() ?? "", address: c.address?.trim() ?? "", comment: c.comment?.trim() ?? "",
      },
      delivery: input.delivery,
      items,
      subtotal,
      discount,
      deliveryPrice,
      total: subtotal - discount + deliveryPrice,
      promoCode,
      gift: db.settings.giftText,
      status: "new",
    });
    return { ok: true as const, number };
  });
  revalidatePath("/admin");
  return result;
}

export type JoinResult = { ok: true; points: number; already: boolean } | { ok: false; error: string };

/** Вступление в Клуб Katy */
export async function joinClub(input: { name: string; phone: string; birthday?: string; email?: string; agree: boolean }): Promise<JoinResult> {
  const name = input.name?.trim().slice(0, 60);
  const phone = normPhone(input.phone ?? "");
  if (!name) return { ok: false, error: "Укажите имя" };
  if (phone.length !== 11) return { ok: false, error: "Проверьте номер телефона" };
  if (!input.agree) return { ok: false, error: "Нужно согласие с правилами клуба" };
  const birthday = /^\d{4}-\d{2}-\d{2}$/.test(input.birthday ?? "") ? input.birthday : undefined;
  const res = await updateDb((db) => {
    db.members ??= [];
    const found = db.members.find((m) => m.phone === phone);
    if (found) return { ok: true as const, points: found.points, already: true };
    db.members.unshift({ phone, name, birthday, email: input.email?.trim().slice(0, 100) || undefined, points: WELCOME_BONUS, createdAt: new Date().toISOString() });
    return { ok: true as const, points: WELCOME_BONUS, already: false };
  });
  revalidatePath("/admin/club");
  return res;
}

