"use client";
import { useState, useTransition } from "react";
import { subscribeStock } from "@/lib/actions";

// «Сообщить о поступлении»: клиент оставляет телефон, когда товара нет
export default function StockAlertForm({ productId, variantId, label }: { productId: string; variantId: string; label: string }) {
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  if (done)
    return <p className="mt-3 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">Готово! Сообщим на этот номер, как только {label} снова появится.</p>;
  if (!open)
    return (
      <button id="stock-alert" onClick={() => setOpen(true)} className="mt-3 w-full rounded-full border border-ink py-3.5 text-sm font-semibold transition hover:bg-ink hover:text-white">
        🔔 Сообщить о поступлении
      </button>
    );
  return (
    <form
      id="stock-alert"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          setError("");
          const r = await subscribeStock({ productId, variantId, phone });
          if (r.ok) setDone(true);
          else setError(r.error);
        });
      }}
      className="mt-3 rounded-2xl bg-white p-4"
    >
      <p className="text-sm">Оставьте телефон — сообщим, когда {label} снова будет в наличии.</p>
      <div className="mt-3 flex gap-2">
        <input value={phone} onChange={(e) => setPhone(e.target.value)} required inputMode="tel" autoFocus placeholder="+7 900 000-00-00" className="input py-2.5" />
        <button disabled={pending} className="btn-dark shrink-0 px-5 py-2.5">{pending ? "…" : "Сообщить мне"}</button>
      </div>
      {error && <p className="mt-2 text-xs text-rose">{error}</p>}
    </form>
  );
}
