import Link from "next/link";
export default function NotFound() {
  return (
    <div className="container-x py-24 text-center">
      <p className="h-display text-7xl">404</p>
      <p className="mt-4 text-ink-soft">Такой страницы нет — возможно, товар закончился или переехал.</p>
      <Link href="/" className="btn-dark mt-8">На главную</Link>
    </div>
  );
}
