import Link from "next/link";

export function PageHead({ title, desc, action }: { title: string; desc?: string; action?: { href: string; label: string } }) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <h1 className="h-display text-4xl sm:text-5xl">{title}</h1>
        {desc && <p className="mt-2 max-w-2xl text-sm text-ink-soft">{desc}</p>}
      </div>
      {action && <Link href={action.href} className="btn-dark shrink-0">{action.label}</Link>}
    </div>
  );
}

export function Notice({ children }: { children: React.ReactNode }) {
  return <div className="mb-6 rounded-2xl bg-emerald-50 px-5 py-3 text-sm text-emerald-800">{children}</div>;
}

export function Field({ label, children, hint, className = "" }: { label: string; children: React.ReactNode; hint?: string; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="label">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink-soft">{hint}</span>}
    </label>
  );
}

export function Toggle({ name, defaultChecked, label }: { name: string; defaultChecked?: boolean; label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-sm">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="peer sr-only" />
      <span className="relative h-6 w-11 shrink-0 rounded-full bg-stone-300 transition after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition peer-checked:bg-ink peer-checked:after:translate-x-5" />
      {label}
    </label>
  );
}

export const statusLabels: Record<string, [string, string]> = {
  new: ["Новый", "bg-rose text-white"],
  confirmed: ["Подтверждён", "bg-amber-100 text-amber-900"],
  shipped: ["Отправлен", "bg-sky-100 text-sky-900"],
  done: ["Выполнен", "bg-emerald-100 text-emerald-900"],
  cancelled: ["Отменён", "bg-stone-200 text-stone-600"],
};
