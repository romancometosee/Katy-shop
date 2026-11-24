// Готовые шаблоны акций: в админке выбираете шаблон — форма заполняется сама,
// остаётся выбрать товары и нажать «Сохранить».
import type { Promotion } from "./types";

export type PromoTemplate = {
  id: string;
  name: string;
  hint: string;
  when: string; // когда обычно проводят
  preset: Omit<Partial<Promotion>, "startsAt" | "endsAt">;
  /** даты: через сколько дней от сегодня и сколько длится, либо праздник [месяц, день начала, день конца] */
  dates: { days: number } | { month: number; from: number; to: number };
};

export const PROMO_TEMPLATES: PromoTemplate[] = [
  {
    id: "black-friday",
    name: "Чёрная пятница",
    hint: "Скидка на весь каталог или на раздел на несколько дней",
    when: "Конец ноября",
    preset: { kind: "percent", title: "Чёрная пятница", subtitle: "−20% на весь каталог", discountPercent: 20, scope: "all", color: "#1c1917" },
    dates: { days: 4 },
  },
  {
    id: "new-year",
    name: "Новогодняя: чем больше, тем выгоднее",
    hint: "Ступенчатая скидка: −5% от 3 000 ₽, −10% от 5 000 ₽, −15% от 10 000 ₽",
    when: "15–31 декабря",
    preset: { kind: "tiers", title: "Новогодние подарки", subtitle: "Чем больше подарков, тем больше скидка", discountPercent: 15, scope: "all", color: "#2f5d50", tiers: [{ from: 3000, percent: 5 }, { from: 5000, percent: 10 }, { from: 10000, percent: 15 }] },
    dates: { month: 12, from: 15, to: 31 },
  },
  {
    id: "advent",
    name: "Товар дня / адвент-календарь",
    hint: "Один товар со скидкой ровно на один день. Из таких дней складывается адвент-календарь",
    when: "Декабрь или любой день",
    preset: { kind: "percent", title: "Товар дня", subtitle: "Только сегодня", discountPercent: 30, scope: "products", color: "#9e3a52", dayDeal: true },
    dates: { days: 1 },
  },
  {
    id: "bundle-3-2",
    name: "3 = 2",
    hint: "Из каждых трёх товаров акции самый дешёвый — в подарок. Отлично для гель-лаков и уходовых линеек",
    when: "Любое время",
    preset: { kind: "bundle", title: "3 = 2 на гель-лаки", subtitle: "Третий — в подарок", discountPercent: 33, scope: "category", color: "#4b3a63", buyQty: 3, payQty: 2 },
    dates: { days: 14 },
  },
  {
    id: "bundle-4-3",
    name: "4 = 3",
    hint: "Четвёртый товар бесплатно — мягче, чем 3 = 2",
    when: "Любое время",
    preset: { kind: "bundle", title: "4 = 3", subtitle: "Четвёртый — в подарок", discountPercent: 25, scope: "category", color: "#4b3a63", buyQty: 4, payQty: 3 },
    dates: { days: 14 },
  },
  {
    id: "brand-gift",
    name: "Подарок от бренда",
    hint: "К покупке товаров бренда — миниатюра или косметичка. Так делают Летуаль и Золотое яблоко",
    when: "Любое время, часто вместе с брендом",
    preset: { kind: "gift", title: "Подарок от бренда", subtitle: "Миниатюра к покупке", discountPercent: 0, scope: "brand", color: "#b8935a", minTotal: 0, giftText: "миниатюра бренда" },
    dates: { days: 14 },
  },
  {
    id: "march-8",
    name: "8 Марта",
    hint: "Подарок при покупке от суммы",
    when: "1–8 марта",
    preset: { kind: "gift", title: "К 8 Марта", subtitle: "Подарок к покупке от 3 000 ₽", discountPercent: 0, scope: "all", color: "#c2546b", minTotal: 3000, giftText: "миниатюра аромата" },
    dates: { month: 3, from: 1, to: 8 },
  },
  {
    id: "feb-14",
    name: "14 февраля",
    hint: "Скидка на ароматы и наборы для двоих",
    when: "7–14 февраля",
    preset: { kind: "percent", title: "День влюблённых", subtitle: "−15% на ароматы", discountPercent: 15, scope: "category", color: "#9e3a52" },
    dates: { month: 2, from: 7, to: 14 },
  },
  {
    id: "feb-23",
    name: "23 Февраля",
    hint: "Скидка на мужские ароматы и уход",
    when: "16–23 февраля",
    preset: { kind: "percent", title: "К 23 Февраля", subtitle: "−15% на мужские ароматы", discountPercent: 15, scope: "category", color: "#2b6cb0" },
    dates: { month: 2, from: 16, to: 23 },
  },
  {
    id: "brand-week",
    name: "Неделя бренда",
    hint: "Скидка на один бренд на 7 дней",
    when: "Любое время",
    preset: { kind: "percent", title: "Неделя бренда", subtitle: "−15% на всю линейку", discountPercent: 15, scope: "brand", color: "#1c1917" },
    dates: { days: 7 },
  },
  {
    id: "free-delivery",
    name: "Бесплатная доставка",
    hint: "Доставка 0 ₽ на любой заказ или от суммы",
    when: "Выходные, праздники",
    preset: { kind: "delivery", title: "Доставка в подарок", subtitle: "Бесплатно на любой заказ", discountPercent: 0, scope: "all", color: "#2f5d50", minTotal: 0 },
    dates: { days: 3 },
  },
  {
    id: "birthday",
    name: "День рождения магазина",
    hint: "Ступенчатая скидка в честь праздника Katy",
    when: "Дата открытия",
    preset: { kind: "tiers", title: "День рождения Katy", subtitle: "Дарим скидку до 20%", discountPercent: 20, scope: "all", color: "#b8935a", tiers: [{ from: 2000, percent: 10 }, { from: 5000, percent: 15 }, { from: 10000, percent: 20 }] },
    dates: { days: 3 },
  },
  {
    id: "season-sale",
    name: "Сезонная распродажа",
    hint: "Крупная скидка на раздел: летом — на солнцезащиту, зимой — на уход",
    when: "Конец сезона",
    preset: { kind: "percent", title: "Сезонная распродажа", subtitle: "до −30%", discountPercent: 30, scope: "category", color: "#c2546b" },
    dates: { days: 14 },
  },
];

/** Даты для шаблона: от сегодня или ближайший будущий праздник */
export function templateDates(t: PromoTemplate, now = new Date()) {
  if ("days" in t.dates) {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const end = new Date(start.getTime() + (t.dates.days - 1) * 86400000);
    return { startsAt: start.toISOString(), endsAt: end.toISOString() };
  }
  const { month, from, to } = t.dates;
  let year = now.getFullYear();
  if (new Date(year, month - 1, to, 23, 59) < now) year++;
  return { startsAt: new Date(year, month - 1, from).toISOString(), endsAt: new Date(year, month - 1, to).toISOString() };
}
