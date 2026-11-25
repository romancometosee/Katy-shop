// Клуб Katy и подарочные сертификаты: правила в одном месте.
// ВАЖНО: уровни и проценты — пример. В магазинах уже есть накопительная система
// по номеру телефона; когда будет доступ к ней, подставим её правила и баланс.

export const CLUB_LEVELS = [
  { name: "Katy", from: 0, percent: 5, note: "сразу после вступления" },
  { name: "Katy Silver", from: 30000, percent: 7, note: "покупки от 30 000 ₽ за год" },
  { name: "Katy Gold", from: 70000, percent: 10, note: "покупки от 70 000 ₽ за год" },
];

export const BIRTHDAY_BONUS = 1000; // баллов в подарок на день рождения
export const WELCOME_BONUS = 300; // баллов за вступление

/** Телефон в одном виде: 79991234567 */
export function normPhone(s: string) {
  let d = s.replace(/\D/g, "");
  if (d.length === 11 && d.startsWith("8")) d = "7" + d.slice(1);
  if (d.length === 10) d = "7" + d;
  return d;
}

export function levelFor(yearSpend: number) {
  return [...CLUB_LEVELS].reverse().find((l) => yearSpend >= l.from) ?? CLUB_LEVELS[0];
}

export function nextLevel(yearSpend: number) {
  return CLUB_LEVELS.find((l) => l.from > yearSpend);
}

/**
 * ПРАВИЛА НАЧИСЛЕНИЯ БАЛЛОВ — здесь одно место для правил магазина.
 * Сейчас: процент уровня от суммы товаров (без сертификатов и после скидок).
 * Когда Роман пришлёт правила накопительной системы, меняем только эту функцию.
 */
export function pointsForOrder(o: { goodsTotal: number; yearSpend: number }) {
  return Math.max(0, Math.floor((o.goodsTotal * levelFor(o.yearSpend).percent) / 100));
}

/** Сумма покупок клиента за последние 12 месяцев (для уровня) */
export function yearSpend(orders: { customer: { phone: string }; status: string; createdAt: string; total: number }[], phone: string) {
  const yearAgo = Date.now() - 365 * 86400000;
  return orders.filter((o) => normPhone(o.customer.phone) === phone && o.status !== "cancelled" && new Date(o.createdAt).getTime() > yearAgo).reduce((s, o) => s + o.total, 0);
}

export const POINTS_KIND: Record<string, string> = { welcome: "Приветственные баллы", order: "За заказ", birthday: "Подарок на день рождения", manual: "Начислено магазином", store: "Покупка в магазине" };

// ---------- Подарочные сертификаты ----------
export const GIFT_AMOUNTS = [1000, 3000, 5000, 10000];
export const GIFT_MIN = 500;
export const GIFT_MAX = 100000;
export const GIFT_DESIGNS = [
  { id: "noir", name: "Чёрный с золотом", bg: "linear-gradient(135deg,#1c1917,#3a2e2a)", fg: "#e8c98f" },
  { id: "rose", name: "Пудровый", bg: "linear-gradient(135deg,#f6d5d9,#f9ece4)", fg: "#1c1917" },
  { id: "winter", name: "Новогодний", bg: "linear-gradient(135deg,#7a1f2b,#b8475a)", fg: "#fff4e0" },
  { id: "sage", name: "Шалфей", bg: "linear-gradient(135deg,#dfe8da,#f4f1e8)", fg: "#2f3b2b" },
];
export const GIFT_BOX = { id: "gift-box", price: 490 };
export const GIFT_BOXES = [
  { id: "classic", name: "Чёрная коробка с лентой", color: "#1c1917" },
  { id: "powder", name: "Пудровая коробка", color: "#f2cfd4" },
  { id: "kraft", name: "Крафт с сухоцветами", color: "#c9a47a" },
];

/** variantId сертификата: gc-<сумма>-<дизайн>-<случайный хвост> */
export function parseGiftCard(variantId: string) {
  const m = /^gc-(\d+)-([a-z]+)(?:-[a-z0-9]+)?$/.exec(variantId);
  if (!m) return undefined;
  const amount = Number(m[1]);
  const design = GIFT_DESIGNS.find((d) => d.id === m[2]);
  if (!design || amount < GIFT_MIN || amount > GIFT_MAX) return undefined;
  return { amount, design };
}
