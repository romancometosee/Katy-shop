"use client";
import { useActionState } from "react";
import { changeAdminPassword } from "@/lib/admin-actions";

export default function PasswordForm({ weak }: { weak: boolean }) {
  const [state, action, pending] = useActionState(changeAdminPassword, null);
  return (
    <form id="password" action={action} className="card mt-8 scroll-mt-8 space-y-4 p-6">
      <p className="h-display text-2xl">Пароль админки</p>
      <p className="text-sm text-ink-soft">
        {weak ? "Сейчас стоит пароль по умолчанию. Придумайте свой — не короче 8 знаков, и запишите его в надёжное место." : "Пароль можно поменять в любой момент. После смены на других устройствах нужно будет войти заново."}
      </p>
      <div className="grid gap-4 sm:grid-cols-3">
        <input name="current" type="password" required placeholder="Текущий пароль" autoComplete="current-password" className="input" />
        <input name="next" type="password" required minLength={8} placeholder="Новый пароль" autoComplete="new-password" className="input" />
        <input name="again" type="password" required minLength={8} placeholder="Новый ещё раз" autoComplete="new-password" className="input" />
      </div>
      {state?.error && <p className="text-sm text-rose">{state.error}</p>}
      {state?.ok && <p className="text-sm text-emerald-700">Пароль изменён. Теперь входите с новым паролем.</p>}
      <button disabled={pending} className="btn-dark">Сменить пароль</button>
    </form>
  );
}
