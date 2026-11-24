import Link from "next/link";

/** Нумерация страниц: ‹ 1 2 3 … 20 › — сохраняет остальные параметры адреса (фильтры, поиск) */
export default function Pager({ page, pages, params, path = "" }: { page: number; pages: number; params: Record<string, string | string[] | undefined>; path?: string }) {
  if (pages <= 1) return null;
  const href = (n: number) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (k === "page" || v === undefined) return;
      (Array.isArray(v) ? v : [v]).forEach((x) => q.append(k, x));
    });
    if (n > 1) q.set("page", String(n));
    const s = q.toString();
    return `${path}${s ? `?${s}` : "?"}`;
  };
  const nums = new Set([1, pages, page - 1, page, page + 1].filter((n) => n >= 1 && n <= pages));
  const list = [...nums].sort((a, b) => a - b);
  const cls = "grid h-10 min-w-10 place-items-center rounded-full px-3 text-sm font-semibold transition";
  return (
    <nav className="mt-12 flex flex-wrap items-center justify-center gap-2" aria-label="Страницы">
      {page > 1 && <Link href={href(page - 1)} className={`${cls} border border-line hover:bg-sand`} aria-label="Назад">‹</Link>}
      {list.map((n, i) => (
        <span key={n} className="flex items-center gap-2">
          {i > 0 && n - list[i - 1] > 1 && <span className="text-ink-soft">…</span>}
          <Link href={href(n)} className={`${cls} ${n === page ? "bg-ink text-white" : "border border-line hover:bg-sand"}`}>{n}</Link>
        </span>
      ))}
      {page < pages && <Link href={href(page + 1)} className={`${cls} border border-line hover:bg-sand`} aria-label="Вперёд">›</Link>}
    </nav>
  );
}
