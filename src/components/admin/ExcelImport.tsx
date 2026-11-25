"use client";
import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { exportCatalog, importCatalog } from "@/lib/admin-actions";
import { pickSheet, type ImportResult, type RowKind } from "@/lib/catalog-import";
import { readCsv, readXlsx, writeXlsx, type Cell } from "@/lib/xlsx";

const TONE: Record<RowKind, string> = { new: "bg-emerald-50 text-emerald-800", variant: "bg-emerald-50 text-emerald-800", upd: "bg-amber-50 text-amber-800", same: "bg-sand text-ink-soft", err: "bg-rose/10 text-rose" };
const n = (x: number) => x.toLocaleString("ru-RU");
const SHOW = 300;

function download(data: Uint8Array, name: string) {
  const blob = new Blob([data as BlobPart], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

/** Кнопка «Скачать весь каталог в Excel» */
export function ExportButton({ className = "btn-light" }: { className?: string }) {
  const [busy, start] = useTransition();
  return (
    <button
      type="button"
      disabled={busy}
      className={className}
      onClick={() =>
        start(async () => {
          const sheets = await exportCatalog();
          const d = new Date();
          download(writeXlsx(sheets), `katalog-katy-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}.xlsx`);
        })
      }
    >
      {busy ? "Готовлю файл…" : "Скачать весь каталог в Excel"}
    </button>
  );
}

export default function ExcelImport() {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<{ name: string; rows: Cell[][] } | null>(null);
  const [preview, setPreview] = useState<ImportResult | null>(null);
  const [done, setDone] = useState<ImportResult | null>(null);
  const [error, setError] = useState("");
  const [onlyPriceStock, setOnly] = useState(true);
  const [filter, setFilter] = useState<"changes" | "err" | "all">("changes");
  const [busy, start] = useTransition();

  const check = (rows: Cell[][], only: boolean) =>
    start(async () => {
      setError("");
      const r = await importCatalog(rows, { apply: false, onlyPriceStock: only });
      if (r.ok) setPreview(r.result);
      else { setPreview(null); setError(r.error); }
    });

  async function choose(f: File | undefined) {
    if (!f) return;
    setDone(null); setPreview(null); setError("");
    try {
      const buf = new Uint8Array(await f.arrayBuffer());
      const sheets = /\.(csv|txt)$/i.test(f.name) ? readCsv(new TextDecoder(guessEncoding(buf)).decode(buf)) : readXlsx(buf);
      const sheet = pickSheet(sheets);
      if (!sheet) throw new Error("В таблице не нашлись столбцы «Артикул» и «Цена» / «Остаток». Сравните заголовки с образцом.");
      setFile({ name: f.name, rows: sheet.rows });
      check(sheet.rows, onlyPriceStock);
    } catch (e) {
      setFile(null);
      setError(e instanceof Error ? e.message : "Не получилось открыть файл");
    }
    if (input.current) input.current.value = "";
  }

  const apply = () =>
    file &&
    start(async () => {
      const r = await importCatalog(file.rows, { apply: true, onlyPriceStock });
      if (r.ok) { setDone(r.result); setPreview(null); setFile(null); router.refresh(); }
      else setError(r.error);
    });

  const p = preview;
  const willChange = p ? p.counts.new + p.counts.variant + p.counts.upd : 0;
  const list = p ? p.rows.filter((r) => (filter === "all" ? true : filter === "err" ? r.kind === "err" : r.kind !== "same")) : [];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {[["1", "Выберите файл", "Таблица по образцу, выгрузка из кассы / 1С (.xlsx или .csv) или скачанный отсюда каталог"], ["2", "Проверьте", "Сайт покажет, что добавится и что изменится. Пока вы не нажали «Загрузить», ничего не меняется"], ["3", "Нажмите «Загрузить»", "Товары и цены сразу появятся на сайте"]].map(([k, t, d]) => (
          <div key={k} className="card p-5"><p className="h-display text-4xl text-rose">{k}</p><p className="mt-1 font-semibold">{t}</p><p className="text-sm text-ink-soft">{d}</p></div>
        ))}
      </div>

      <div
        className="card flex flex-wrap items-center gap-4 border-2 border-dashed border-line p-6"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); choose(e.dataTransfer.files[0]); }}
      >
        <span className="text-3xl">📄</span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{file ? file.name : "Перетащите файл сюда или нажмите «Выбрать файл»"}</p>
          <p className="text-sm text-ink-soft">{file ? `${n(file.rows.length - 1)} строк` : "Excel (.xlsx) или CSV"}</p>
        </div>
        <input ref={input} type="file" accept=".xlsx,.csv,.txt" className="hidden" onChange={(e) => choose(e.target.files?.[0])} />
        <button type="button" className="btn-dark" disabled={busy} onClick={() => input.current?.click()}>{file ? "Выбрать другой файл" : "Выбрать файл"}</button>
        <a href="/primer-tovary-katy.xlsx" download className="text-sm underline">Скачать образец таблицы</a>
      </div>

      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" className="mt-1" checked={onlyPriceStock} onChange={(e) => { setOnly(e.target.checked); if (file) check(file.rows, e.target.checked); }} />
        <span>У товаров, которые уже есть на сайте, менять <b>только цену и остаток</b><br /><span className="text-ink-soft">Описания, фото и разделы, поправленные в админке, останутся как есть. Снимите галочку, если хотите обновить из таблицы всё.</span></span>
      </label>

      {error && <div className="rounded-2xl bg-rose/10 px-5 py-3 text-sm text-rose">{error}</div>}
      {busy && <p className="text-sm text-ink-soft">Проверяю таблицу…</p>}

      {done && (
        <div className="rounded-3xl bg-emerald-50 p-6 text-emerald-900">
          <p className="h-display text-3xl">Готово, каталог обновлён</p>
          <p className="mt-2 text-sm">
            Новых товаров: <b>{n(done.newProducts)}</b> · новых объёмов / оттенков: <b>{n(done.counts.variant)}</b> · обновлено: <b>{n(done.counts.upd)}</b> · пропущено с ошибками: <b>{n(done.counts.err)}</b>
            {done.newBrands.length > 0 && <> · новые бренды: {done.newBrands.join(", ")}</>}
          </p>
          <p className="mt-3 text-sm"><Link href="/admin/products" className="underline">Перейти к товарам</Link></p>
        </div>
      )}

      {p && (
        <>
          {p.missingColumns.length > 0 && (
            <p className="rounded-2xl bg-amber-50 px-5 py-3 text-sm text-amber-900">В таблице нет столбцов: {p.missingColumns.join(", ")}. Это нормально, если вы обновляете только цены и остатки — новые товары без них добавить не получится.</p>
          )}
          <div className="grid gap-3 sm:grid-cols-4">
            {([[p.counts.new + p.counts.variant, "новых товаров и объёмов", "text-emerald-700", "changes"], [p.counts.upd, "обновится цена, остаток или описание", "text-amber-700", "changes"], [p.counts.same, "без изменений", "text-ink-soft", "all"], [p.counts.err, "с ошибками — пропустим", "text-rose", "err"]] as const).map(([v, t, c, f]) => (
              <button type="button" key={t} onClick={() => setFilter(f)} className="card p-5 text-left"><p className={`h-display text-4xl ${c}`}>{n(v)}</p><p className="text-sm text-ink-soft">{t}</p></button>
            ))}
          </div>
          {p.newBrands.length > 0 && <p className="text-sm text-ink-soft">Новые бренды добавятся сами: {p.newBrands.join(", ")}</p>}

          <div className="flex flex-wrap gap-2 text-sm">
            {([["changes", "Что изменится"], ["err", "Ошибки"], ["all", "Все строки"]] as const).map(([k, t]) => (
              <button key={k} type="button" onClick={() => setFilter(k)} className={`rounded-full px-4 py-1.5 ${filter === k ? "bg-ink text-white" : "border border-line"}`}>{t}</button>
            ))}
          </div>
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-ink-soft"><tr><th className="p-4">Строка</th><th className="p-4">Артикул</th><th className="p-4">Товар</th><th className="p-4">Цена</th><th className="p-4">Остаток</th><th className="p-4">Что будет</th></tr></thead>
              <tbody>
                {list.slice(0, SHOW).map((r) => (
                  <tr key={r.line} className="border-t border-line">
                    <td className="p-4 text-ink-soft">{r.line}</td>
                    <td className="p-4 font-mono text-xs">{r.sku || "—"}</td>
                    <td className="p-4">{r.name || "—"}</td>
                    <td className="whitespace-nowrap p-4">{r.price}</td>
                    <td className="whitespace-nowrap p-4">{r.stock}</td>
                    <td className="p-4"><span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${TONE[r.kind]}`}>{r.what}</span></td>
                  </tr>
                ))}
                {!list.length && <tr><td colSpan={6} className="p-6 text-center text-ink-soft">Здесь пусто</td></tr>}
              </tbody>
            </table>
            {list.length > SHOW && <p className="border-t border-line p-4 text-sm text-ink-soft">Показаны первые {SHOW} из {n(list.length)} строк.</p>}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button type="button" className="btn-dark px-8" disabled={busy || !willChange} onClick={apply}>
              {willChange ? `Загрузить: ${n(willChange)} ${plural(willChange)}` : "Нечего загружать"}
            </button>
            {p.counts.err > 0 && <span className="text-sm text-ink-soft">Строки с ошибками пропустим — их можно поправить в таблице и загрузить файл ещё раз.</span>}
          </div>
        </>
      )}
    </div>
  );
}

function plural(x: number) {
  const a = x % 10, b = x % 100;
  if (a === 1 && b !== 11) return "изменение";
  if (a >= 2 && a <= 4 && (b < 12 || b > 14)) return "изменения";
  return "изменений";
}

/** CSV из кассы часто в кодировке Windows-1251 */
function guessEncoding(buf: Uint8Array) {
  try { new TextDecoder("utf-8", { fatal: true }).decode(buf); return "utf-8"; } catch { return "windows-1251"; }
}
