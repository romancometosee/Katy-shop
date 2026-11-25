// Загрузка каталога из Excel и выгрузка в Excel.
// Одна строка таблицы = один объём / оттенок (вариант). Строки с одинаковым Брендом и Названием — одна карточка.
// Товар узнаём по артикулу: при повторной загрузке обновляются цена и остаток.
import { slugify } from "./slug";
import type { Brand, Database, Gender, Product, Variant } from "./types";
import type { Cell, Sheet } from "./xlsx";

export const HEADERS = [
  "Артикул *", "Штрихкод", "Бренд *", "Название *", "Раздел *", "Подраздел", "Объём / оттенок *", "Цена, ₽ *", "Старая цена, ₽",
  "Остаток, шт *", "Для кого", "Семейство аромата", "Ноты: верхние / сердце / база", "Краткое описание", "Полное описание",
  "Фото", "Хит", "Новинка", "На сайте",
] as const;
const WIDTHS = [16, 16, 18, 36, 16, 20, 18, 11, 13, 11, 12, 16, 40, 40, 50, 40, 6, 9, 9];

type Key = "sku" | "barcode" | "brand" | "name" | "cat" | "sub" | "label" | "price" | "old" | "stock" | "gender" | "family" | "notes" | "short" | "desc" | "photo" | "hit" | "isNew" | "active";

/** Узнаём столбец по началу заголовка — подойдёт и наш образец, и выгрузка из кассы с похожими названиями */
const MATCH: [Key, RegExp][] = [
  ["sku", /^(артикул|код|sku)/],
  ["barcode", /^(штрих|ean|barcode)/],
  ["brand", /^(бренд|марка|производитель)/],
  ["sub", /^подраздел/],
  ["cat", /^(раздел|категория|группа)/],
  ["label", /^(объ[её]м|оттенок|вариант|размер)/],
  ["old", /^(старая|цена до|зачеркн)/],
  ["price", /^(цена|розн|стоимость)/],
  ["stock", /^(остат|кол-?во|количество|наличие)/],
  ["gender", /^для кого/],
  ["family", /^семейство/],
  ["notes", /^ноты/],
  ["short", /^(краткое|короткое)/],
  ["desc", /^(полное|описание)/],
  ["photo", /^(фото|изображение|картинка)/],
  ["hit", /^хит/],
  ["isNew", /^новинка/],
  ["active", /^(на сайте|показывать|активен)/],
  ["name", /^(название|наименование|товар)/],
];

export type RowKind = "new" | "variant" | "upd" | "same" | "err";
export type ImportRow = { line: number; sku: string; name: string; price: string; stock: string; kind: RowKind; what: string };
export type ImportResult = {
  rows: ImportRow[];
  counts: Record<RowKind, number>;
  newProducts: number;
  newBrands: string[];
  missingColumns: string[];
};

const norm = (s: string) => s.toLowerCase().replace(/ё/g, "е").replace(/\s+/g, " ").trim();
const text = (c: Cell) => (c == null ? "" : String(c).trim());
function money(c: Cell): number | null {
  if (typeof c === "number") return isFinite(c) ? c : null;
  const s = text(c).replace(/[\s ₽руб.]/gi, "").replace(",", ".");
  if (!s) return null;
  const n = Number(s);
  return isFinite(n) ? n : NaN;
}
const yes = (c: Cell) => /^(да|1|yes|true|\+|x|х|v|✓)$/i.test(text(c));
const no = (c: Cell) => /^(нет|0|no|false|-)$/i.test(text(c));
const rub = (n: number) => `${Math.round(n).toLocaleString("ru-RU")} ₽`;

function genderOf(s: string): Gender | undefined {
  const t = norm(s);
  if (!t) return undefined;
  if (t.startsWith("жен")) return "women";
  if (t.startsWith("муж")) return "men";
  if (t.startsWith("уни")) return "unisex";
  return undefined;
}
const GENDER_RU: Record<Gender, string> = { women: "Женский", men: "Мужской", unisex: "Унисекс" };

function parseNotes(s: string): Product["notes"] | undefined {
  if (!s.trim()) return undefined;
  const [top = "", heart = "", base = ""] = s.split("/");
  const l = (x: string) => x.split(",").map((y) => y.trim()).filter(Boolean);
  return { top: l(top), heart: l(heart), base: l(base) };
}
const photoOk = (s: string) => /^https?:\/\//i.test(s) || s.startsWith("/");

/** Находит строку заголовков (в первых 10 строках) и номера столбцов */
function findColumns(rows: Cell[][]) {
  for (let r = 0; r < Math.min(rows.length, 10); r++) {
    const map: Partial<Record<Key, number>> = {};
    (rows[r] ?? []).forEach((c, i) => {
      const h = norm(text(c)).replace(/[*:]/g, "").trim();
      if (!h) return;
      const hit = MATCH.find(([k, re]) => map[k] === undefined && re.test(h));
      if (hit) map[hit[0]] = i;
    });
    if (map.sku !== undefined && (map.price !== undefined || map.stock !== undefined)) return { header: r, map };
  }
  return null;
}

/** Выбираем лист с товарами: «Товары», иначе первый, где нашлись столбцы */
export function pickSheet(sheets: Sheet[]): Sheet | undefined {
  return sheets.find((s) => /товар/i.test(s.name) && findColumns(s.rows)) ?? sheets.find((s) => findColumns(s.rows));
}

/**
 * Применяет таблицу к данным магазина (меняет db). Для предпросмотра вызывайте на копии.
 * onlyPriceStock — у товаров, которые уже есть, меняем только цену, старую цену и остаток.
 */
export function runImport(db: Database, rows: Cell[][], onlyPriceStock: boolean): ImportResult {
  const res: ImportResult = { rows: [], counts: { new: 0, variant: 0, upd: 0, same: 0, err: 0 }, newProducts: 0, newBrands: [], missingColumns: [] };
  const found = findColumns(rows);
  if (!found) throw new Error("В таблице не нашлись столбцы «Артикул» и «Цена» / «Остаток». Проверьте первую строку с заголовками или скачайте образец.");
  const { header, map } = found;
  const LABEL: Partial<Record<Key, string>> = { brand: "Бренд", name: "Название", cat: "Раздел", label: "Объём / оттенок", price: "Цена", stock: "Остаток" };
  res.missingColumns = (Object.keys(LABEL) as Key[]).filter((k) => map[k] === undefined).map((k) => LABEL[k]!);
  const has = (k: Key) => map[k] !== undefined;

  // что уже есть на сайте
  const bySku = new Map<string, { p: Product; v: Variant }>();
  const byName = new Map<string, Product>();
  const brandName = new Map(db.brands.map((b) => [b.id, b.name]));
  for (const p of db.products) {
    byName.set(`${norm(brandName.get(p.brandId) ?? "")}|${norm(p.name)}`, p);
    for (const v of p.variants) {
      bySku.set(norm(v.id), { p, v });
      if (v.sku) bySku.set(norm(v.sku), { p, v });
    }
  }
  const brands = new Map(db.brands.map((b) => [norm(b.name), b]));
  const tops = db.categories.filter((c) => !c.parentId);
  const findCat = (s: string) => tops.find((c) => norm(c.name) === norm(s) || c.slug === norm(s) || c.id === s);
  const findSub = (catId: string, s: string) => db.categories.find((c) => c.parentId === catId && (norm(c.name) === norm(s) || c.slug === norm(s) || c.id === s));
  const slugs = new Set(db.products.map((p) => p.slug));
  const brandSlugs = new Set(db.brands.map((b) => b.slug));
  const unique = (base: string, taken: Set<string>) => {
    let s = base || "item";
    for (let i = 2; taken.has(s); i++) s = `${base}-${i}`;
    taken.add(s);
    return s;
  };
  const seenSku = new Set<string>();
  const now = new Date().toISOString();

  for (let r = header + 1; r < rows.length; r++) {
    const row = rows[r] ?? [];
    const get = (k: Key) => (map[k] === undefined ? undefined : row[map[k]!]);
    const t = (k: Key) => text(get(k));
    if (!row.some((c) => text(c))) continue; // пустая строка
    const sku = t("sku");
    const price = money(get("price") ?? null);
    const stockRaw = money(get("stock") ?? null);
    const old = money(get("old") ?? null);
    // строка-подсказка под заголовками в образце: нет ни бренда, ни цены, ни остатка
    if (!t("brand") && price === null && stockRaw === null) continue;

    const out: ImportRow = { line: r + 1, sku, name: [t("brand"), t("name"), t("label")].filter(Boolean).join(" · "), price: price != null && !isNaN(price) ? rub(price) : "—", stock: stockRaw != null && !isNaN(stockRaw) ? String(Math.round(stockRaw)) : "—", kind: "err", what: "" };
    const fail = (why: string) => { out.kind = "err"; out.what = why; res.rows.push(out); res.counts.err++; };

    if (!sku) { fail("Нет артикула"); continue; }
    if (seenSku.has(norm(sku))) { fail("Этот артикул уже был выше в таблице"); continue; }
    seenSku.add(norm(sku));
    if (price !== null && (isNaN(price) || price <= 0)) { fail("Цена не число"); continue; }
    if (stockRaw !== null && (isNaN(stockRaw) || stockRaw < 0)) { fail("Остаток не число"); continue; }
    if (old !== null && isNaN(old)) { fail("Старая цена не число"); continue; }
    const stock = stockRaw === null ? null : Math.round(stockRaw);

    let hit = bySku.get(norm(sku));
    let linked = false;
    if (!hit && t("label")) {
      // товар с таким брендом и названием уже заведён вручную, без артикула: узнаём объём по названию и привязываем артикул
      const p = byName.get(`${norm(t("brand"))}|${norm(t("name"))}`);
      const v = p?.variants.find((x) => !x.sku && norm(x.label) === norm(t("label")));
      if (p && v) { v.sku = sku; hit = { p, v }; bySku.set(norm(sku), hit); linked = true; }
    }
    if (hit) {
      // ---- товар уже есть: обновляем ----
      const { p, v } = hit;
      if (!out.name) out.name = [brandName.get(p.brandId), p.name, v.label].filter(Boolean).join(" · ");
      const changes: string[] = linked ? ["артикул привязан"] : [];
      if (price !== null && Math.round(price) !== v.price) { out.price = `${rub(v.price)} → ${rub(price)}`; v.price = Math.round(price); changes.push("цена"); }
      if (has("old")) {
        const nextOld = old && old > (price ?? v.price) ? Math.round(old) : undefined;
        if (nextOld !== v.oldPrice) { v.oldPrice = nextOld; changes.push("старая цена"); }
      }
      if (stock !== null && stock !== v.stock) { out.stock = `${v.stock} → ${stock}`; v.stock = stock; changes.push("остаток"); }
      if (t("barcode") && t("barcode") !== v.barcode) v.barcode = t("barcode");
      if (!v.sku && norm(sku) !== norm(v.id)) v.sku = sku;
      if (!onlyPriceStock) {
        const set = <K extends keyof Product>(k: K, val: Product[K] | undefined, label: string) => {
          if (val === undefined || val === "" || JSON.stringify(val) === JSON.stringify(p[k])) return;
          p[k] = val as Product[K];
          changes.push(label);
        };
        set("name", t("name") || undefined, "название");
        const cat = t("cat") ? findCat(t("cat")) : undefined;
        if (cat) { set("categoryId", cat.id, "раздел"); const sub = t("sub") ? findSub(cat.id, t("sub")) : undefined; if (sub) set("subcategoryId", sub.id, "подраздел"); }
        set("shortDescription", t("short") || undefined, "описание");
        set("description", t("desc") || undefined, "описание");
        set("gender", genderOf(t("gender")), "для кого");
        set("family", t("family") || undefined, "семейство");
        set("notes", parseNotes(t("notes")), "ноты");
        if (has("hit")) set("isHit", yes(get("hit")), "хит");
        if (has("isNew")) set("isNew", yes(get("isNew")), "новинка");
        if (has("active") && t("active")) set("isActive", !no(get("active")), "показ на сайте");
        if (t("label") && t("label") !== v.label) { v.label = t("label"); changes.push("объём"); }
        const photo = t("photo");
        if (photo && photoOk(photo) && !p.images.includes(photo)) { p.images = [photo, ...p.images]; changes.push("фото"); }
      }
      const uniq = [...new Set(changes)];
      out.kind = uniq.length ? "upd" : "same";
      out.what = uniq.length ? `Обновится: ${uniq.join(", ")}` : "Без изменений";
      res.rows.push(out);
      res.counts[out.kind]++;
      continue;
    }

    // ---- нового артикула нет на сайте: добавляем ----
    const miss = [!t("brand") && "бренда", !t("name") && "названия", !t("label") && "объёма / оттенка", price === null && "цены"].filter(Boolean);
    if (miss.length) { fail(`Новый товар: нет ${miss.join(", ")}`); continue; }
    const variant: Variant = { id: sku, sku, label: t("label"), price: Math.round(price!), oldPrice: old && old > price! ? Math.round(old) : undefined, stock: stock ?? 0, barcode: t("barcode") || undefined };
    if (variant.id.length > 60 || /[^\p{L}\p{N}._-]/u.test(variant.id)) variant.id = crypto.randomUUID();

    const key = `${norm(t("brand"))}|${norm(t("name"))}`;
    const same = byName.get(key);
    if (same) {
      same.variants.push(variant);
      bySku.set(norm(sku), { p: same, v: variant });
      out.kind = "variant";
      out.what = "Новый объём / оттенок к товару";
      res.rows.push(out);
      res.counts.variant++;
      continue;
    }
    const cat = t("cat") ? findCat(t("cat")) : undefined;
    if (!cat) { fail(t("cat") ? `Нет раздела «${t("cat")}» — см. лист «Разделы»` : "Новый товар: нет раздела"); continue; }
    const sub = t("sub") ? findSub(cat.id, t("sub")) : undefined;

    let brand = brands.get(norm(t("brand")));
    if (!brand) {
      const slug = unique(slugify(t("brand")), brandSlugs);
      brand = { id: slug, slug, name: t("brand"), country: "", description: "", isPopular: false } satisfies Brand;
      db.brands.push(brand);
      brands.set(norm(brand.name), brand);
      brandName.set(brand.id, brand.name);
      res.newBrands.push(brand.name);
    }
    const slug = unique(slugify(`${brand.name} ${t("name")}`), slugs);
    const photo = t("photo");
    const product: Product = {
      id: slug,
      slug,
      name: t("name"),
      brandId: brand.id,
      categoryId: cat.id,
      subcategoryId: sub?.id,
      shortDescription: t("short"),
      description: t("desc"),
      images: photo && photoOk(photo) ? [photo] : [],
      art: { ...cat.art },
      variants: [variant],
      gender: genderOf(t("gender")),
      family: t("family") || undefined,
      notes: parseNotes(t("notes")),
      tags: [],
      isHit: yes(get("hit")),
      isNew: yes(get("isNew")),
      isActive: !no(get("active")),
      rating: 5,
      reviews: [],
      createdAt: now,
    };
    db.products.unshift(product);
    byName.set(key, product);
    bySku.set(norm(sku), { p: product, v: variant });
    res.newProducts++;
    out.kind = "new";
    out.what = t("sub") && !sub ? `Новый товар (подраздел «${t("sub")}» не найден — без подраздела)` : "Новый товар";
    res.rows.push(out);
    res.counts.new++;
  }
  return res;
}

/** Весь каталог в виде листов Excel — тем же форматом, что и загрузка */
export function catalogSheets(db: Database): Sheet[] {
  const brand = new Map(db.brands.map((b) => [b.id, b.name]));
  const cat = new Map(db.categories.map((c) => [c.id, c.name]));
  const rows: Cell[][] = [[...HEADERS]];
  for (const p of db.products) {
    const notes = p.notes && [p.notes.top, p.notes.heart, p.notes.base].some((l) => l.length) ? [p.notes.top, p.notes.heart, p.notes.base].map((l) => l.join(", ")).join(" / ") : "";
    for (const v of p.variants) {
      rows.push([
        v.sku || v.id, v.barcode ?? "", brand.get(p.brandId) ?? "", p.name, cat.get(p.categoryId) ?? "", p.subcategoryId ? cat.get(p.subcategoryId) ?? "" : "",
        v.label, v.price, v.oldPrice ?? "", v.stock, p.gender ? GENDER_RU[p.gender] : "", p.family ?? "", notes, p.shortDescription, p.description,
        p.images[0] ?? "", p.isHit ? "да" : "", p.isNew ? "да" : "", p.isActive ? "да" : "нет",
      ]);
    }
  }
  const sections: Cell[][] = [["Раздел", "Подраздел"]];
  for (const top of db.categories.filter((c) => !c.parentId).sort((a, b) => a.order - b.order)) {
    const subs = db.categories.filter((c) => c.parentId === top.id).sort((a, b) => a.order - b.order);
    if (!subs.length) sections.push([top.name, ""]);
    for (const s of subs) sections.push([top.name, s.name]);
  }
  return [
    { name: "Товары", rows, widths: WIDTHS },
    { name: "Разделы", rows: sections, widths: [22, 28] },
  ];
}
