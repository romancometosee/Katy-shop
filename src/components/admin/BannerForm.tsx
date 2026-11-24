"use client";
import { useState } from "react";
import { Field, Toggle } from "./ui";
import ProductArt from "../ProductArt";
import { bannerThemes } from "@/lib/bannerThemes";
import { deleteBanner, saveBanner } from "@/lib/admin-actions";
import type { ArtShape, Banner } from "@/lib/types";

const themeNames: Record<Banner["theme"], string> = { noir: "Тёмная", rose: "Розовая", gold: "Золотая", sage: "Мятная", lilac: "Лиловая" };

export default function BannerForm({ banner, links }: { banner?: Banner; links: { href: string; name: string }[] }) {
  const [theme, setTheme] = useState<Banner["theme"]>(banner?.theme ?? "rose");
  const [title, setTitle] = useState(banner?.title ?? "");
  const [subtitle, setSubtitle] = useState(banner?.subtitle ?? "");
  const [button, setButton] = useState(banner?.buttonText ?? "Смотреть");
  const [shape, setShape] = useState<ArtShape>(banner?.artShape ?? "flacon-square");
  const [image, setImage] = useState<string | undefined>(banner?.image);
  const t = bannerThemes[theme];

  return (
    <form action={saveBanner} className="space-y-6">
      <input type="hidden" name="id" value={banner?.id ?? ""} />
      <input type="hidden" name="theme" value={theme} />
      <input type="hidden" name="artShape" value={shape} />
      <input type="hidden" name="removeImage" value={image ? "" : "true"} />

      {/* предпросмотр */}
      <div className="relative flex min-h-64 items-center overflow-hidden rounded-[2rem]" style={{ background: t.bg }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {image && <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" />}
        <div className="relative max-w-lg p-10">
          <p className={`h-display text-5xl ${t.text}`}>{title || "Заголовок"}</p>
          <p className={`mt-3 ${t.sub}`}>{subtitle || "Подзаголовок баннера"}</p>
          <span className={`btn mt-5 ${t.btn}`}>{button}</span>
        </div>
        {!image && <ProductArt shape={shape} color={t.art[0]} accent={t.art[1]} withBg={false} className="absolute bottom-4 right-10 hidden h-[80%] md:block" />}
      </div>

      <div className="card grid gap-4 p-6 md:grid-cols-2">
        <Field label="Заголовок *"><input name="title" required value={title} onChange={(e) => setTitle(e.target.value)} className="input" /></Field>
        <Field label="Подзаголовок"><input name="subtitle" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className="input" /></Field>
        <Field label="Текст кнопки"><input name="buttonText" value={button} onChange={(e) => setButton(e.target.value)} className="input" /></Field>
        <Field label="Куда ведёт кнопка" hint="Выберите из списка или впишите свой адрес">
          <input name="link" list="banner-links" defaultValue={banner?.link ?? "/sale"} className="input" />
          <datalist id="banner-links">{links.map((l) => <option key={l.href} value={l.href}>{l.name}</option>)}</datalist>
        </Field>
        <Field label="Цветная тема">
          <div className="flex flex-wrap gap-2">
            {(Object.keys(bannerThemes) as Banner["theme"][]).map((k) => (
              <button type="button" key={k} onClick={() => setTheme(k)} className={`rounded-full px-4 py-2 text-xs font-semibold ring-offset-2 ${theme === k ? "ring-2 ring-ink" : ""} ${bannerThemes[k].text}`} style={{ background: bannerThemes[k].bg }}>{themeNames[k]}</button>
            ))}
          </div>
        </Field>
        <Field label="Картинка-флакон (если нет фото)">
          <select value={shape} onChange={(e) => setShape(e.target.value as ArtShape)} className="input">
            {["flacon-square", "flacon-round", "flacon-tall", "jar", "dropper", "lipstick", "compact"].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Своё фото на фон" hint="Лучше горизонтальное, от 1600 px в ширину">
          <input type="file" name="upload" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) setImage(URL.createObjectURL(f)); }} className="input" />
          {image && <button type="button" onClick={() => setImage(undefined)} className="mt-2 text-xs text-rose underline">Убрать фото</button>}
        </Field>
        <div className="space-y-3">
          <Field label="Порядок"><input name="order" defaultValue={banner?.order ?? 1} className="input w-24" /></Field>
          <Toggle name="isActive" defaultChecked={banner?.isActive ?? true} label="Показывать на сайте" />
        </div>
      </div>
      <div className="flex gap-4">
        <button className="btn-dark">Сохранить баннер</button>
        {banner && <button formAction={deleteBanner} formNoValidate onClick={(e) => { if (!confirm("Удалить баннер?")) e.preventDefault(); }} className="text-sm text-rose underline">Удалить</button>}
      </div>
    </form>
  );
}
