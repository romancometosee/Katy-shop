import Link from "next/link";
import NewsSubscribe from "./NewsSubscribe";
import type { Category, Settings } from "@/lib/types";

export default function Footer({ settings, categories }: { settings: Settings; categories: Category[] }) {
  return (
    <footer className="mt-24 bg-ink text-white/80">
      <div className="container-x grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <p className="h-display text-4xl tracking-[.25em] text-white">{settings.shopName.toUpperCase()}</p>
          <p className="mt-3 max-w-sm text-sm">{settings.tagline}. Гарантия подлинности, подарок в каждом заказе и бесплатная консультация по подбору аромата.</p>
          <NewsSubscribe />
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
            <li><Link href="/account" className="hover:text-white">Личный кабинет и мои заказы</Link></li>
            <li><Link href="/delivery" className="hover:text-white">Доставка и оплата</Link></li>
            <li><Link href="/stores" className="hover:text-white">Магазины Katy</Link></li>
            <li><Link href="/podbor" className="hover:text-white">Подбор аромата</Link></li>
            <li><Link href="/journal" className="hover:text-white">Журнал Katy</Link></li>
            <li><Link href="/club" className="hover:text-white">Клуб Katy: накопительная скидка</Link></li>
            <li><Link href="/pro" className="hover:text-white">Katy PRO — для мастеров и салонов</Link></li>
            <li><Link href="/gift" className="hover:text-white">Подарочные сертификаты</Link></li>
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
          <span className="flex flex-wrap gap-x-4 gap-y-1">
            <Link href="/legal/oferta" className="hover:text-white">Оферта</Link>
            <Link href="/legal/vozvrat" className="hover:text-white">Возврат и обмен</Link>
            <Link href="/legal/privacy" className="hover:text-white">Политика конфиденциальности</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
