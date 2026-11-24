"use client";
import { useMemo, useState } from "react";
import ProductArt from "../ProductArt";
import { Field, Toggle } from "./ui";
import { saveProduct, deleteProduct } from "@/lib/admin-actions";
import type { ArtShape, Brand, Category, Product, Variant } from "@/lib/types";

const shapes: [ArtShape, string][] = [
  ["flacon-square", "Флакон квадратный"],
  ["flacon-round", "Флакон круглый"],
  ["flacon-tall", "Флакон высокий"],
  ["jar", "Баночка"],
  ["tube", "Тюбик"],
  ["dropper", "Пипетка"],
  ["pump", "С дозатором"],
  ["lipstick", "Помада"],
  ["compact", "Коробка / набор"],
  ["palette", "Палетка"],
];

const families = ["Цветочный", "Цветочный фруктовый", "Цветочный древесный", "Шипровый", "Фужерный", "Древесный", "Древесный ароматический", "Восточный", "Восточный пряный", "Восточный гурманский", "Гурманский", "Мускусный", "Водный", "Цитрусовый", "Кожаный"];

export default function ProductForm({ product, brands, categories }: { product?: Product; brands: Brand[]; categories: Category[] }) {
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? categories.find((c) => !c.parentId)?.id ?? "");
  const [variants, setVariants] = useState<Partial<Variant>[]>(product?.variants ?? [{ label: "50 мл", price: 0, stock: 10 }]);
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [art, setArt] = useState(product?.art ?? { shape: "flacon-square" as ArtShape, color: "#f2c9a8", accent: "#1c1917", bg: "#f8ece2" });
  const [previews, setPreviews] = useState<string[]>([]);
  const tops = categories.filter((c) => !c.parentId);
  const subs = useMemo(() => categories.filter((c) => c.parentId === categoryId), [categories, categoryId]);
  const isPerfume = categoryId === "parfyumeriya";

  const setV = (i: number, patch: Partial<Variant>) => setVariants(variants.map((v, k) => (k === i ? { ...v, ...patch } : v)));

  return (
    <form action={saveProduct} className="grid gap-6 xl:grid-cols-[1fr_340px]">
      <input type="hidden" name="id" value={product?.id ?? ""} />
      <input type="hidden" name="variants" value={JSON.stringify(variants)} />
      <input type="hidden" name="images" value={JSON.stringify(images)} />
      <input type="hidden" name="artShape" value={art.shape} />

      <div className="space-y-6">
        <section className="card space-y-4 p-6">
          <p className="h-display text-2xl">Основное</p>
          <Field label="Название *"><input name="name" required defaultValue={product?.name} placeholder="Например: Coco Mademoiselle Eau de Parfum" className="input" /></Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Бренд *">
              <select name="brandId" required defaultValue={product?.brandId ?? ""} className="input">
                <option value="" disabled>Выберите</option>
                {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </Field>
            <Field label="Раздел *">
              <select name="categoryId" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="input">
                {tops.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Подраздел">
              <select name="subcategoryId" key={categoryId} defaultValue={product?.categoryId === categoryId ? product?.subcategoryId ?? "" : ""} className="input">
                <option value="">—</option>
                {subs.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Короткое описание" hint="Одна фраза — видна под названием товара"><input name="shortDescription" defaultValue={product?.shortDescription} className="input" /></Field>
          <Field label="Полное описание"><textarea name="description" rows={5} defaultValue={product?.description} className="input" /></Field>
        </section>

        <section className="card space-y-4 p-6">
          <div className="flex items-center justify-between">
            <p className="h-display text-2xl">Цены и объёмы</p>
            <button type="button" onClick={() => setVariants([...variants, { label: "", price: 0, stock: 0 }])} className="btn-light px-4 py-2">+ Добавить вариант</button>
          </div>
          <p className="text-xs text-ink-soft">Каждый вариант — отдельный объём или оттенок со своей ценой. «Старая цена» показывается зачёркнутой.</p>
          {variants.map((v, i) => (
            <div key={v.id ?? i} className="grid grid-cols-2 items-end gap-3 rounded-2xl bg-sand p-3 sm:grid-cols-[1.4fr_1fr_1fr_.8fr_auto]">
              <Field label="Объём / вариант"><input value={v.label ?? ""} onChange={(e) => setV(i, { label: e.target.value })} placeholder="50 мл" className="input py-2" /></Field>
              <Field label="Цена, ₽"><input value={v.price || ""} onChange={(e) => setV(i, { price: Number(e.target.value.replace(/\D/g, "")) })} inputMode="numeric" className="input py-2" /></Field>
              <Field label="Старая цена"><input value={v.oldPrice || ""} onChange={(e) => setV(i, { oldPrice: Number(e.target.value.replace(/\D/g, "")) || undefined })} inputMode="numeric" className="input py-2" /></Field>
              <Field label="Остаток"><input value={v.stock ?? 0} onChange={(e) => setV(i, { stock: Number(e.target.value.replace(/\D/g, "")) })} inputMode="numeric" className="input py-2" /></Field>
              <button type="button" onClick={() => setVariants(variants.filter((_, k) => k !== i))} className="mb-1 rounded-full px-3 py-2 text-sm text-rose hover:bg-white">Удалить</button>
            </div>
          ))}
        </section>

        <section className="card space-y-4 p-6">
          <p className="h-display text-2xl">Фотографии</p>
          <div className="flex flex-wrap gap-3">
            {images.map((src) => (
              <div key={src} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="h-28 w-24 rounded-xl object-cover" />
                <button type="button" onClick={() => setImages(images.filter((x) => x !== src))} className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-rose text-xs text-white">×</button>
              </div>
            ))}
            {previews.map((src) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={src} src={src} alt="" className="h-28 w-24 rounded-xl object-cover opacity-70" />
            ))}
          </div>
          <Field label="Загрузить фото" hint="Можно выбрать несколько. Первое фото будет главным. Формат JPG, PNG или WEBP.">
            <input type="file" name="upload" multiple accept="image/*" onChange={(e) => setPreviews(Array.from(e.target.files ?? []).map((f) => URL.createObjectURL(f)))} className="input" />
          </Field>
          <Field label="…или ссылка на фото"><input name="imageUrl" placeholder="https://…" className="input" /></Field>
        </section>

        <section className="card space-y-4 p-6">
          <p className="h-display text-2xl">{isPerfume ? "Аромат" : "Характеристики"}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Для кого">
              <select name="gender" defaultValue={product?.gender ?? ""} className="input">
                <option value="">—</option>
                <option value="women">Для неё</option>
                <option value="men">Для него</option>
                <option value="unisex">Унисекс</option>
              </select>
            </Field>
            <Field label="Семейство аромата">
              <input name="family" list="families" defaultValue={product?.family} className="input" />
              <datalist id="families">{families.map((f) => <option key={f} value={f} />)}</datalist>
            </Field>
          </div>
          {isPerfume && (
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Верхние ноты" hint="через запятую"><input name="notesTop" defaultValue={product?.notes?.top.join(", ")} className="input" /></Field>
              <Field label="Ноты сердца"><input name="notesHeart" defaultValue={product?.notes?.heart.join(", ")} className="input" /></Field>
              <Field label="Базовые ноты"><input name="notesBase" defaultValue={product?.notes?.base.join(", ")} className="input" /></Field>
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Тип кожи" hint="через запятую, для ухода"><input name="skinType" defaultValue={product?.skinType?.join(", ")} className="input" /></Field>
            <Field label="Теги для поиска" hint="через запятую"><input name="tags" defaultValue={product?.tags.join(", ")} className="input" /></Field>
          </div>
          <Field label="Адрес страницы" hint="Заполнится сам из названия"><input name="slug" defaultValue={product?.slug} className="input" /></Field>
        </section>
      </div>

      <div className="space-y-6">
        <section className="card space-y-4 p-6 xl:sticky xl:top-6">
          <Toggle name="isActive" defaultChecked={product?.isActive ?? true} label="Показывать на сайте" />
          <Toggle name="isHit" defaultChecked={product?.isHit} label="Хит продаж" />
          <Toggle name="isNew" defaultChecked={product?.isNew ?? !product} label="Новинка" />
          <button className="btn-dark w-full">Сохранить товар</button>
          {product && (
            <button formAction={deleteProduct} formNoValidate onClick={(e) => { if (!confirm("Удалить товар навсегда?")) e.preventDefault(); }} className="w-full text-sm text-rose underline">Удалить товар</button>
          )}
          <div className="border-t border-line pt-4">
            <p className="label">Иллюстрация (если нет фото)</p>
            <div className="mx-auto h-48 w-40 overflow-hidden rounded-2xl"><ProductArt {...art} /></div>
            <select value={art.shape} onChange={(e) => setArt({ ...art, shape: e.target.value as ArtShape })} className="input mt-3 py-2">
              {shapes.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[11px] text-ink-soft">
              {([["artColor", "color", "Флакон"], ["artAccent", "accent", "Крышка"], ["artBg", "bg", "Фон"]] as const).map(([n, k, l]) => (
                <label key={n}>
                  <input type="color" name={n} value={art[k]} onChange={(e) => setArt({ ...art, [k]: e.target.value })} className="h-10 w-full cursor-pointer rounded-lg border border-line" />
                  {l}
                </label>
              ))}
            </div>
          </div>
        </section>
      </div>
    </form>
  );
}
