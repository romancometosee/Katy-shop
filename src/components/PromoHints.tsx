"use client";
import Link from "next/link";
import { GiftIcon } from "./Icons";
import type { CartQuote } from "@/lib/promo";

/** Спокойные подсказки по акциям в корзине: прогресс до подарка, «ещё 1 товар — и 3=2» */
export default function PromoHints({ quote, onNavigate }: { quote: CartQuote; onNavigate?: () => void }) {
  if (!quote.hints.length && !quote.gifts.length) return null;
  return (
    <div className="space-y-2.5">
      {quote.gifts.map((g) => (
        <p key={g.promoId} className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
          <GiftIcon className="h-4 w-4 shrink-0" /> В подарок: {g.text}
        </p>
      ))}
      {quote.hints.map((h) => (
        <Link key={h.promoId} href={h.href} onClick={onNavigate} className="block text-sm text-ink-soft transition hover:text-ink">
          <span>{h.text} →</span>
          {h.progress !== undefined && (
            <span className="mt-1.5 block h-1 overflow-hidden rounded-full bg-sand">
              <span className="block h-full rounded-full bg-rose/70" style={{ width: `${Math.max(6, Math.min(100, h.progress * 100))}%` }} />
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}
