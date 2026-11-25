import Link from "next/link";
import { Notice, PageHead } from "@/components/admin/ui";
import ProductImage from "@/components/ProductImage";
import Pager from "@/components/Pager";
import MirrorPhotos from "@/components/admin/MirrorPhotos";
import { isExternal } from "@/lib/mirror";
import { ExportButton } from "@/components/admin/ExcelImport";

const PER_PAGE = 50;
import { getDb } from "@/lib/db";
import { bestPromotion, topCategories } from "@/lib/catalog";
import { bulkPrice, quickPrice, toggleProductFlag } from "@/lib/admin-actions";

type SP = { q?: string; cat?: string; brand?: string; saved?: string; bulk?: string; page?: string };

export default async function ProductsAdmin({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const db = await getDb();
  const q = sp.q?.toLowerCase().trim();
  const products = db.products.filter((p) => {
    if (sp.cat && p.categoryId !== sp.cat) return false;
    if (sp.brand && p.brandId !== sp.brand) return false;
    if (q) {
      const brand = db.brands.find((b) => b.id === p.brandId)?.name ?? "";
      return `${p.name} ${brand}`.toLowerCase().includes(q);
    }
    return true;
  });
  const pages = Math.max(1, Math.ceil(products.length / PER_PAGE));
  const page = Math.min(pages, Math.max(1, parseInt(sp.page ?? "1") || 1));
  const shown = products.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const cats = topCategories(db);
  const brands = [...db.brands].sort((a, b) => a.name.localeCompare(b.name));

  const flag = (id: string, f: string, on: boolean, label: string) => (
    <form action={toggleProductFlag}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="flag" value={f} />
      <button className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${on ? "bg-ink text-white" : "border border-line text-ink-soft"}`}>{label}</button>
    </form>
  );

  return (
    <div>
      <PageHead title="Товары и цены" desc="Меняйте цены и остатки прямо в таблице и нажимайте «Сохранить». Чтобы изменить фото, описание или ноты — нажмите на название." action={{ href: "/admin/products/new", label: "+ Добавить товар" }} />
      <div className="-mt-4 mb-6 flex flex-wrap items-center gap-3">
        <Link href="/admin/products/import" className="btn-light">Загрузить из Excel</Link>
        <ExportButton />
        <span className="text-xs text-ink-soft">Выгрузили, поправили цены и остатки у себя в таблице, загрузили обратно</span>
      </div>
      {sp.saved && <Notice>Товар сохранён.</Notice>}
      {sp.bulk && <Notice>Цены обновлены.</Notice>}
      {(() => { const failed = new Set(db.mirrorFailed ?? []); const ext = new Set(db.products.flatMap((p) => p.images).filter(isExternal)); return <MirrorPhotos external={[...ext].filter((u) => !failed.has(u)).length} failed={[...ext].filter((u) => failed.has(u)).length} />; })()}

      <div className="mb-6 grid gap-4 xl:grid-cols-2">
        <form className="card flex flex-wrap gap-2 p-4">
          <input name="q" defaultValue={sp.q} placeholder="Поиск по названию или бренду" className="input min-w-48 flex-1 py-2" />
          <select name="cat" defaultValue={sp.cat ?? ""} className="input w-auto py-2">
            <option value="">Все разделы</option>
            {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select name="brand" defaultValue={sp.brand ?? ""} className="input w-auto py-2">
            <option value="">Все бренды</option>
            {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <button className="btn-dark px-5 py-2">Найти</button>
        </form>

        <form action={bulkPrice} className="card flex flex-wrap items-center gap-2 p-4">
          <span className="text-sm font-semibold">Изменить цены на</span>
          <input name="percent" placeholder="+10" className="input w-20 py-2" required />
          <span className="text-sm">%</span>
          <select name="target" className="input w-auto flex-1 py-2">
            <option value="all">во всём каталоге</option>
            <optgroup label="Раздел">
              {db.categories.map((c) => <option key={c.id} value={`cat:${c.id}`}>{c.parentId ? "— " : ""}{c.name}</option>)}
            </optgroup>
            <optgroup label="Бренд">
              {brands.map((b) => <option key={b.id} value={`brand:${b.id}`}>{b.name}</option>)}
            </optgroup>
          </select>
          <input type="hidden" name="round" value="10" />
          <button className="btn-light px-5 py-2">Применить</button>
          <span className="w-full text-xs text-ink-soft">Например, «10» поднимет цены на 10%, «-5» снизит на 5%. Цены округляются до 10 ₽. Для временной скидки лучше создать акцию.</span>
        </form>
      </div>

      <p className="mb-3 text-sm text-ink-soft">Найдено: {products.length}{pages > 1 ? ` · страница ${page} из ${pages}` : ""}</p>
      <div className="space-y-3">
        {shown.map((p) => {
          const brand = db.brands.find((b) => b.id === p.brandId);
          const promo = bestPromotion(db, p);
          return (
            <div key={p.id} className={`card flex flex-col gap-4 p-4 lg:flex-row lg:items-center ${p.isActive ? "" : "opacity-60"}`}>
              <div className="flex min-w-0 items-center gap-4 lg:w-80">
                <div className="h-16 w-14 shrink-0 overflow-hidden rounded-xl"><ProductImage images={p.images} art={p.art} /></div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-ink-soft">{brand?.name}</p>
                  <Link href={`/admin/products/${p.id}`} className="line-clamp-2 font-medium hover:text-rose">{p.name}</Link>
                  {promo && <p className="text-xs text-rose">Акция «{promo.title}» −{promo.discountPercent}%</p>}
                </div>
              </div>
              <form action={quickPrice} className="flex flex-1 flex-wrap items-end gap-2">
                <input type="hidden" name="productId" value={p.id} />
                {p.variants.map((v) => (
                  <div key={v.id} className="rounded-xl bg-sand p-2">
                    <p className="mb-1 text-[11px] font-semibold text-ink-soft">{v.label}</p>
                    <div className="flex gap-1">
                      <input name={`price-${v.id}`} defaultValue={v.price} className="w-20 rounded-lg border border-line bg-white px-2 py-1 text-sm" title="Цена, ₽" />
                      <input name={`stock-${v.id}`} defaultValue={v.stock} className="w-12 rounded-lg border border-line bg-white px-2 py-1 text-sm" title="Остаток, шт" />
                    </div>
                  </div>
                ))}
                <button className="rounded-full bg-ink px-4 py-2 text-xs font-semibold text-white">Сохранить</button>
              </form>
              <div className="flex flex-wrap gap-1.5">
                {flag(p.id, "isActive", p.isActive, p.isActive ? "На сайте" : "Скрыт")}
                {flag(p.id, "isHit", p.isHit, "Хит")}
                {flag(p.id, "isNew", p.isNew, "Новинка")}
              </div>
            </div>
          );
        })}
      </div>
      <Pager page={page} pages={pages} params={{ q: sp.q, cat: sp.cat, brand: sp.brand }} />
      <p className="mt-4 text-xs text-ink-soft">В каждой ячейке: слева цена в рублях, справа — остаток в штуках.</p>
    </div>
  );
}
