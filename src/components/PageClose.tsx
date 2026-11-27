"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Крестик «Закрыть» для страниц, которые открываются из иконок в шапке (избранное, корзина, кабинет).
 *  Возвращает туда, откуда человек пришёл на нашем сайте, иначе — на главную. Работает и клавиша Esc. */
export default function PageClose({ label = "Закрыть" }: { label?: string }) {
  const router = useRouter();
  const close = () => {
    let fromUs = false;
    try { fromUs = history.length > 1 && (Number(sessionStorage.getItem("katy-pages") || 0) > 1 || (!!document.referrer && new URL(document.referrer).origin === location.origin)); } catch {}
    if (fromUs) router.back();
    else router.push("/");
  };
  useEffect(() => {
    const esc = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const t = e.target as HTMLElement | null;
      if (t && /INPUT|TEXTAREA|SELECT/.test(t.tagName)) return;
      // открытое окно (чат Katy, корзина) закрывается само — страницу не трогаем
      const openDialog = [...document.querySelectorAll<HTMLElement>("[role=dialog]")].some((d) => {
        const cs = getComputedStyle(d);
        return d.getClientRects().length > 0 && cs.visibility !== "hidden" && Number(cs.opacity) > 0.1;
      });
      if (openDialog) return;
      close();
    };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <button type="button" onClick={close} aria-label={label} title={label} className="-mr-2 flex shrink-0 items-center gap-1.5 rounded-full py-2 pl-3 pr-2 text-sm text-ink-soft transition hover:bg-sand hover:text-ink">
      <span className="hidden sm:inline">Закрыть</span>
      <span className="grid h-8 w-8 place-items-center rounded-full border border-line bg-white text-xl leading-none">×</span>
    </button>
  );
}
