import Link from "next/link";
import type { Category, Settings } from "@/lib/types";

export default function Footer({ settings, categories }: { settings: Settings; categories: Category[] }) {
  return (
    <footer className="mt-24 bg-ink text-white/80">
      <div className="container-x grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <p className="h-display text-4xl tracking-[.25em] text-white">{settings.shopName.toUpperCase()}</p>
          <p className="mt-3 max-w-sm text-sm">{settings.tagline}. Гарантия подлинности, подарок в каждом заказе и бесплатная консультация по подбору аромата.</p>
          <form className="mt-6 flex max-w-sm gap-2">
            <input placeholder="Ваш e-mail для скидок" className="flex-1 rounded-full border border-white/20 bg-transparent px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/40 focus:border-white/50" />
            <button type="button" className="rounded-full bg-white px-5 text-sm font-semibold text-ink">OK</button>
          </form>
        </div>
        <div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[.2em] text-white">Каталог</p>
          <ul className="space-y-2 text-sm">
            {categories.map((c) => (
              <li key={c.id}><Link href={`/catalog/${c.slug}`} className="hover:text-white">{c.name}</Link></li>
            ))}
            <li><Link href="/brands" className="hover:text-white">Бренды А–Я</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[.2em] text-white">Покупателям</p>
          <ul className="space-y-2 text-sm">
            <li><Link href="/delivery" className="hover:text-white">Доставка и оплата</Link></li>
            <li><Link href="/podbor" className="hover:text-white">Подбор аромата</Link></li>
            <li><Link href="/journal" className="hover:text-white">Журнал Katy</Link></li>
            <li><Link href="/sale" className="hover:text-white">Акции</Link></li>
            <li><Link href="/about" className="hover:text-white">О магазине и гарантия оригинальности</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[.2em] text-white">Контакты</p>
          <ul className="space-y-2 text-sm">
            <li>{settings.phone}</li>
            <li>{settings.email}</li>
            <li>Instagram: @{settings.instagram}</li>
            <li>Telegram: @{settings.telegram}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-x flex flex-col justify-between gap-2 py-6 text-xs text-white/50 sm:flex-row">
          <span>© {new Date().getFullYear()} {settings.shopName}. Только оригинальная продукция.</span>
          <span>Изображения товаров — иллюстрации до загрузки фотографий</span>
        </div>
      </div>
    </footer>
  );
}
