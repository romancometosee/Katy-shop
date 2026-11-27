"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CloseIcon, UserIcon } from "./Icons";

// Иконка «человечек»: открывает небольшое окно с разделами кабинета. Закрывается крестиком,
// нажатием мимо окна, клавишей Esc и при переходе на другую страницу.
const LINKS: [string, string, string][] = [
  ["/account", "Войти и мои заказы", "История покупок, бонусы, повтор заказа"],
  ["/favorites", "Избранное", "Товары, которые вы отметили сердечком"],
  ["/club", "Клуб Katy", "Накопительная скидка и подарки"],
  ["/stores", "Магазины", "Адреса и самовывоз"],
];

export default function AccountMenu() {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const path = usePathname();
  // запоминаем, что человек ходил по сайту, — крестик «Закрыть» на странице вернёт его назад
  useEffect(() => {
    try { sessionStorage.setItem("katy-pages", String(Number(sessionStorage.getItem("katy-pages") || 0) + 1)); } catch {}
  }, [path]);
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    if (!open) return;
    const click = (e: MouseEvent | TouchEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    const key = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", click);
    document.addEventListener("touchstart", click);
    document.addEventListener("keydown", key);
    return () => { document.removeEventListener("mousedown", click); document.removeEventListener("touchstart", click); document.removeEventListener("keydown", key); };
  }, [open]);
  return (
    <div ref={box} className="relative">
      <button type="button" onClick={() => setOpen((v) => !v)} className="p-2" aria-label="Личный кабинет" title="Личный кабинет" aria-expanded={open}>
        <UserIcon className="h-6 w-6" />
      </button>
      {open && (
        <div className="fixed inset-x-3 top-20 z-50 rounded-3xl border border-line bg-white p-5 shadow-2xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-80">
          <div className="mb-3 flex items-start justify-between gap-3">
            <p className="h-display text-2xl">Личный кабинет</p>
            <button type="button" onClick={() => setOpen(false)} className="-m-2 p-2 text-ink-soft hover:text-ink" aria-label="Закрыть">
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>
          <ul className="divide-y divide-line">
            {LINKS.map(([href, t, d]) => (
              <li key={href}>
                <Link href={href} onClick={() => setOpen(false)} className="block py-3 hover:text-rose">
                  <span className="block text-sm font-semibold">{t}</span>
                  <span className="block text-xs text-ink-soft">{d}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
