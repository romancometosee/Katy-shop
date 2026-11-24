/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { getDb } from "@/lib/db";
import { searchProducts, type ProductView } from "@/lib/catalog";
import { rub } from "@/lib/format";
import type { Database } from "@/lib/types";

// МАКЕТ «Сравнения» для Романа — на сайте нигде не показывается, поисковикам закрыт.
// Характеристики (стойкость, шлейф, сезон…) — примерные, для наглядности.
export const metadata = { title: "Макет: сравнение товаров", robots: { index: false, follow: false } };

const PERFUMES = ["maison-francis-kurkdjian-baccarat-rouge-540-eau-de-parfum", "le-labo-santal-33", "tom-ford-tobacco-vanille"];
const SHAMPOOS = ["olaplex-no-4-bond-maintenance-shampoo", "moroccanoil-uvlazhnyayushchiy-shampun-hydrating-shampoo", "kerastase-elixir-ultime-shampun"];

const perfumeExtra: Record<string, Record<string, string | number>> = {
  [PERFUMES[0]]: { Стойкость: 5, Шлейф: 5, Сезон: "осень · зима", Время: "вечер", Настроение: "роскошь, тепло" },
  [PERFUMES[1]]: { Стойкость: 4, Шлейф: 3, Сезон: "круглый год", Время: "день", Настроение: "спокойствие, уют" },
  [PERFUMES[2]]: { Стойкость: 5, Шлейф: 4, Сезон: "зима", Время: "вечер", Настроение: "тепло, пряность" },
};
const shampooExtra: Record<string, Record<string, string>> = {
  [SHAMPOOS[0]]: { "Тип волос": "повреждённые, окрашенные", Эффект: "восстановление", "Без сульфатов": "да", "Частота": "2–3 раза в неделю" },
  [SHAMPOOS[1]]: { "Тип волос": "сухие, нормальные", Эффект: "увлажнение, блеск", "Без сульфатов": "да", "Частота": "ежедневно" },
  [SHAMPOOS[2]]: { "Тип волос": "тусклые, все типы", Эффект: "питание, блеск", "Без сульфатов": "нет", "Частота": "ежедневно" },
};

function get(db: Database, slugs: string[]) {
  const ids = slugs.map((s) => db.products.find((p) => p.slug === s)?.id).filter(Boolean) as string[];
  const views = searchProducts(db, { ids });
  return slugs.map((s) => views.find((v) => v.slug === s)).filter(Boolean) as ProductView[];
}

const Dots = ({ n }: { n: number }) => (
  <span className="inline-flex gap-1">{Array.from({ length: 5 }, (_, i) => <span key={i} className={`h-2.5 w-2.5 rounded-full ${i < n ? "bg-rose" : "bg-line"}`} />)}</span>
);

function Table({ items, rows, best }: { items: ProductView[]; rows: [string, (p: ProductView) => React.ReactNode][]; best?: string }) {
  return (
    <div className="overflow-x-auto rounded-[1.75rem] bg-white shadow-sm">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr>
            <th className="w-44 p-5" />
            {items.map((p) => (
              <th key={p.id} className="p-5 align-top font-normal">
                <div className="relative mx-auto aspect-square w-36 overflow-hidden rounded-2xl bg-white">
                  {p.images[0] && <img src={p.images[0]} alt="" referrerPolicy="no-referrer" className="h-full w-full object-contain brightness-[1.08]" />}
                  {best === p.slug && <span className="absolute left-1 top-1 rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold uppercase text-white">Выбор покупателей</span>}
                </div>
                <p className="mt-3 text-[11px] font-bold uppercase tracking-wider text-ink-soft">{p.brandName}</p>
                <p className="h-display text-xl leading-tight">{p.name}</p>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(([label, f], i) => (
            <tr key={label} className={i % 2 ? "" : "bg-cream/60"}>
              <td className="p-4 pl-6 font-semibold text-ink-soft">{label}</td>
              {items.map((p) => <td key={p.id} className="p-4 text-center">{f(p)}</td>)}
            </tr>
          ))}
          <tr>
            <td />
            {items.map((p) => (
              <td key={p.id} className="p-5 text-center"><span className="inline-block rounded-full bg-ink px-6 py-2.5 text-xs font-semibold text-white">В корзину</span></td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default async function CompareDemo() {
  const db = await getDb();
  const perf = get(db, PERFUMES);
  const sh = get(db, SHAMPOOS);
  const notes = (p: ProductView, k: "top" | "heart" | "base") => db.products.find((x) => x.id === p.id)?.notes?.[k].join(", ") ?? "—";
  const per100 = (p: ProductView) => {
    const v = p.variants[0];
    const ml = parseInt(v.label);
    return ml ? rub((v.price / ml) * 100) : "—";
  };
  return (
    <div className="container-x pb-16 pt-8">
      <div className="rounded-2xl border border-dashed border-rose bg-[#fdf1f2] px-5 py-3 text-sm text-rose">Это макет для обсуждения. На сайте его пока нет, характеристики примерные.</div>

      <p className="mt-10 text-xs font-semibold uppercase tracking-[.28em] text-rose">Как это работает</p>
      <h1 className="h-display mt-2 text-5xl">Сравнение товаров</h1>
      <p className="mt-3 max-w-2xl text-ink-soft">В каждой карточке товара появится галочка «Сравнить». Отмечаете 2–4 аромата или шампуня, внизу экрана появляется панель «Сравнить (3)», и открывается таблица, где всё видно рядом: цена, ноты, стойкость, для каких волос и так далее.</p>

      <h2 className="h-display mt-12 text-3xl">Ароматы</h2>
      <div className="mt-4">
        <Table
          items={perf}
          best={PERFUMES[0]}
          rows={[
            ["Цена", (p) => <b>{p.variants.length > 1 ? "от " : ""}{rub(p.price)}</b>],
            ["Семейство", (p) => p.family ?? "—"],
            ["Верхние ноты", (p) => notes(p, "top")],
            ["Ноты сердца", (p) => notes(p, "heart")],
            ["Базовые ноты", (p) => notes(p, "base")],
            ["Стойкость", (p) => <Dots n={Number(perfumeExtra[p.slug]?.["Стойкость"] ?? 3)} />],
            ["Шлейф", (p) => <Dots n={Number(perfumeExtra[p.slug]?.["Шлейф"] ?? 3)} />],
            ["Сезон", (p) => perfumeExtra[p.slug]?.["Сезон"] ?? "—"],
            ["Время", (p) => perfumeExtra[p.slug]?.["Время"] ?? "—"],
            ["Рейтинг", (p) => `★ ${p.rating.toFixed(1)} · ${p.reviewsCount} отз.`],
          ]}
        />
      </div>

      <h2 className="h-display mt-14 text-3xl">Шампуни</h2>
      <div className="mt-4">
        <Table
          items={sh}
          rows={[
            ["Цена", (p) => <b>{rub(p.price)}</b>],
            ["Объём", (p) => p.variants[0].label],
            ["Цена за 100 мл", per100],
            ...Object.keys(shampooExtra[SHAMPOOS[0]]).map((k) => [k, (p: ProductView) => shampooExtra[p.slug]?.[k] ?? "—"] as [string, (p: ProductView) => React.ReactNode]),
            ["Рейтинг", (p) => `★ ${p.rating.toFixed(1)} · ${p.reviewsCount} отз.`],
          ]}
        />
      </div>

    </div>
  );
}

export default async function CompareDemo() {
  const db = await getDb();
  const perf = get(db, PERFUMES);
  const sh = get(db, SHAMPOOS);
  const notes = (p: ProductView, k: "top" | "heart" | "base") => db.products.find((x) => x.id === p.id)?.notes?.[k].join(", ") ?? "—";
  const per100 = (p: ProductView) => {
    const v = p.variants[0];
    const ml = parseInt(v.label);
    return ml ? rub((v.price / ml) * 100) : "—";
  };
  return (
    <div className="container-x pb-16 pt-8">
      <div className="rounded-2xl border border-dashed border-rose bg-[#fdf1f2] px-5 py-3 text-sm text-rose">Это макет для обсуждения. На сайте его пока нет, характеристики примерные.</div>

      <p className="mt-10 text-xs font-semibold uppercase tracking-[.28em] text-rose">Как это работает</p>
      <h1 className="h-display mt-2 text-5xl">Сравнение товаров</h1>
      <p className="mt-3 max-w-2xl text-ink-soft">В каждой карточке товара появится галочка «Сравнить». Отмечаете 2–4 аромата или шампуня, внизу экрана появляется панель «Сравнить (3)», и открывается таблица, где всё видно рядом: цена, ноты, стойкость, для каких волос и так далее.</p>

      <h2 className="h-display mt-12 text-3xl">Ароматы</h2>
      <div className="mt-4">
        <Table
          items={perf}
          best={PERFUMES[0]}
          rows={[
            ["Цена", (p) => <b>{p.variants.length > 1 ? "от " : ""}{rub(p.price)}</b>],
            ["Семейство", (p) => p.family ?? "—"],
            ["Верхние ноты", (p) => notes(p, "top")],
            ["Ноты сердца", (p) => notes(p, "heart")],
            ["Базовые ноты", (p) => notes(p, "base")],
            ["Стойкость", (p) => <Dots n={Number(perfumeExtra[p.slug]?.["Стойкость"] ?? 3)} />],
            ["Шлейф", (p) => <Dots n={Number(perfumeExtra[p.slug]?.["Шлейф"] ?? 3)} />],
            ["Сезон", (p) => perfumeExtra[p.slug]?.["Сезон"] ?? "—"],
            ["Время", (p) => perfumeExtra[p.slug]?.["Время"] ?? "—"],
            ["Рейтинг", (p) => `★ ${p.rating.toFixed(1)} · ${p.reviewsCount} отз.`],
          ]}
        />
      </div>

      <h2 className="h-display mt-14 text-3xl">Шампуни</h2>
      <div className="mt-4">
        <Table
          items={sh}
          rows={[
            ["Цена", (p) => <b>{rub(p.price)}</b>],
            ["Объём", (p) => p.variants[0].label],
            ["Цена за 100 мл", per100],
            ...Object.keys(shampooExtra[SHAMPOOS[0]]).map((k) => [k, (p: ProductView) => shampooExtra[p.slug]?.[k] ?? "—"] as [string, (p: ProductView) => React.ReactNode]),
            ["Рейтинг", (p) => `★ ${p.rating.toFixed(1)} · ${p.reviewsCount} отз.`],
          ]}
        />
      </div>

      {/* так будет выглядеть панель внизу экрана */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 py-3 shadow-2xl backdrop-blur">
        <div className="container-x flex items-center gap-3">
          <span className="text-sm font-semibold">Сравнение</span>
          {perf.map((p) => (
            <span key={p.id} className="h-12 w-10 overflow-hidden rounded-lg border border-line bg-white">
              {p.images[0] && <img src={p.images[0]} alt="" referrerPolicy="no-referrer" className="h-full w-full object-contain" />}
            </span>
          ))}
          <span className="hidden text-sm text-ink-soft sm:inline">выбрано 3 из 4</span>
          <Link href="#" className="btn-dark ml-auto px-6 py-2.5">Сравнить (3)</Link>
        </div>
      </div>
    </div>
  );
}
