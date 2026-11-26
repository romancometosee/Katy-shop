"use client";
import { useState, useTransition } from "react";
import { applyPro } from "@/lib/actions";
import { PRO_KINDS } from "@/lib/pro";

// Заявка в Katy PRO
export default function ProApply() {
  const [res, setRes] = useState<Awaited<ReturnType<typeof applyPro>> | null>(null);
  const [pending, start] = useTransition();
  if (res?.ok)
    return (
      <div className="rounded-[2rem] bg-white p-8 text-center">
        <p className="text-4xl">✦</p>
        <p className="h-display mt-3 text-3xl">{res.status === "approved" ? "Вы уже в Katy PRO" : "Заявка отправлена!"}</p>
        <p className="mt-2 text-ink-soft">{res.status === "approved" ? "Войдите в личный кабинет по телефону и коду мастера — цены PRO включатся сами." : "Менеджер проверит её и позвонит вам, обычно в течение дня. После одобрения вы получите код для входа."}</p>
      </div>
    );
  return (
    <form
      action={(fd) =>
        start(async () => {
          const g = (k: string) => String(fd.get(k) ?? "");
          setRes(await applyPro({ name: g("name"), phone: g("phone"), kind: g("kind"), salon: g("salon"), city: g("city"), social: g("social"), comment: g("comment") }));
        })
      }
      className="space-y-3 rounded-[2rem] bg-white p-6 sm:p-8"
    >
      <p className="h-display text-3xl">Стать партнёром</p>
      <p className="text-sm text-ink-soft">Заявку проверяет менеджер, обычно в течение дня.</p>
      <input name="name" required placeholder="Имя *" className="input" />
      <input name="phone" required placeholder="Телефон *" inputMode="tel" className="input" />
      <select name="kind" aria-label="Кто вы" className="input" defaultValue="manicure">
        {Object.entries(PRO_KINDS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
      </select>
      <input name="city" placeholder="Город" className="input" />
      <input name="salon" placeholder="Название салона или студии" className="input" />
      <input name="social" placeholder="Ссылка на ваши работы: ВКонтакте, Instagram, сайт" className="input" />
      <textarea name="comment" rows={2} placeholder="Что обычно закупаете (необязательно)" className="input" />
      {res && !res.ok && <p className="text-sm text-rose">{res.error}</p>}
      <button disabled={pending} className="btn-dark w-full py-3.5 disabled:opacity-50">{pending ? "Отправляем…" : "Отправить заявку"}</button>
    </form>
  );
}
