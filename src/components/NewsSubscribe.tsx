"use client";
import Link from "next/link";
import { useState, useTransition } from "react";
import { subscribeNews } from "@/lib/actions";

export default function NewsSubscribe() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  if (msg?.ok) return <p className="mt-6 max-w-sm text-sm text-[#e8c98f]">{msg.text}</p>;
  return (
    <form
      className="mt-6 max-w-sm"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const r = await subscribeNews(email);
          setMsg(r.ok ? { ok: true, text: "Спасибо! Будем присылать только главное: новинки и закрытые акции." } : { ok: false, text: r.error ?? "Не получилось, попробуйте ещё раз" });
        });
      }}
    >
      <div className="flex gap-2">
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Ваш e-mail для скидок" className="flex-1 rounded-full border border-white/20 bg-transparent px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/40 focus:border-white/50" />
        <button disabled={pending} className="rounded-full bg-white px-5 text-sm font-semibold text-ink disabled:opacity-60">OK</button>
      </div>
      <p className="mt-2 text-[11px] text-white/40">Нажимая OK, вы даёте <Link href="/legal/soglasie" className="underline">согласие на обработку данных</Link>.</p>
      {msg && <p className="mt-2 text-xs text-rose-300">{msg.text}</p>}
    </form>
  );
}
