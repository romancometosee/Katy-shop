import Link from "next/link";
import { ChevronRight } from "./Icons";

export default function Section({ title, kicker, href, linkText = "Смотреть все", children, className = "" }: { title: string; kicker?: string; href?: string; linkText?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`reveal container-x mt-20 ${className}`}>
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          {kicker && <p className="mb-2 text-xs font-semibold uppercase tracking-[.25em] text-gold">{kicker}</p>}
          <h2 className="h-display text-4xl sm:text-5xl">{title}</h2>
        </div>
        {href && (
          <Link href={href} className="hidden shrink-0 items-center gap-1 text-sm font-semibold underline-offset-4 hover:underline sm:flex">
            {linkText} <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
