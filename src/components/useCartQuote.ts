"use client";
import { useEffect, useState } from "react";
import { quoteCartAction } from "@/lib/actions";
import type { CartQuote } from "@/lib/promo";
import type { CartLine } from "./CartProvider";

const empty: CartQuote = { discounts: [], gifts: [], hints: [], freeDelivery: false, total: 0 };

/** Акции корзины (3=2, подарки, ступенчатые скидки) — считает сервер, чтобы цифры совпали с заказом */
export function useCartQuote(lines: CartLine[], enabled = true) {
  const [quote, setQuote] = useState<CartQuote>(empty);
  const key = lines.map((l) => `${l.variantId}:${l.qty}`).join("|");
  useEffect(() => {
    if (!enabled) return;
    const items = lines.filter((l) => !l.slug.startsWith("/")).map((l) => ({ productId: l.productId, variantId: l.variantId, qty: l.qty }));
    if (!items.length) { setQuote(empty); return; }
    let alive = true;
    const t = setTimeout(() => {
      quoteCartAction(items).then((q) => { if (alive) setQuote(q); }).catch(() => {});
    }, 150);
    return () => { alive = false; clearTimeout(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled]);
  return quote;
}
