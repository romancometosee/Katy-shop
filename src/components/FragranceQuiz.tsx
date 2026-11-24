"use client";
import Link from "next/link";
import { useState } from "react";
import ProductCard from "./ProductCard";
import type { ProductView } from "@/lib/catalog";

type Answer = { label: string; hint: string; value: string };
const steps: { q: string; key: string; options: Answer[] }[] = [
  { q: "Для кого ищем аромат?", key: "gender", options: [
    { label: "Для неё", hint: "женственные ароматы", value: "women,unisex" },
    { label: "Для него", hint: "мужские ароматы", value: "men,unisex" },
    { label: "Без разницы", hint: "унисекс и всё подряд", value: "" },
  ] },
  { q: "Какое настроение вам ближе?", key: "family", options: [
    { label: "Свежесть", hint: "море, цитрусы, травы", value: "Водный,Фужерный,Фужерный цветочный,Древесный ароматический" },
    { label: "Цветы", hint: "роза, пион, жасмин", value: "Цветочный,Цветочный фруктовый,Цветочный шипровый,Цветочный древесный,Шипровый,Восточный цветочный" },
    { label: "Сладость", hint: "ваниль, пралине, вишня", value: "Гурманский,Восточный гурманский,Восточный фужерный" },
    { label: "Дерево и кожа", hint: "сандал, уд, табак", value: "Древесный,Кожаный,Восточный пряный,Восточный,Шипровый фруктовый" },
    { label: "Чистая кожа", hint: "мускус, амбра", value: "Мускусный" },
  ] },
  { q: "Когда будете носить?", key: "season", options: [
    { label: "Каждый день", hint: "офис, учёба, прогулки", value: "day" },
    { label: "Вечером", hint: "свидания и выходы", value: "evening" },
    { label: "Особые случаи", hint: "чтобы запомнили", value: "special" },
  ] },
  { q: "Какой бюджет?", key: "max", options: [
    { label: "До 10 000 ₽", hint: "", value: "10000" },
    { label: "До 20 000 ₽", hint: "", value: "20000" },
    { label: "Не важно", hint: "главное — аромат", value: "" },
  ] },
];

export default function FragranceQuiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<ProductView[] | null>(null);

  const finish = async (a: Record<string, string>) => {
    const build = (withFamily: boolean) => {
      const p = new URLSearchParams({ category: "parfyumeriya", limit: "8" });
      if (a.gender) p.set("gender", a.gender);
      if (withFamily && a.family) p.set("family", a.family);
      if (a.max) p.set("max", a.max);
      return `/api/products?${p}`;
    };
    let list: ProductView[] = await fetch(build(true)).then((r) => r.json());
    if (!list.length) list = await fetch(build(false)).then((r) => r.json());
    setResult(list);
  };

  const choose = (value: string) => {
    const a = { ...answers, [steps[step].key]: value };
    setAnswers(a);
    if (step < steps.length - 1) setStep(step + 1);
    else finish(a);
  };

  if (result)
    return (
      <div>
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.25em] text-rose">Ваша подборка</p>
            <h2 className="h-display mt-2 text-4xl">Мы подобрали {result.length} ароматов</h2>
            <p className="mt-2 text-ink-soft">Не уверены? Напишите нам — парфюмер-консультант поможет выбрать, а в заказ мы положим пробники.</p>
          </div>
          <button onClick={() => { setStep(0); setAnswers({}); setResult(null); }} className="btn-light">Пройти заново</button>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {result.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
        {!result.length && <Link href="/catalog/parfyumeriya" className="btn-dark">Смотреть весь каталог</Link>}
      </div>
    );

  const s = steps[step];
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 flex gap-2">
        {steps.map((_, i) => <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? "bg-ink" : "bg-line"}`} />)}
      </div>
      <p className="text-sm text-ink-soft">Вопрос {step + 1} из {steps.length}</p>
      <h2 className="h-display mt-2 text-4xl sm:text-5xl">{s.q}</h2>
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {s.options.map((o) => (
          <button key={o.label} onClick={() => choose(o.value)} className="card p-6 text-left transition hover:-translate-y-0.5 hover:border-ink hover:shadow-lg">
            <span className="h-display block text-2xl">{o.label}</span>
            {o.hint && <span className="text-sm text-ink-soft">{o.hint}</span>}
          </button>
        ))}
      </div>
      {step > 0 && <button onClick={() => setStep(step - 1)} className="mt-6 text-sm underline underline-offset-4">← Назад</button>}
    </div>
  );
}
