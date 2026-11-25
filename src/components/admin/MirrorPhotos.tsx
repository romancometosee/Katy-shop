"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { mirrorPhotosBatch } from "@/lib/admin-actions";

// Кнопка «Перенести фото к нам»: фото с сайтов брендов скачиваются в наше хранилище пачками
export default function MirrorPhotos({ external, failed }: { external: number; failed: number }) {
  const router = useRouter();
  const [state, setState] = useState<{ running: boolean; moved: number; failed: number; left: number } | null>(null);
  const run = async () => {
    let moved = 0, bad = 0, left = external;
    setState({ running: true, moved, failed: bad, left });
    for (let i = 0; i < 400 && left > 0; i++) {
      const r = await mirrorPhotosBatch().catch(() => null);
      if (!r) break;
      moved += r.moved; bad += r.failed; left = r.left;
      setState({ running: true, moved, failed: bad, left });
      if (r.moved + r.failed === 0) break;
    }
    setState({ running: false, moved, failed: bad, left });
    router.refresh();
  };
  if (!external && !state) return null;
  return (
    <div className="card mb-6 flex flex-wrap items-center gap-4 p-5">
      <div className="min-w-60 flex-1">
        <p className="font-semibold">Фото товаров с сайтов брендов: {state ? state.left : external}</p>
        <p className="text-xs text-ink-soft">Сейчас эти фото открываются с чужих сайтов (chanel.com, dior.com…). В России они могут не загружаться. Нажмите кнопку — фото скопируются к нам и будут открываться всегда.{failed ? ` Не удалось скопировать: ${failed} — их лучше заменить своими фото.` : ""}</p>
        {state && <p className="mt-1 text-sm">{state.running ? "Переношу… " : "Готово: "}перенесено {state.moved}{state.failed ? `, не удалось ${state.failed}` : ""}{state.left ? `, осталось ${state.left}` : ""}</p>}
      </div>
      <button onClick={run} disabled={state?.running} className="btn-dark disabled:opacity-50">{state?.running ? "Переношу…" : "Перенести фото к нам"}</button>
    </div>
  );
}
