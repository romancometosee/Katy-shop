"use client";
import { useState, useTransition } from "react";
import { joinClub, type JoinResult } from "@/lib/actions";

// Форма вступления в Клуб Katy
export default function ClubJoin() {
  const [res, setRes] = useState<JoinResult | null>(null);
  const [pending, start] = useTransition();
  if (res?.ok)
    return (
      <div className="rounded-[1.75rem] bg-white p-8 text-center shadow-sm animate-fade-up">
        <p className="text-4xl">✦</p>
        <p className="h-display mt-3 text-3xl">{res.already ? "Вы уже в клубе!" : "Добро пожаловать в клуб!"}</p>
        <p className="mt-2 text-ink-soft">{res.already ? `На вашем счёте ${res.points} баллов.` : `Мы начислили вам ${res.points} приветственных баллов.`} Баллы начисляются за заказы, оформленные на этот номер телефона.</p>
      </div>
    );
  return (
    <form
      action={(fd) =>
        start(async () => {
          const r = await joinClub({ name: String(fd.get("name") ?? ""), phone: String(fd.get("phone") ?? ""), birthday: String(fd.get("birthday") ?? ""), email: String(fd.get("email") ?? ""), agree: fd.get("agree") === "on" });
          setRes(r);
        })
      }
      className="space-y-3 rounded-[1.75rem] bg-white p-6 shadow-sm sm:p-8"
    >
      <p className="h-display text-3xl">Вступить в клуб</p>
      <p className="text-sm text-ink-soft">Бесплатно, за минуту. Если вы уже копили скидку в наших магазинах, она сохранится — мы найдём её по номеру телефона.</p>
      <input name="name" required placeholder="Имя *" className="input" />
      <input name="phone" required placeholder="Телефон *" inputMode="tel" className="input" />
      <label className="block">
        <span className="mb-1 block text-xs text-ink-soft">День рождения — пришлём подарок</span>
        <input name="birthday" type="date" className="input" />
      </label>
      <input name="email" type="email" placeholder="Почта (необязательно)" className="input" />
      <label className="flex items-start gap-2 text-xs text-ink-soft">
        <input name="agree" type="checkbox" className="mt-0.5" required /> Согласен(на) с правилами клуба и обработкой персональных данных
      </label>
      {res && !res.ok && <p className="text-sm text-rose">{res.error}</p>}
      <button disabled={pending} className="btn-dark w-full py-3.5 disabled:opacity-50">{pending ? "Минутку…" : "Вступить и получить баллы"}</button>
    </form>
  );
}
