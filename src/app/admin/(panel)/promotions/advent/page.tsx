import Link from "next/link";
import { PageHead } from "@/components/admin/ui";
import { getDb } from "@/lib/db";
import { saveAdvent } from "@/lib/admin-actions";
import { ADVENT_COLOR, adventDays, adventYear } from "@/lib/advent";

export default async function AdventAdmin() {
  const db = await getDb();
  const year = adventYear();
  const days = adventDays(db, year);
  const brand = (id: string) => db.brands.find((b) => b.id === id)?.name ?? "";
  const filled = days.filter((d) => d.product).length;
  return (
    <div>
      <Link href="/admin/promotions" className="text-sm text-ink-soft hover:underline">← Все акции</Link>
      <PageHead
        title={`Адвент-календарь ${year}`}
        desc="24 окошка с 1 по 24 декабря. Каждый день открывается одно окошко: за ним товар со скидкой ровно на этот день. Покупатели заходят каждый день, чтобы посмотреть, что сегодня. Заполнено окошек: "
      />
      <p className="-mt-6 mb-6 text-sm"><b>{filled} из 24.</b> <Link href="/advent" className="text-rose underline">Посмотреть, как видит покупатель</Link> (до декабря можно открыть любой день: добавьте к адресу <code>?day=5</code>).</p>

      <form action={saveAdvent} className="mb-6">
        <input type="hidden" name="year" value={year} />
        <input type="hidden" name="auto" value="1" />
        <button className="btn-light" style={{ borderColor: ADVENT_COLOR }}>✦ Заполнить автоматически хитами из разных разделов</button>
        <span className="ml-3 text-xs text-ink-soft">Заменит все окошки. Потом любое можно поменять вручную.</span>
      </form>

      <form action={saveAdvent} className="card p-4 sm:p-6">
        <input type="hidden" name="year" value={year} />
        <datalist id="advent-products">
          {db.products.filter((p) => p.isActive).map((p) => <option key={p.id} value={p.slug}>{`${brand(p.brandId)} ${p.name}`}</option>)}
        </datalist>
        <div className="grid gap-x-6 gap-y-2 lg:grid-cols-2">
          {days.map(({ day, promo, product }) => (
            <div key={day} className="flex min-w-0 items-center gap-2 border-b border-line py-2 text-sm">
              <span className="h-display w-16 shrink-0 text-xl" style={{ color: ADVENT_COLOR }}>{day} дек</span>
              <div className="min-w-0 flex-1">
                <input name={`slug${day}`} list="advent-products" defaultValue={product?.slug ?? ""} placeholder="Начните вводить товар" className="input w-full min-w-0 py-1.5" />
                {product && <p className="mt-0.5 truncate text-xs text-ink-soft">{brand(product.brandId)} {product.name}</p>}
              </div>
              <label className="flex shrink-0 items-center gap-1 text-xs text-ink-soft">−<input name={`percent${day}`} defaultValue={promo?.discountPercent ?? 20} className="input w-14 py-1.5" />%</label>
            </div>
          ))}
        </div>
        <button className="btn-dark mt-6">Сохранить календарь</button>
      </form>
    </div>
  );
}
