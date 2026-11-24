import type { Banner } from "./types";

// Цветовые темы баннеров на главной
export const bannerThemes: Record<Banner["theme"], { bg: string; text: string; sub: string; btn: string; art: [string, string] }> = {
  noir: { bg: "linear-gradient(120deg,#1c1917 0%,#3b2a2a 60%,#5b3a3a 100%)", text: "text-white", sub: "text-white/70", btn: "bg-white text-ink hover:bg-gold-light", art: ["#c8433d", "#d4af37"] },
  rose: { bg: "linear-gradient(120deg,#f8e1e4 0%,#f3c9cf 55%,#e9b0bb 100%)", text: "text-ink", sub: "text-ink-soft", btn: "bg-ink text-white hover:bg-black", art: ["#f6c7cf", "#c9a46a"] },
  gold: { bg: "linear-gradient(120deg,#f6ecd9 0%,#ead6ae 60%,#d8b97c 100%)", text: "text-ink", sub: "text-ink-soft", btn: "bg-ink text-white hover:bg-black", art: ["#4b3a63", "#d4af37"] },
  sage: { bg: "linear-gradient(120deg,#e8efe3 0%,#cfdcc5 60%,#b4c7a7 100%)", text: "text-ink", sub: "text-ink-soft", btn: "bg-ink text-white hover:bg-black", art: ["#bcd6b0", "#2f3b2b"] },
  lilac: { bg: "linear-gradient(120deg,#efe9f6 0%,#dccff0 60%,#c4b2e3 100%)", text: "text-ink", sub: "text-ink-soft", btn: "bg-ink text-white hover:bg-black", art: ["#d6c7e6", "#4b3a63"] },
};
