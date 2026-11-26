import CatalogView, { type SP } from "@/components/CatalogView";
import { getDb } from "@/lib/db";

export const metadata = {
  title: "Распив ароматов 10 мл",
  description: "Распив оригинальной нишевой и селективной парфюмерии: аромат из флакона в атомайзере 8–10 мл. Попробуйте дорогой аромат, не покупая большой флакон.",
};

const STEPS: [string, string][] = [
  ["Что это", "Мы аккуратно отливаем аромат из оригинального флакона в атомайзер-спрей на 8–10 мл."],
  ["Зачем", "Носить аромат пару недель и понять, ваш ли он, прежде чем тратиться на большой флакон. Или взять с собой в поездку."],
  ["Только оригинал", "Разливаем из флаконов, которые продаются в наших магазинах. Атомайзер подписан: название аромата и объём."],
  ["Сколько хватит", "10 мл — это около 100–150 нажатий: примерно месяц, если пользоваться каждый день."],
];

export default async function RaspivPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const db = await getDb();
  return (
    <CatalogView
      db={db}
      title="Ароматы на распив"
      hideTitle
      hero={
        <section className="mt-6 overflow-hidden rounded-3xl bg-[#2a2220] p-7 text-cream sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[.28em] text-[#e8c98f]">Распив · 8–10 мл</p>
          <h1 className="h-display mt-3 text-5xl leading-none sm:text-6xl">Распив ароматов</h1>
          <p className="mt-4 max-w-2xl text-white/80">Нишевая и селективная парфюмерия в маленьком объёме — по цене в несколько раз ниже флакона.</p>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {STEPS.map(([t, d]) => (
              <div key={t} className="rounded-2xl bg-white/5 p-4 sm:p-5">
                <p className="font-semibold text-[#e8c98f]">{t}</p>
                <p className="mt-1.5 text-xs text-white/75 sm:text-sm">{d}</p>
              </div>
            ))}
          </div>
        </section>
      }
      crumbs={[{ name: "Распив" }]}
      base={{ decant: true }}
      sp={sp}
    />
  );
}
