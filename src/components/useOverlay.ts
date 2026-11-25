"use client";
import { useEffect } from "react";

let locks = 0;

/**
 * Для всплывающих панелей (корзина, меню, фильтры, Katy): закрываются по Esc,
 * а страница под ними не прокручивается, пока панель открыта.
 */
export function useOverlay(open: boolean, onClose: () => void, lockScroll = true) {
  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", esc);
    if (lockScroll) {
      locks++;
      document.documentElement.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", esc);
      if (lockScroll && --locks === 0) document.documentElement.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, lockScroll]);
}
