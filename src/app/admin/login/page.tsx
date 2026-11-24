"use client";
import { useActionState } from "react";
import { login } from "@/lib/admin-actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, null);
  return (
    <div className="grid min-h-screen place-items-center bg-sand p-4">
      <form action={action} className="card w-full max-w-sm space-y-4 p-8">
        <p className="h-display text-center text-4xl tracking-[.25em]">KATY</p>
        <p className="text-center text-sm text-ink-soft">Вход в управление магазином</p>
        <input name="password" type="password" required placeholder="Пароль" className="input" autoFocus />
        {state?.error && <p className="text-sm text-rose">{state.error}</p>}
        <button disabled={pending} className="btn-dark w-full">Войти</button>
      </form>
    </div>
  );
}
