/* eslint-disable @next/next/no-img-element */
import { getDb } from "@/lib/db";
import { searchProducts, type ProductView } from "@/lib/catalog";
import { rub } from "@/lib/format";
import ProductImage from "@/components/ProductImage";

// МАКЕТ раздела «Katy PRO» для мастеров и салонов — на сайте нигде не показывается, поисковикам закрыт.
// Цены для мастеров здесь примерные (−25%), только для наглядности.
export const metadata = { title: "Макет: Katy PRO для мастеров и салонов", robots: { index: false, follow: false } };

const PRO = 0.75;
const pro = (n: number) => Math.round((n * PRO) / 10) * 10;

function Card({ p, mode }: { p: ProductView; mode: "retail" | "pro" }) {
  return (
    <div className="overflow-hidden rounded-3xl bg-white">
      <div className="relative aspect-[4/5]">
        <ProductImage images={p.images} art={p.art} label={p.brandName} />
        {mode === "pro" && <span className="absolute left-3 top-3 rounded-full bg-ink px-2.5 py-1 text-[11px] font-bold tracking-wider text-[#e8c98f]">PRO</span>}
      </div>
      <div className="p-4">
        <p className="text-[11px] font-bold uppercase tracking-wider text-ink-soft">{p.brandName}</p>
        <p className="mt-0.5 line-clamp-2 text-sm">{p.name}</p>
        {mode === "retail" ? (
          <>
            <p className="mt-2 text-lg font-semibold">{rub(p.price)}</p>
            <p className="mt-1 text-[11px] text-ink-soft">Мастерам — цена ниже · <u>Katy PRO</u></p>
          </>
        ) : (
          <>
            <p className="mt-2 flex items-baseline gap-2"><span className="text-lg font-semibold">{rub(pro(p.price))}</span><span className="text-xs text-ink-soft line-through">{rub(p.price)}</span></p>
            <p className="mt-1 text-[11px] font-semibold text-emerald-700">Ваша цена мастера</p>
            <div className="mt-3 flex items-center gap-2">
              <span className="flex items-center rounded-full border border-line text-sm"><span className="px-2.5">−</span>6<span className="px-2.5">+</span></span>
              <span className="flex-1 rounded-full bg-ink py-2 text-center text-xs font-semibold text-white">В закупку</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const Label = ({ n, children }: { n: number; children: React.ReactNode }) => (
  <div className="mb-5 mt-16 flex items-center gap-3">
    <span className="grid h-9 w-9 place-items-center rounded-full bg-rose text-sm font-bold text-white">{n}</span>
    <p className="h-display text-3xl sm:text-4xl">{children}</p>
  </div>
);

export default async function ProDemo() {
  const db = await getDb();
  const all = searchProducts(db, {});
  const pick = (brand: string, n: number) => all.filter((p) => p.brandName.toLowerCase().includes(brand)).slice(0, n);
  const items = [...pick("opi", 2), ...pick("cnd", 1), ...pick("olaplex", 1)];

  return (
    <div className="container-x pb-20 pt-8">
      <div className="rounded-3xl border border-dashed border-rose bg-rose/5 p-5 text-sm">
        <b>Это макет, на сайте его пока нет.</b> Показываю, как раздел для мастеров и салонов будет выглядеть для обычного покупателя и для мастера. Цены для мастеров тут условные (−25%).
      </div>

      <Label n={1}>Обычный покупатель: почти ничего не меняется</Label>
      <p className="max-w-2xl text-ink-soft">Цены те же, что сейчас. В меню появляется тихая ссылка «Katy PRO», а под ценой профессиональных товаров (гель-лаки, базы, уход для волос) маленькая строчка «Мастерам — цена ниже». Никаких навязчивых окон.</p>
      <div className="mt-4 flex flex-wrap items-center gap-6 rounded-2xl bg-white px-5 py-3 text-xs font-semibold uppercase tracking-wider">
        <span>Ногти</span><span>Подарочные наборы</span><span>Бренды</span><span className="text-rose">Акции</span><span className="rounded-full bg-ink px-3 py-1 text-[#e8c98f]">Katy PRO</span>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">{items.map((p) => <Card key={p.id} p={p} mode="retail" />)}</div>

      <Label n={2}>Страница Katy PRO: приглашение для мастеров</Label>
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#1c1917] to-[#3a2e2a] p-8 text-[#e8c98f] sm:p-10">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#e8c98f]/15 blur-3xl" />
          <p className="text-xs font-semibold uppercase tracking-[.28em] opacity-70">Для мастеров и салонов</p>
          <p className="h-display mt-3 text-5xl">Katy PRO</p>
          <p className="mt-3 max-w-md text-white/80">Профессиональные цены на гель-лаки, базы, топы и уход для волос. Для мастеров маникюра, парикмахеров и салонов.</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {[["до −30%", "цены мастера на профессиональные товары"], ["от 3 000 ₽", "минимальная закупка"], ["Счёт и документы", "для ИП и салонов"], ["Первыми", "новинки, коллекции и обучение"]].map(([a, b]) => (
              <div key={a} className="rounded-2xl bg-white/5 p-4"><p className="h-display text-2xl">{a}</p><p className="text-xs text-white/70">{b}</p></div>
            ))}
          </div>
        </div>
        <div className="rounded-[2rem] bg-white p-6 sm:p-8">
          <p className="h-display text-3xl">Стать партнёром</p>
          <p className="mt-1 text-sm text-ink-soft">Заявку проверяет менеджер, обычно в течение дня.</p>
          <div className="mt-4 space-y-3 text-sm text-ink-soft">
            {["Имя", "Телефон", "Город", "Кто вы: мастер маникюра / парикмахер / салон", "Название салона или ссылка на ваш Instagram/ВК", "Фото диплома или сертификата (по желанию)"].map((x) => <div key={x} className="input">{x}</div>)}
            <div className="btn-dark w-full">Отправить заявку</div>
          </div>
        </div>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[["1", "Мастер оставляет заявку", "Обычная форма, как выше"], ["2", "Вы одобряете в админке", "Одна кнопка «Одобрить» и выбор скидки: −15%, −20%, −30%"], ["3", "Мастер видит свои цены", "Входит по телефону, как в личный кабинет, и покупает по ценам PRO"]].map(([n, t, d]) => (
          <div key={n} className="rounded-3xl bg-sand p-5"><p className="h-display text-4xl text-rose">{n}</p><p className="mt-1 font-semibold">{t}</p><p className="text-sm text-ink-soft">{d}</p></div>
        ))}
      </div>

      <Label n={3}>Мастер вошёл: свои цены и быстрая закупка</Label>
      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <div className="space-y-4">
          <div className="rounded-[1.75rem] bg-gradient-to-br from-[#1c1917] to-[#3a2e2a] p-6 text-[#e8c98f]">
            <p className="text-[10px] uppercase tracking-[.35em] opacity-70">Katy PRO · мастер</p>
            <p className="h-display mt-2 text-2xl">Студия «Ноготок»</p>
            <p className="h-display mt-6 text-5xl">−25%</p>
            <p className="text-sm opacity-80">ваша цена мастера</p>
            <p className="mt-4 text-xs opacity-70">Закупки в этом месяце: 18 400 ₽</p>
          </div>
          <div className="rounded-3xl bg-white p-5 text-sm">
            <p className="font-semibold">Быстрая закупка</p>
            <p className="text-xs text-ink-soft">Вставьте список: артикул и количество</p>
            <div className="mt-2 rounded-xl border border-line p-3 font-mono text-xs leading-6 text-ink-soft">GCS86 × 6<br />GCN25 × 6<br />CND-BASE × 4</div>
            <div className="btn-dark mt-3 w-full py-2.5 text-xs">Добавить всё в закупку</div>
          </div>
          <div className="rounded-3xl bg-white p-5 text-sm">
            <p className="font-semibold">Мои закупки</p>
            <p className="mt-2 flex justify-between text-ink-soft"><span>№1042 · 12 ноября</span><span>↻ повторить</span></p>
            <p className="flex justify-between text-ink-soft"><span>№1017 · 28 октября</span><span>↻ повторить</span></p>
            <p className="mt-2 text-xs underline">Скачать счёт для ИП</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4">{items.map((p) => <Card key={p.id} p={p} mode="pro" />)}</div>
      </div>

      <Label n={4}>Ваша сторона: админка</Label>
      <div className="overflow-x-auto rounded-3xl bg-white">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="text-left text-xs uppercase tracking-wider text-ink-soft"><tr><th className="p-4">Заявка</th><th className="p-4">Кто</th><th className="p-4">Город</th><th className="p-4">Скидка</th><th className="p-4" /></tr></thead>
          <tbody>
            <tr className="border-t border-line"><td className="p-4 font-medium">Анна Смирнова<span className="block text-xs text-ink-soft">+7 912 ••• •• 22</span></td><td className="p-4">Мастер маникюра, диплом ✓</td><td className="p-4">Екатеринбург</td><td className="p-4"><span className="rounded-full border border-line px-3 py-1">−25%</span></td><td className="p-4 text-right"><span className="rounded-full bg-ink px-4 py-2 text-xs font-semibold text-white">Одобрить</span> <span className="ml-2 text-xs text-ink-soft underline">Отклонить</span></td></tr>
            <tr className="border-t border-line"><td className="p-4 font-medium">Салон «Лаванда»<span className="block text-xs text-ink-soft">+7 922 ••• •• 08</span></td><td className="p-4">Салон, ИП</td><td className="p-4">Пермь</td><td className="p-4"><span className="rounded-full border border-line px-3 py-1">−30%</span></td><td className="p-4 text-right"><span className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white">Одобрено</span></td></tr>
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-sm text-ink-soft">Ещё можно: свои цены PRO для каждого товара (не только общий процент), минимальная сумма закупки, отдельные акции только для мастеров.</p>
    </div>
  );
}
