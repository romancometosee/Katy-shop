// Основные типы данных магазина

export type ArtShape =
  | "flacon-round"
  | "flacon-square"
  | "flacon-tall"
  | "jar"
  | "tube"
  | "dropper"
  | "lipstick"
  | "compact"
  | "pump"
  | "palette";

/** Нарисованная иллюстрация товара — используется, пока нет настоящего фото */
export type ProductArt = {
  shape: ArtShape;
  color: string; // основной цвет флакона / упаковки
  accent: string; // цвет крышки / деталей
  bg: string; // фон карточки
};

export type Variant = {
  id: string;
  label: string; // «50 мл», «Тестер 100 мл», «Оттенок 02»
  price: number; // цена в рублях
  oldPrice?: number; // зачёркнутая цена
  stock: number;
};

export type Review = {
  id: string;
  author: string;
  rating: number; // 1..5
  text: string;
  date: string; // ISO
  approved: boolean;
};

export type Gender = "women" | "men" | "unisex";

export type Product = {
  id: string;
  slug: string;
  name: string;
  brandId: string;
  categoryId: string; // верхний раздел
  subcategoryId?: string;
  shortDescription: string;
  description: string;
  images: string[]; // URL настоящих фото (если есть)
  art: ProductArt;
  variants: Variant[];
  gender?: Gender;
  // ароматы
  notes?: { top: string[]; heart: string[]; base: string[] };
  family?: string; // «цветочный», «древесный» …
  // уход / макияж
  skinType?: string[];
  tags: string[];
  isHit: boolean;
  isNew: boolean;
  isActive: boolean;
  rating: number;
  reviews: Review[];
  createdAt: string;
};

export type Category = {
  id: string;
  slug: string;
  name: string;
  description: string;
  parentId?: string;
  order: number;
  art: ProductArt;
};

export type Brand = {
  id: string;
  slug: string;
  name: string;
  country: string;
  description: string;
  isPopular: boolean;
};

export type PromotionScope = "all" | "category" | "brand" | "products";

/**
 * Механика акции:
 * percent — скидка % на товары (цены на сайте сразу ниже);
 * bundle — «3=2»: из каждых N товаров акции самый дешёвый бесплатно;
 * gift — подарок при покупке товаров акции от суммы;
 * tiers — чем больше сумма, тем больше скидка (−5% от 3000, −10% от 5000…);
 * delivery — бесплатная доставка (можно от суммы).
 */
export type PromotionKind = "percent" | "bundle" | "gift" | "tiers" | "delivery";

/** Акция: скидка на группу товаров на время */
export type Promotion = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  discountPercent: number;
  scope: PromotionScope;
  targetIds: string[]; // id категорий / брендов / товаров
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  color: string; // цвет плашки
  /** механика; если не указана — обычная скидка % */
  kind?: PromotionKind;
  /** bundle: сколько товаров берёте (3) и за сколько платите (2) */
  buyQty?: number;
  payQty?: number;
  /** gift / delivery: от какой суммы товаров акции */
  minTotal?: number;
  /** gift: что дарим */
  giftText?: string;
  /** tiers: ступени скидки по сумме */
  tiers?: { from: number; percent: number }[];
  /** «Товар дня»: один день, для адвент-календаря */
  dayDeal?: boolean;
};

/** Промокод для корзины */
export type PromoCode = {
  code: string;
  discountPercent: number;
  minTotal: number;
  isActive: boolean;
};

/** Баннер на главной */
export type Banner = {
  id: string;
  title: string;
  subtitle: string;
  buttonText: string;
  link: string;
  image?: string; // своё фото
  theme: "rose" | "noir" | "gold" | "sage" | "lilac";
  artShape: ArtShape;
  order: number;
  isActive: boolean;
};

export type OrderStatus = "new" | "confirmed" | "shipped" | "done" | "cancelled";

export type OrderItem = {
  productId: string;
  variantId: string;
  name: string;
  variantLabel: string;
  price: number;
  qty: number;
  /** пожелание к сертификату или подарку */
  note?: string;
};

export type Order = {
  id: string;
  number: number;
  createdAt: string;
  customer: { name: string; phone: string; email: string; city: string; address: string; comment: string };
  delivery: "courier" | "pickup" | "post";
  items: OrderItem[];
  subtotal: number;
  discount: number;
  deliveryPrice: number;
  total: number;
  promoCode?: string;
  /** скидки и подарки по акциям в корзине */
  promos?: { title: string; amount: number; gift?: string }[];
  /** баллы Клуба Katy, начисленные за заказ */
  pointsEarned?: number;
  gift: string;
  status: OrderStatus;
};

export type Settings = {
  shopName: string;
  tagline: string;
  phone: string;
  email: string;
  instagram: string;
  telegram: string;
  freeDeliveryFrom: number;
  deliveryPrice: number;
  announcement: string; // бегущая строка сверху
  giftText: string;
};

export type Database = {
  settings: Settings;
  categories: Category[];
  brands: Brand[];
  products: Product[];
  promotions: Promotion[];
  promoCodes: PromoCode[];
  banners: Banner[];
  orders: Order[];
  /** Участники Клуба Katy */
  members?: ClubMember[];
  loginCodes?: LoginCode[];
  /** Версия демо-данных: при обновлении сайта новые разделы и товары добавляются в уже сохранённые данные */
  seedVersion?: number;
};

/** Участник Клуба Katy. Ключ — телефон (как в накопительной системе магазинов) */
export type ClubMember = {
  phone: string; // 79991234567
  name: string;
  birthday?: string; // ГГГГ-ММ-ДД
  email?: string;
  points: number;
  createdAt: string;
  /** история баллов: начисления и списания */
  history?: PointsEntry[];
};

export type PointsEntry = {
  at: string;
  kind: "welcome" | "order" | "birthday" | "manual" | "store";
  points: number; // + начислено, − списано
  orderNumber?: number;
  note?: string;
};

/** Одноразовый код для входа в личный кабинет (хранится только хэш) */
export type LoginCode = { phone: string; hash: string; expires: string; tries: number; sentAt: string[] };
