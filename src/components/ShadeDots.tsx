import Link from "next/link";
import type { Shade } from "@/lib/catalog";

// Кружочки оттенков: цвет каждого товара линейки, текущий обведён
export default function ShadeDots({ shades, current, max = 6, size = "h-5 w-5" }: { shades: Shade[]; current: string; max?: number; size?: string }) {
  const shown = shades.slice(0, max);
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {shown.map((s) => (
        <Link
          key={s.slug}
          href={`/product/${s.slug}`}
          title={s.name}
          aria-label={`Оттенок ${s.name}`}
          className={`${size} relative rounded-full border after:absolute after:-inset-1.5 after:rounded-full after:content-[''] border-black/10 shadow-inner transition hover:scale-110 ${s.slug === current ? "ring-2 ring-ink ring-offset-2 ring-offset-cream" : ""}`}
          style={{ background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,.55), transparent 45%), ${s.color}` }}
        />
      ))}
      {shades.length > max && <span className="text-xs text-ink-soft">+{shades.length - max}</span>}
    </div>
  );
}
