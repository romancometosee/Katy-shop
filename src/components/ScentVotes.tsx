"use client";
import { useEffect, useState, useTransition } from "react";
import { voteScent } from "@/lib/actions";
import { plural } from "@/lib/format";
import { SCENT_WHEN, type ScentVotes as Votes } from "@/lib/types";

const LON = ["до часа", "2–3 часа", "4–6 часов", "весь день", "больше суток"];
const SIL = ["у самой кожи", "лёгкий", "заметный", "яркий", "заполняет комнату"];
const avg = (c: number[]) => { const n = c.reduce((a, b) => a + b, 0); return n ? c.reduce((s, v, i) => s + v * (i + 1), 0) / n : 0; };

function Scale({ title, value, labels }: { title: string; value: number; labels: string[] }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="text-ink-soft">{title}</span>
        <b>{value ? labels[Math.round(value) - 1] : "—"}</b>
      </div>
      <div className="mt-2 grid grid-cols-5 gap-1">
        {labels.map((_, i) => <span key={i} className={`h-1.5 rounded-full ${value >= i + 0.5 ? "bg-ink" : "bg-line"}`} />)}
      </div>
    </div>
  );
}

/** «Как раскрывается»: стойкость, шлейф и «когда носить» — по голосам покупателей */
export default function ScentVotes({ productId, initial }: { productId: string; initial?: Votes }) {
  const [votes, setVotes] = useState(initial);
  const [open, setOpen] = useState(false);
  const [voted, setVoted] = useState(false);
  const [lon, setLon] = useState(0);
  const [sil, setSil] = useState(0);
  const [when, setWhen] = useState<string[]>([]);
  const [busy, start] = useTransition();
  const key = `katy-scent-${productId}`;
  useEffect(() => { try { setVoted(!!localStorage.getItem(key)); } catch {} }, [key]);

  const total = votes?.total ?? 0;
  const whenTop = votes ? Object.entries(votes.when).sort((a, b) => b[1] - a[1]).slice(0, 4) : [];
  const send = () => start(async () => {
    const r = await voteScent(productId, { longevity: lon || undefined, sillage: sil || undefined, when });
    if (r) setVotes(r);
    try { localStorage.setItem(key, "1"); } catch {}
    setVoted(true); setOpen(false);
  });
  const pick = (labels: string[], v: number, set: (n: number) => void) => (
    <div className="flex flex-wrap gap-1.5">
      {labels.map((l, i) => <button key={l} type="button" onClick={() => set(i + 1)} className={`rounded-full border px-3 py-1.5 text-xs transition ${v === i + 1 ? "border-ink bg-ink text-white" : "border-line hover:border-ink"}`}>{l}</button>)}
    </div>
  );

  return (
    <div className="rounded-3xl border border-line bg-white p-5">
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-semibold">Как раскрывается</p>
        <span className="text-xs text-ink-soft">{total ? `${total} ${plural(total, "оценка", "оценки", "оценок")} покупателей` : "оценок пока нет"}</span>
      </div>
      {total > 0 ? (
        <div className="mt-4 space-y-4">
          <Scale title="Стойкость" value={avg(votes!.longevity)} labels={LON} />
          <Scale title="Шлейф" value={avg(votes!.sillage)} labels={SIL} />
          {whenTop.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 text-sm">
              <span className="mr-1 text-ink-soft">Чаще носят:</span>
              {whenTop.map(([w]) => <span key={w} className="rounded-full bg-sand px-3 py-1 text-xs">{w}</span>)}
            </div>
          )}
        </div>
      ) : (
        <p className="mt-2 text-sm text-ink-soft">Носили этот аромат? Подскажите другим, насколько он стойкий и когда его лучше носить.</p>
      )}
      {!voted && !open && <button type="button" onClick={() => setOpen(true)} className="mt-4 text-sm font-semibold underline underline-offset-4 hover:text-rose">Оценить аромат</button>}
      {voted && !open && <p className="mt-4 text-xs text-emerald-700">Спасибо, ваша оценка учтена.</p>}
      {open && (
        <div className="mt-4 space-y-4 border-t border-line pt-4">
          <div><p className="mb-2 text-sm text-ink-soft">Сколько держится на вас?</p>{pick(LON, lon, setLon)}</div>
          <div><p className="mb-2 text-sm text-ink-soft">Какой шлейф?</p>{pick(SIL, sil, setSil)}</div>
          <div>
            <p className="mb-2 text-sm text-ink-soft">Когда носите? Можно несколько</p>
            <div className="flex flex-wrap gap-1.5">
              {SCENT_WHEN.map((w) => (
                <button key={w} type="button" onClick={() => setWhen(when.includes(w) ? when.filter((x) => x !== w) : when.length < 4 ? [...when, w] : when)} className={`rounded-full border px-3 py-1.5 text-xs transition ${when.includes(w) ? "border-ink bg-ink text-white" : "border-line hover:border-ink"}`}>{w}</button>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button type="button" disabled={busy || (!lon && !sil && !when.length)} onClick={send} className="btn-dark px-5 py-2.5 disabled:opacity-40">Отправить</button>
            <button type="button" onClick={() => setOpen(false)} className="text-sm text-ink-soft">Отмена</button>
          </div>
        </div>
      )}
    </div>
  );
}
