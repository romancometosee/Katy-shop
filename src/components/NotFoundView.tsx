import Link from "next/link";

// Страница «не найдено» — по-русски и с выходами в магазин


const LINKS = [
  ["Парфюмерия", "/catalog/parfyumeriya"],
  ["Уход за лицом", "/catalog/uhod-za-licom"],
  ["Макияж", "/catalog/makiyazh"],
  ["Волосы", "/catalog/volosy"],
  ["Ногти", "/catalog/nogti"],
  ["Акции", "/sale"],
];

export default function NotFoundView({ standalone = false }: { standalone?: boolean }) {
  return (
    <div className={`flex ${standalone ? "min-h-screen" : "min-h-[60vh]"} flex-col items-center justify-center bg-cream px-4 py-16 text-center`}>
      {standalone && <Link href="/" className="h-display text-4xl tracking-[.35em]">KATY</Link>}
      <p className="h-display mt-12 text-7xl text-rose">404</p>
      <h1 className="h-display mt-2 text-4xl">Такой страницы нет</h1>
      <p className="mt-3 max-w-md text-ink-soft">Возможно, товар закончился или ссылка устарела. Попробуйте найти то, что искали:</p>
      <form action="/search" className="mt-6 flex w-full max-w-md gap-2">
        <input name="q" placeholder="Товар, бренд или нота" className="input" />
        <button className="btn-dark px-5">Найти</button>
      </form>
      <div className="mt-6 flex max-w-lg flex-wrap justify-center gap-2">
        {LINKS.map(([t, h]) => <Link key={h} href={h} className="rounded-full border border-line bg-white px-4 py-2 text-sm hover:border-ink">{t}</Link>)}
      </div>
      <Link href="/" className="mt-8 text-sm underline underline-offset-4">На главную</Link>
    </div>
  );
}
