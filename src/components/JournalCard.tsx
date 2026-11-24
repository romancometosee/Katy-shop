import Link from "next/link";
import PhotoFan from "./PhotoFan";
import type { Article } from "@/lib/journal";

// Карточка статьи журнала: обложка из фото товаров статьи
export default function JournalCard({ a, images, big = false }: { a: Article; images: string[]; big?: boolean }) {
  return (
    <Link href={`/journal/${a.slug}`} className="group flex flex-col">
      <div className={`relative overflow-hidden rounded-[1.75rem] ${big ? "aspect-[16/10]" : "aspect-[4/3]"}`} style={{ background: a.color }}>
        <span className="absolute left-4 top-4 z-10 rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider backdrop-blur">{a.tag}</span>
        <div className="absolute inset-x-6 bottom-4 top-12">
          <PhotoFan images={images} className="h-full w-full" />
        </div>
      </div>
      <p className="mt-4 text-xs text-ink-soft">{a.minutes} мин чтения</p>
      <h3 className={`h-display mt-1 leading-tight transition group-hover:text-rose ${big ? "text-3xl sm:text-4xl" : "text-2xl"}`}>{a.title}</h3>
      <p className="mt-2 line-clamp-3 text-sm text-ink-soft">{a.lead}</p>
    </Link>
  );
}
