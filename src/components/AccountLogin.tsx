"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { loginByOrder, requestCode, verifyCode } from "@/lib/account-actions";

// Вход в личный кабинет: телефон → код из SMS. Пока SMS не подключены — телефон + номер своего заказа.
export default function AccountLogin({ sms }: { sms: boolean }) {
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [code, setCode] = useState("");
  const [order, setOrder] = useState("");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const router = useRouter();
  const done = () => router.refresh();

  return (
    <div className="mx-auto max-w-md rounded-[1.75rem] bg-white p-6 shadow-sm sm:p-8">
      <p className="h-display text-3xl">Вход в личный кабинет</p>
      <p className="mt-2 text-sm text-ink-soft">История покупок, ваша накопительная скидка и статус заказов — по вашему номеру телефона.</p>
      <form
        className="mt-6 space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          setError("");
          start(async () => {
            if (sms && step === "phone") {
              const r = await requestCode(phone);
              if (r.ok) setStep("code");
              else setError(r.error);
            } else if (sms) {
              const r = await verifyCode(phone, code);
              if (r.ok) done();
              else setError(r.error);
            } else {
              const r = await loginByOrder(phone, order);
              if (r.ok) done();
              else setError(r.error);
            }
          });
        }}
      >
        <input value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="Телефон" inputMode="tel" autoComplete="tel" className="input" disabled={step === "code"} />
        {sms && step === "code" && (
          <>
            <input value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 4))} required placeholder="Код из SMS" inputMode="numeric" autoComplete="one-time-code" className="input text-center text-xl tracking-[.5em]" autoFocus />
            <button type="button" onClick={() => { setStep("phone"); setCode(""); }} className="text-xs text-ink-soft underline">Изменить номер</button>
          </>
        )}
        {!sms && (
          <>
            <input value={order} onChange={(e) => setOrder(e.target.value)} required placeholder="Номер любого заказа (или код мастера PRO)" inputMode="numeric" className="input" />
            <p className="text-xs text-ink-soft">Скоро вход будет по коду из SMS. Пока подтвердите, что это вы, номером заказа: он есть в письме и в сообщении от менеджера.</p>
          </>
        )}
        {error && <p className="text-sm text-rose">{error}</p>}
        <button disabled={pending} className="btn-dark w-full py-3.5 disabled:opacity-50">
          {pending ? "Минутку…" : sms && step === "phone" ? "Получить код" : "Войти"}
        </button>
      </form>
    </div>
  );
}
