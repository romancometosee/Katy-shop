// МАКЕТ экрана «Загрузка товаров из Excel» для Романа — на сайте нигде не показывается, поисковикам закрыт.
// Цифры примерные.
export const metadata = { title: "Макет: загрузка товаров из Excel", robots: { index: false, follow: false } };

const rows: [string, string, string, string, string, string][] = [
  ["new", "CH-COCO-35", "Chanel Coco Mademoiselle · 35 мл", "9 900 ₽", "4", "Новый товар"],
  ["new", "CH-COCO-50", "Chanel Coco Mademoiselle · 50 мл", "13 900 ₽", "6", "Новый объём"],
  ["upd", "OPI-GCN25", "OPI Гель-лак GelColor · Big Apple Red", "1 390 → 1 490 ₽", "12 → 24", "Цена и остаток"],
  ["upd", "OLA-N3-100", "Olaplex No.3 Hair Perfector · 100 мл", "3 200 ₽", "3 → 9", "Остаток"],
  ["same", "KER-ELX-250", "Kérastase Elixir Ultime Le Bain · 250 мл", "3 450 ₽", "7", "Без изменений"],
  ["err", "LRP-HYALU-30", "La Roche-Posay Hyalu B5 Serum", "—", "5", "Нет цены"],
  ["err", "", "Dior Sauvage · 100 мл", "12 900 ₽", "2", "Нет артикула"],
];
const tone: Record<string, string> = { new: "bg-emerald-50 text-emerald-800", upd: "bg-amber-50 text-amber-800", same: "bg-sand text-ink-soft", err: "bg-rose/10 text-rose" };

export default function ImportDemo() {
  return (
    <div className="container-x pb-20 pt-8">
      <div className="rounded-3xl border border-dashed border-rose bg-rose/5 p-5 text-sm"><b>Это макет, загрузки пока нет.</b> Так будет выглядеть экран в админке «Товары и цены → Загрузить из Excel».</div>

      <h1 className="h-display mt-8 text-5xl">Загрузка товаров из Excel</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {[["1", "Выберите файл", "Таблица по образцу или выгрузка из кассы / 1С"], ["2", "Проверьте", "Сайт покажет, что добавится и что изменится. Пока ничего не применяется"], ["3", "Нажмите «Загрузить»", "Товары появятся на сайте за минуту"]].map(([n, t, d]) => (
          <div key={n} className="rounded-3xl bg-white p-5"><p className="h-display text-4xl text-rose">{n}</p><p className="mt-1 font-semibold">{t}</p><p className="text-sm text-ink-soft">{d}</p></div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4 rounded-3xl border-2 border-dashed border-line bg-white p-6">
        <span className="text-3xl">📄</span>
        <div className="flex-1"><p className="font-semibold">tovary-katy-noyabr.xlsx</p><p className="text-sm text-ink-soft">3 012 строк · фото: папка «foto» (2 640 файлов)</p></div>
        <span className="btn-light">Выбрать другой файл</span>
        <span className="text-sm underline">Скачать образец таблицы</span>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        {[["2 870", "новых товаров", "text-emerald-700"], ["118", "обновится цена или остаток", "text-amber-700"], ["12", "без изменений", "text-ink-soft"], ["12", "с ошибками — пропустим", "text-rose"]].map(([n, t, c]) => (
          <div key={t} className="rounded-3xl bg-white p-5"><p className={`h-display text-4xl ${c}`}>{n}</p><p className="text-sm text-ink-soft">{t}</p></div>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto rounded-3xl bg-white">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="text-left text-xs uppercase tracking-wider text-ink-soft"><tr><th className="p-4">Артикул</th><th className="p-4">Товар</th><th className="p-4">Цена</th><th className="p-4">Остаток</th><th className="p-4">Что будет</th></tr></thead>
          <tbody>
            {rows.map(([k, a, n, p, s, w], i) => (
              <tr key={i} className="border-t border-line">
                <td className="p-4 font-mono text-xs">{a || "—"}</td><td className="p-4">{n}</td><td className="p-4">{p}</td><td className="p-4">{s}</td>
                <td className="p-4"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone[k]}`}>{w}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <span className="btn-dark px-8">Загрузить 2 988 товаров</span>
        <span className="text-sm text-ink-soft">Товары с ошибками пропустим и покажем списком — их можно поправить в таблице и загрузить ещё раз.</span>
      </div>
      <label className="mt-4 flex items-center gap-2 text-sm text-ink-soft"><input type="checkbox" defaultChecked /> Обновлять только цену и остаток у товаров, которые уже есть (описания и фото, поправленные в админке, не трогать)</label>
      <p className="mt-8 text-sm text-ink-soft">Рядом будет кнопка <b className="text-ink">«Скачать весь каталог в Excel»</b>: выгрузили, поправили цены у себя в таблице, загрузили обратно.</p>
    </div>
  );
}
