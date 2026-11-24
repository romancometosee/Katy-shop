"use client";
import { useEffect, useState } from "react";

export default function PromoCountdown({ endsAt, className = "" }: { endsAt: string; className?: string }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  if (now === null) return <span className={className}>&nbsp;</span>;
  const ms = Math.max(0, new Date(endsAt).getTime() - now);
  const d = Math.floor(ms / 86400000), h = Math.floor(ms / 3600000) % 24, m = Math.floor(ms / 60000) % 60, s = Math.floor(ms / 1000) % 60;
  const box = (v: number, l: string) => (
    <span className="flex flex-col items-center rounded-xl bg-white/15 px-2.5 py-1.5 leading-none">
      <b className="text-lg tabular-nums">{String(v).padStart(2, "0")}</b>
      <span className="mt-0.5 text-[10px] opacity-70">{l}</span>
    </span>
  );
  return <span className={`flex gap-1.5 ${className}`}>{box(d, "дн")}{box(h, "ч")}{box(m, "мин")}{box(s, "сек")}</span>;
}
