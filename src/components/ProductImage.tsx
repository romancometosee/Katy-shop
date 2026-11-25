"use client";
import { useEffect, useRef, useState } from "react";
import type { ProductArt as Art } from "@/lib/types";

export default function ProductImage({
  images,
  art,
  label,
  className = "",
}: {
  images: string[];
  art: Art;
  label?: string;
  className?: string;
}) {
  // если фото не загрузилось (сайт бренда недоступен) — показываем аккуратную заглушку, а не пустой квадрат
  const [broken, setBroken] = useState(false);
  const ref = useRef<HTMLImageElement>(null);
  // ошибка могла случиться ещё до загрузки скриптов — проверяем после запуска
  useEffect(() => { const i = ref.current; if (i && i.complete && i.naturalWidth === 0) setBroken(true); }, []);
  if (images[0] && !broken) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <div className="h-full w-full bg-white">
        {/* фото товара на белом фоне; светло-серый фон некоторых снимков осветляем до белого */}
        <img ref={ref} src={images[0]} alt={label || ""} loading="lazy" referrerPolicy="no-referrer" onError={() => setBroken(true)} className={`h-full w-full object-contain p-[6%] brightness-[1.08] contrast-[1.03] ${className}`} />
      </div>
    );
  }
  // Фото пока нет — вместо нарисованного флакона показываем аккуратную карточку с названием бренда
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden p-4 text-center" style={{ background: `linear-gradient(160deg, #ffffff 0%, ${art.bg} 100%)` }}>
      <span className="absolute inset-x-[18%] top-[16%] h-px bg-ink/10" />
      <span className={`h-display text-[clamp(14px,2.2vw,26px)] uppercase leading-tight tracking-[.18em] text-ink/80 ${className}`}>{label || "Katy"}</span>
      <span className="mt-2 text-[10px] font-semibold uppercase tracking-[.3em] text-ink/35">фото скоро</span>
      <span className="absolute inset-x-[18%] bottom-[16%] h-px bg-ink/10" />
    </div>
  );
}
