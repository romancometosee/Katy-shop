import Link from "next/link";

export default function Breadcrumbs({ items }: { items: { name: string; href?: string }[] }) {
  return (
    <nav className="flex flex-wrap items-center gap-1.5 text-xs text-ink-soft">
      <Link href="/" className="hover:text-ink">Главная</Link>
      {items.map((it, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <span>/</span>
          {it.href ? <Link href={it.href} className="hover:text-ink">{it.name}</Link> : <span className="text-ink">{it.name}</span>}
        </span>
      ))}
    </nav>
  );
}
