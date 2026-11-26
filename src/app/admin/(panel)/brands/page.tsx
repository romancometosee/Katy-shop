import { plural } from "@/lib/format";
import { PageHead } from "@/components/admin/ui";
import { getDb } from "@/lib/db";
import { deleteBrand, saveBrand } from "@/lib/admin-actions";

export default async function BrandsAdmin() {
  const db = await getDb();
  const brands = [...db.brands].sort((a, b) => a.name.localeCompare(b.name));
  const count = (id: string) => db.products.filter((p) => p.brandId === id).length;
  return (
    <div>
      <PageHead title="Бренды" desc="«Популярный» — бренд показывается на главной и в начале списка брендов." />
      <form action={saveBrand} className="card mb-6 grid gap-3 p-5 sm:grid-cols-[1fr_1fr_2fr_auto_auto] sm:items-center">
        <input name="name" required placeholder="Название бренда" className="input py-2" />
        <input name="country" placeholder="Страна" className="input py-2" />
        <input name="description" placeholder="Описание" className="input py-2" />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isPopular" /> Популярный</label>
        <button className="btn-dark px-5 py-2">+ Добавить</button>
      </form>
      <div className="card divide-y divide-line">
        {brands.map((b) => (
          <div key={b.id} className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center">
            <form action={saveBrand} className="grid flex-1 gap-2 sm:grid-cols-[1fr_1fr_2fr_auto_auto] sm:items-center">
              <input type="hidden" name="id" value={b.id} />
              <input name="name" defaultValue={b.name} className="input py-1.5 font-semibold" />
              <input name="country" defaultValue={b.country} className="input py-1.5" />
              <input name="description" defaultValue={b.description} className="input py-1.5" />
              <label className="flex items-center gap-2 text-xs"><input type="checkbox" name="isPopular" defaultChecked={b.isPopular} /> Популярный</label>
              <button className="rounded-full border border-line px-4 py-1.5 text-xs font-semibold">Сохранить</button>
            </form>
            <span className="w-20 text-xs text-ink-soft">{count(b.id)} {plural(count(b.id), "товар", "товара", "товаров")}</span>
            <form action={deleteBrand}>
              <input type="hidden" name="id" value={b.id} />
              <button disabled={count(b.id) > 0} className="text-xs text-rose disabled:opacity-20">Удалить</button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
