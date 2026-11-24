import Link from "next/link";
import type { Database } from "@/lib/types";
import { ADVENT_COLOR, adventYear, hasAdvent, moscowToday } from "@/lib/advent";

/** Анонс адвент-календаря: виден с 15 ноября по 24 декабря, если календарь заполнен */
export default function AdventTeaser({ db, compact = false }: { db: Database; compact?: boolean }) {
  const year = adventYear();
  const t = moscowToday();
  const season = (t.y === year && t.m === 12) || (t.y === year && t.m === 11 && t.d >= 15);
  if (!season || !hasAdvent(db, year)) return null;
  const started = t.m === 12;
  const doors = [3, 7, 12, 18, 24];
  return (
    <div className={compact ? "mt-6" : "container-x mt-20"}>
      <Link href="/advent" className="group relative flex flex-col gap-6 overflow-hidden rounded-[2rem] p-7 text-white sm:flex-row sm:items-center sm:justify-between sm:p-10" style={{ background: `linear-gradient(135deg,#1c1917,${ADVENT_COLOR})` }}>
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[.28em] text-[#e8c98f]">{started ? `Сегодня открыто окошко ${t.d}` : "С 1 по 24 декабря"}</p>
          <p className="h-display mt-2 text-4xl sm:text-5xl">Адвент-календарь Katy</p>
          <p className="mt-2 max-w-md text-white/75">Каждый день новое окошко: товар со скидкой только на один день.</p>
        </div>
        <div className="relative flex gap-2">
          {doors.map((d) => (
            <span key={d} className={`h-display grid h-14 w-12 place-items-center rounded-2xl border border-[#e8c98f]/50 text-2xl transition group-hover:-translate-y-1 ${started && d === t.d ? "bg-[#e8c98f] text-ink" : "text-[#e8c98f]"}`} style={{ transitionDelay: `${d * 8}ms` }}>{d}</span>
          ))}
        </div>
      </Link>
    </div>
  );
}
