"use server";
// Действия покупателя: отзыв, оформление заказа
import { revalidatePath } from "next/cache";
import { updateDb } from "./db";
import { toView } from "./catalog";
import type { Order } from "./types";

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
  items: { productId: string; variantId: string; qty: number }[];
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
