import { plural } from "@/lib/format";
import { PageHead } from "@/components/admin/ui";
import { getDb } from "@/lib/db";
import { subcategoriesOf, topCategories } from "@/lib/catalog";
import { deleteCategory, saveCategory } from "@/lib/admin-actions";

export default async function CategoriesAdmin() {
  const db = await getDb();
  const count = (id: string) => db.products.filter((p) => p.categoryId === id || p.subcategoryId === id).length;
  const tops = topCategories(db);
  return (
    <div>
      <PageHead title="Разделы каталога" desc="Разделы видны в меню сайта. Внутри раздела — подразделы. Удалить можно только пустой раздел (без товаров)." />
      <div className="grid gap-6 xl:grid-cols-2">
        {tops.map((c) => (
          <div key={c.id} className="card p-6">
            <form action={saveCategory} className="flex flex-wrap items-end gap-2">
              <input type="hidden" name="id" value={c.id} />
              <input name="name" defaultValue={c.name} className="input h-display flex-1 py-2 text-2xl" />
              <input name="order" defaultValue={c.order} title="Порядок в меню" className="input w-16 py-2" />
              <input type="hidden" name="description" value={c.description} />
              <button className="btn-dark px-4 py-2">Сохранить</button>
            </form>
            <p className="mt-2 text-xs text-ink-soft">{count(c.id)} {plural(count(c.id), "товар", "товара", "товаров")} · адрес /catalog/{c.slug}</p>
            <ul className="mt-4 divide-y divide-line">
              {subcategoriesOf(db, c.id).map((s) => (
                <li key={s.id} className="flex items-center gap-2 py-2">
                  <form action={saveCategory} className="flex flex-1 gap-2">
                    <input type="hidden" name="id" value={s.id} />
                    <input name="name" defaultValue={s.name} className="input flex-1 py-1.5" />
                    <input name="order" defaultValue={s.order} className="input w-14 py-1.5" />
                    <button className="rounded-full border border-line px-3 text-xs">OK</button>
                  </form>
                  <span className="w-10 text-right text-xs text-ink-soft">{count(s.id)}</span>
                  <form action={deleteCategory}>
                    <input type="hidden" name="id" value={s.id} />
                    <button disabled={count(s.id) > 0} className="px-2 text-sm text-rose disabled:opacity-20" title="Удалить">×</button>
                  </form>
                </li>
              ))}
            </ul>
            <form action={saveCategory} className="mt-3 flex gap-2">
              <input type="hidden" name="parentId" value={c.id} />
              <input name="name" required placeholder="Новый подраздел" className="input flex-1 py-2" />
              <button className="btn-light px-4 py-2">+ Добавить</button>
            </form>
          </div>
        ))}
        <form action={saveCategory} className="card space-y-3 border-dashed p-6">
          <p className="h-display text-2xl">Новый раздел</p>
          <input name="name" required placeholder="Например: Мужской уход" className="input" />
          <input name="description" placeholder="Короткое описание" className="input" />
          <div className="flex gap-3 text-xs text-ink-soft">
            <label>Цвет плитки <input type="color" name="artBg" defaultValue="#f2ebe1" className="ml-2 h-8 w-12 align-middle" /></label>
            <label>Цвет флакона <input type="color" name="artColor" defaultValue="#d9c3a5" className="ml-2 h-8 w-12 align-middle" /></label>
          </div>
          <button className="btn-dark">Создать раздел</button>
        </form>
      </div>
    </div>
  );
}
