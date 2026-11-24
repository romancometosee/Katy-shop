// Стартовый (демо) каталог. Загружается при первом запуске, дальше всё меняется через админку.
import type { ArtShape, Brand, Category, Database, Gender, Product, ProductArt } from "./types";
import { slugify } from "./slug";

const now = new Date("2026-11-20T10:00:00Z");
const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000).toISOString();
const daysAhead = (d: number) => new Date(now.getTime() + d * 86400000).toISOString();

const art = (shape: ArtShape, color: string, accent: string, bg: string): ProductArt => ({ shape, color, accent, bg });

// ---------- Разделы ----------
const top = (id: string, name: string, description: string, order: number, a: ProductArt): Category => ({
  id,
  slug: id,
  name,
  description,
  order,
  art: a,
});
const sub = (parentId: string, id: string, name: string, order: number): Category => ({
  id: `${parentId}--${id}`,
  slug: id,
  name,
  description: "",
  parentId,
  order,
  art: art("flacon-round", "#e8c9b8", "#1c1917", "#f6efe9"),
});

export const seedCategories: Category[] = [
  top("parfyumeriya", "Парфюмерия", "Более 5000 оригинальных ароматов: от культовой классики до редкой ниши.", 1, art("flacon-square", "#f3d7c6", "#1c1917", "#f7ece4")),
  sub("parfyumeriya", "zhenskie", "Женские ароматы", 1),
  sub("parfyumeriya", "muzhskie", "Мужские ароматы", 2),
  sub("parfyumeriya", "uniseks", "Унисекс", 3),
  sub("parfyumeriya", "nishevaya", "Нишевая парфюмерия", 4),
  sub("parfyumeriya", "miniatyury", "Миниатюры и пробники", 5),
  sub("parfyumeriya", "dlya-doma", "Ароматы для дома", 6),

  top("uhod-za-licom", "Уход за лицом", "Очищение, сыворотки и кремы от лучших косметических марок.", 2, art("dropper", "#d9e4d3", "#2f3b2b", "#eef3ea")),
  sub("uhod-za-licom", "ochishchenie", "Очищение", 1),
  sub("uhod-za-licom", "tonery", "Тонеры и эссенции", 2),
  sub("uhod-za-licom", "syvorotki", "Сыворотки", 3),
  sub("uhod-za-licom", "kremy", "Кремы", 4),
  sub("uhod-za-licom", "maski", "Маски", 5),
  sub("uhod-za-licom", "spf", "Солнцезащита", 6),

  top("makiyazh", "Макияж", "Тональные средства, помады, тушь и палетки.", 3, art("lipstick", "#b8475a", "#c9a46a", "#f7e6e8")),
  sub("makiyazh", "lico", "Лицо", 1),
  sub("makiyazh", "glaza", "Глаза", 2),
  sub("makiyazh", "guby", "Губы", 3),
  sub("makiyazh", "brovi", "Брови", 4),

  top("volosy", "Волосы", "Профессиональный уход и стайлинг для волос.", 4, art("pump", "#e6d3ad", "#3a2f1f", "#f6f0e3")),
  sub("volosy", "shampuni", "Шампуни", 1),
  sub("volosy", "maski-i-kondicionery", "Маски и кондиционеры", 2),
  sub("volosy", "masla", "Масла и сыворотки", 3),
  sub("volosy", "stayling", "Стайлинг", 4),

  top("telo", "Тело", "Гели, кремы, скрабы и парфюмированные средства для тела.", 5, art("jar", "#e9c7cf", "#7a3b4a", "#f8ecef")),
  sub("telo", "dush", "Гели для душа", 1),
  sub("telo", "kremy-dlya-tela", "Кремы и лосьоны", 2),
  sub("telo", "skraby", "Скрабы", 3),
  sub("telo", "dymki", "Дымки для тела", 4),

  top("nogti", "Ногти", "Гель-лаки, лаки, базы и топы, уход за ногтями и кутикулой.", 6, art("flacon-round", "#c8433d", "#1c1917", "#fbeceb")),
  sub("nogti", "gel-laki", "Гель-лаки", 1),
  sub("nogti", "laki", "Лаки для ногтей", 2),
  sub("nogti", "baza-i-top", "База и топ", 3),
  sub("nogti", "uhod-za-nogtyami", "Уход за ногтями и кутикулой", 4),

  top("nabory", "Подарочные наборы", "Готовые подарки: наборы, адвент-календари, дуэты.", 7, art("compact", "#d6c7e6", "#4b3a63", "#f1ecf7")),
  sub("nabory", "zhenskie-nabory", "Для неё", 1),
  sub("nabory", "muzhskie-nabory", "Для него", 2),
  sub("nabory", "advent", "Адвент-календари", 3),
];

// ---------- Бренды ----------
const b = (name: string, country: string, isPopular = false, description = ""): Brand => ({
  id: slugify(name),
  slug: slugify(name),
  name,
  country,
  isPopular,
  description: description || `${name} — оригинальная продукция бренда из страны ${country}.`,
});

export const seedBrands: Brand[] = [
  b("Chanel", "Франция", true, "Легендарный французский дом моды и парфюмерии, основанный Габриэль Шанель."),
  b("Dior", "Франция", true, "Дом высокой моды, создающий ароматы и косметику с 1947 года."),
  b("Tom Ford", "США", true, "Чувственные и смелые ароматы коллекций Signature и Private Blend."),
  b("Yves Saint Laurent", "Франция", true, "Дерзкая французская элегантность: ароматы, помады и тон."),
  b("Lancôme", "Франция", true, "Французская роскошь в уходе, макияже и парфюмерии."),
  b("Giorgio Armani", "Италия", true, "Итальянская элегантность: ароматы и легендарные тональные средства."),
  b("Maison Francis Kurkdjian", "Франция", true, "Парфюмерный дом Франсиса Куркджяна, создателя Baccarat Rouge 540."),
  b("Byredo", "Швеция", false, "Шведская ниша: минималистичные и поэтичные ароматы."),
  b("Le Labo", "США", true, "Ароматы, которые смешивают вручную прямо при покупке."),
  b("Kilian Paris", "Франция", false, "Роскошные ароматы в коллекционных флаконах."),
  b("Ex Nihilo", "Франция", false, "Высокая парфюмерия из Парижа."),
  b("Montale", "Франция", false, "Насыщенные восточные ароматы с удом и розой."),
  b("Creed", "Великобритания", true, "Исторический дом, создатель Aventus."),
  b("Guerlain", "Франция", false, "Один из старейших парфюмерных домов мира."),
  b("Initio", "Франция", false, "Ароматы, раскрывающие силу притяжения."),
  b("Escentric Molecules", "Германия", false, "Ароматы-молекулы, которые звучат по-разному на каждом."),
  b("Juliette Has a Gun", "Франция", false, "Ироничные и лёгкие ароматы для каждого дня."),
  b("Narciso Rodriguez", "США", false, "Мускусные ароматы с чистым, чувственным звучанием."),
  b("La Roche-Posay", "Франция", true, "Дерматологический уход для чувствительной кожи."),
  b("Clarins", "Франция", false, "Растительные формулы для ухода за лицом и телом."),
  b("Sisley", "Франция", false, "Фитокосметика класса люкс."),
  b("Estée Lauder", "США", true, "Знаменитые сыворотки и тональные средства."),
  b("Shiseido", "Япония", false, "Японские технологии ухода и защиты кожи."),
  b("Caudalie", "Франция", false, "Уход на основе винограда из Бордо."),
  b("Erborian", "Корея", false, "Корейско-французская косметика с травами."),
  b("Charlotte Tilbury", "Великобритания", true, "Голливудский макияж и знаменитая помада Pillow Talk."),
  b("NARS", "США", false, "Смелый макияж и культовые румяна Orgasm."),
  b("Benefit", "США", false, "Яркий макияж: тушь, брови, хайлайтеры."),
  b("Kérastase", "Франция", true, "Профессиональный уход за волосами класса люкс."),
  b("Olaplex", "США", false, "Восстановление волос на уровне связей."),
  b("OPI", "США", true, "Легендарные лаки и гель-лаки для ногтей, любимые мастерами по всему миру."),
  b("CND", "США", false, "Создатели Shellac — первого гель-лака, который снимается без опила."),
  b("Moroccanoil", "Израиль", false, "Уход на основе арганового масла."),
  b("Rituals", "Нидерланды", false, "Ритуалы ухода за телом и ароматы для дома."),
  b("Sol de Janeiro", "Бразилия", true, "Солнечные бразильские средства для тела."),
  b("Diptyque", "Франция", false, "Парижские свечи и ароматы."),
];

// ---------- Товары ----------
const perfumeVariants = (id: string, base: number, tester = true) => {
  const v = [
    { id: `${id}-30`, label: "30 мл", price: Math.round(base * 0.62 / 10) * 10, stock: 12 },
    { id: `${id}-50`, label: "50 мл", price: base, stock: 20 },
    { id: `${id}-100`, label: "100 мл", price: Math.round(base * 1.55 / 10) * 10, stock: 8 },
  ];
  if (tester) v.push({ id: `${id}-t`, label: "Тестер 100 мл", price: Math.round(base * 1.25 / 10) * 10, stock: 5 });
  return v;
};
const singleVariant = (id: string, label: string, price: number, oldPrice?: number) => [
  { id: `${id}-1`, label, price, oldPrice, stock: 25 },
];

type P = {
  name: string;
  brand: string;
  sub: string; // id подраздела вида parent--child
  price: number;
  label?: string;
  oldPrice?: number;
  shape: ArtShape;
  color: string;
  accent?: string;
  bg?: string;
  gender?: Gender;
  family?: string;
  notes?: [string[], string[], string[]];
  short: string;
  desc?: string;
  hit?: boolean;
  isNew?: boolean;
  tags?: string[];
  skin?: string[];
  rating?: number;
  age?: number;
};

const reviewAuthors = ["Анна", "Мария", "Екатерина", "Ольга", "Дмитрий", "Ирина", "Алексей", "Светлана", "Наталья", "Юлия"];
const reviewTexts = [
  "Оригинал, проверила по коду партии. Упаковано очень красиво, ещё и подарок положили!",
  "Заказываю уже не первый раз, доставка быстрая, всё целое. Рекомендую.",
  "Аромат держится весь день, получаю комплименты. Спасибо за помощь с выбором!",
  "Цена ниже, чем в рознице, а качество то же самое. Очень довольна.",
  "Помогли подобрать по моим любимым нотам — попали в точку.",
];

let counter = 0;
function product(p: P): Product {
  counter++;
  const [parent] = p.sub.split("--");
  const id = slugify(`${p.brand} ${p.name}`);
  const isPerfume = parent === "parfyumeriya" && !p.label;
  const reviewsCount = (counter % 4) + 1;
  return {
    id,
    slug: id,
    name: p.name,
    brandId: slugify(p.brand),
    categoryId: parent,
    subcategoryId: p.sub,
    shortDescription: p.short,
    description:
      p.desc ||
      `${p.short} ${isPerfume ? "Оригинальный аромат с гарантией подлинности. Поможем подобрать объём и бесплатно положим пробник в подарок." : "100% оригинальная продукция от официальных поставщиков. Срок годности — не менее 12 месяцев."}`,
    images: [],
    art: art(p.shape, p.color, p.accent || "#1c1917", p.bg || "#f6efe9"),
    variants: isPerfume ? perfumeVariants(id, p.price) : singleVariant(id, p.label || "1 шт", p.price, p.oldPrice),
    gender: p.gender,
    family: p.family,
    notes: p.notes ? { top: p.notes[0], heart: p.notes[1], base: p.notes[2] } : undefined,
    skinType: p.skin,
    tags: p.tags || [],
    isHit: !!p.hit,
    isNew: !!p.isNew,
    isActive: true,
    rating: p.rating ?? 4.6 + ((counter * 7) % 5) / 10,
    reviews: Array.from({ length: reviewsCount }, (_, i) => ({
      id: `${id}-r${i}`,
      author: reviewAuthors[(counter + i) % reviewAuthors.length],
      rating: 5 - ((counter + i) % 3 === 0 ? 1 : 0),
      text: reviewTexts[(counter + i) % reviewTexts.length],
      date: daysAgo(3 + i * 9 + (counter % 20)),
      approved: true,
    })),
    createdAt: daysAgo(p.age ?? 30 + (counter % 90)),
  };
}

const W = "parfyumeriya--zhenskie";
const M = "parfyumeriya--muzhskie";
const U = "parfyumeriya--uniseks";
const N = "parfyumeriya--nishevaya";

export const seedProducts: Product[] = [
  // ---- Женские
  product({ name: "Coco Mademoiselle Eau de Parfum", brand: "Chanel", sub: W, price: 14900, shape: "flacon-square", color: "#f2c9a8", accent: "#1c1917", bg: "#f8ece2", gender: "women", family: "Шипровый", notes: [["апельсин", "бергамот"], ["роза", "жасмин"], ["пачули", "ветивер", "ваниль"]], short: "Свежий восточный аромат для смелой и свободной женщины.", hit: true }),
  product({ name: "Chance Eau Tendre", brand: "Chanel", sub: W, price: 12900, shape: "flacon-round", color: "#f6c7cf", accent: "#e8b4c0", bg: "#fbeef1", gender: "women", family: "Цветочный фруктовый", notes: [["грейпфрут", "айва"], ["гиацинт", "жасмин"], ["белый мускус", "ирис"]], short: "Нежный цветочно-фруктовый аромат, наполненный лёгкостью.", hit: true }),
  product({ name: "Miss Dior Blooming Bouquet", brand: "Dior", sub: W, price: 11500, shape: "flacon-square", color: "#f5d0dc", accent: "#c9a0b2", bg: "#fcf0f4", gender: "women", family: "Цветочный", notes: [["бергамот"], ["пион", "роза"], ["белый мускус"]], short: "Букет пионов и роз — нежный, романтичный, весенний.", hit: true }),
  product({ name: "J'adore Eau de Parfum", brand: "Dior", sub: W, price: 13400, shape: "flacon-tall", color: "#f0d28a", accent: "#b8913f", bg: "#faf3df", gender: "women", family: "Цветочный", notes: [["груша", "дыня"], ["жасмин", "роза", "тубероза"], ["ваниль", "мускус"]], short: "Золотой цветочный букет — символ женственности." }),
  product({ name: "Libre Eau de Parfum", brand: "Yves Saint Laurent", sub: W, price: 12200, shape: "flacon-square", color: "#e9dccb", accent: "#c9a46a", bg: "#f5f0e8", gender: "women", family: "Фужерный цветочный", notes: [["лаванда", "мандарин"], ["цветы апельсина", "жасмин"], ["ваниль", "амбра"]], short: "Аромат свободы: лаванда и цветок апельсина.", hit: true }),
  product({ name: "Black Opium", brand: "Yves Saint Laurent", sub: W, price: 11800, shape: "flacon-tall", color: "#2b2230", accent: "#d64f8e", bg: "#efe7ee", gender: "women", family: "Восточный гурманский", notes: [["груша", "розовый перец"], ["кофе", "жасмин"], ["ваниль", "пачули"]], short: "Кофе, ваниль и белые цветы — ночной гурманский аромат." }),
  product({ name: "La Vie Est Belle", brand: "Lancôme", sub: W, price: 10900, shape: "flacon-round", color: "#e9b7c3", accent: "#2a2a2a", bg: "#f9ecef", gender: "women", family: "Гурманский", notes: [["чёрная смородина", "груша"], ["ирис", "жасмин"], ["пралине", "ваниль"]], short: "Сладкий ирис и пралине — аромат счастья." }),
  product({ name: "Idôle", brand: "Lancôme", sub: W, price: 9800, shape: "flacon-tall", color: "#f3d9d2", accent: "#c9a46a", bg: "#fbf1ee", gender: "women", family: "Цветочный шипровый", notes: [["груша", "бергамот"], ["роза", "жасмин"], ["белый мускус", "ваниль"]], short: "Чистая роза в тонком флаконе.", isNew: true, age: 6 }),
  product({ name: "For Her Eau de Parfum", brand: "Narciso Rodriguez", sub: W, price: 9200, shape: "flacon-square", color: "#f1c8cb", accent: "#e3a7ad", bg: "#fbeeef", gender: "women", family: "Мускусный", notes: [["роза", "персик"], ["мускус"], ["пачули", "амбра"]], short: "Знаменитый мускус с розой и персиком." }),
  product({ name: "Mon Guerlain", brand: "Guerlain", sub: W, price: 10500, shape: "flacon-square", color: "#e8cfa9", accent: "#a6864c", bg: "#f7f0e2", gender: "women", family: "Восточный фужерный", notes: [["лаванда", "бергамот"], ["самбак", "ирис"], ["ваниль таити", "сандал"]], short: "Лаванда и ваниль — тёплый и уютный аромат." }),

  // ---- Мужские
  product({ name: "Sauvage Eau de Parfum", brand: "Dior", sub: M, price: 12400, shape: "flacon-square", color: "#1e2b3c", accent: "#9aa6b4", bg: "#e7ecf2", gender: "men", family: "Фужерный", notes: [["бергамот", "перец"], ["лаванда", "звёздчатый анис"], ["амброксан", "ваниль"]], short: "Свежий и мощный аромат с бергамотом и амброй.", hit: true }),
  product({ name: "Bleu de Chanel Eau de Parfum", brand: "Chanel", sub: M, price: 13900, shape: "flacon-square", color: "#1a2740", accent: "#111827", bg: "#e5e9f1", gender: "men", family: "Древесный ароматический", notes: [["грейпфрут", "лимон"], ["имбирь", "жасмин"], ["ладан", "кедр", "сандал"]], short: "Древесно-ароматический аромат свободного мужчины.", hit: true }),
  product({ name: "Acqua di Giò Profondo", brand: "Giorgio Armani", sub: M, price: 9900, shape: "flacon-tall", color: "#2b5d86", accent: "#c0c6cc", bg: "#e5eef5", gender: "men", family: "Водный", notes: [["морские ноты", "бергамот"], ["розмарин", "лаванда"], ["пачули", "минеральный мускус"]], short: "Глубина моря и свежесть средиземноморья." }),
  product({ name: "Y Eau de Parfum", brand: "Yves Saint Laurent", sub: M, price: 10200, shape: "flacon-square", color: "#2a2f3a", accent: "#3e6db5", bg: "#e8ebf1", gender: "men", family: "Фужерный", notes: [["яблоко", "имбирь"], ["шалфей", "герань"], ["амбровое дерево", "тонка"]], short: "Свежий и сильный — для тех, кто идёт к цели." }),
  product({ name: "Aventus", brand: "Creed", sub: M, price: 32900, shape: "flacon-tall", color: "#20201f", accent: "#c9c4b8", bg: "#ecebe7", gender: "men", family: "Шипровый фруктовый", notes: [["ананас", "бергамот", "чёрная смородина"], ["берёза", "пачули", "жасмин"], ["мускус", "дубовый мох", "амбра"]], short: "Легенда мужской парфюмерии: ананас и дымная берёза.", hit: true }),
  product({ name: "Ombré Leather", brand: "Tom Ford", sub: M, price: 15600, shape: "flacon-square", color: "#3a2a22", accent: "#1c1917", bg: "#efe8e3", gender: "men", family: "Кожаный", notes: [["кардамон"], ["кожа", "жасмин"], ["амбра", "мох", "пачули"]], short: "Мягкая кожа и кардамон — аромат пустыни." }),
  product({ name: "Vetiver Eau de Toilette", brand: "Guerlain", sub: M, price: 8900, shape: "flacon-round", color: "#b7863f", accent: "#3a2f1f", bg: "#f6efe2", gender: "men", family: "Древесный", notes: [["бергамот", "грейпфрут"], ["перец", "герань"], ["ветивер", "кедр"]], short: "Ветивер и цитрусы — сухой и элегантный." }),

  // ---- Унисекс
  product({ name: "Santal 33", brand: "Le Labo", sub: U, price: 24500, shape: "flacon-tall", color: "#d9c3a5", accent: "#1c1917", bg: "#f4ede3", gender: "unisex", family: "Древесный", notes: [["кардамон", "ирис"], ["фиалка", "амбра"], ["сандал", "кедр", "кожа"]], short: "Культовый сандал, который узнают по шлейфу.", hit: true }),
  product({ name: "Another 13", brand: "Le Labo", sub: U, price: 24500, shape: "flacon-tall", color: "#ece6db", accent: "#1c1917", bg: "#f6f3ee", gender: "unisex", family: "Мускусный", notes: [["груша", "яблоко"], ["амброксан", "жасмин"], ["мускус", "мох"]], short: "Аромат кожи — чистый мускус и амбра." }),
  product({ name: "Molecule 01", brand: "Escentric Molecules", sub: U, price: 8900, shape: "flacon-tall", color: "#e6eef0", accent: "#e24a3b", bg: "#f2f6f7", gender: "unisex", family: "Древесный", notes: [["изо Е Супер"], ["изо Е Супер"], ["изо Е Супер"]], short: "Одна молекула, которая звучит по-своему на каждом.", hit: true }),
  product({ name: "Not a Perfume", brand: "Juliette Has a Gun", sub: U, price: 7400, shape: "flacon-round", color: "#f4f1ec", accent: "#c9a46a", bg: "#f9f7f3", gender: "unisex", family: "Мускусный", notes: [["амброксан"], ["амброксан"], ["амброксан"]], short: "Гипоаллергенный аромат чистой кожи без лишнего." }),
  product({ name: "Gypsy Water", brand: "Byredo", sub: U, price: 19900, shape: "flacon-round", color: "#e9e3d8", accent: "#1c1917", bg: "#f5f2ec", gender: "unisex", family: "Древесный", notes: [["бергамот", "можжевельник"], ["ладан", "хвоя"], ["ваниль", "сандал"]], short: "Романтика кочевой жизни: хвоя, ладан и ваниль." }),
  product({ name: "Mojave Ghost", brand: "Byredo", sub: U, price: 19900, shape: "flacon-round", color: "#efe1d2", accent: "#1c1917", bg: "#f7f1ea", gender: "unisex", family: "Цветочный древесный", notes: [["амбретта", "саподилла"], ["магнолия", "фиалка"], ["сандал", "амбра"]], short: "Нежный аромат цветка пустыни.", isNew: true, age: 4 }),

  // ---- Ниша
  product({ name: "Baccarat Rouge 540 Eau de Parfum", brand: "Maison Francis Kurkdjian", sub: N, price: 29900, shape: "flacon-square", color: "#c8433d", accent: "#d4af37", bg: "#f8e8e6", gender: "unisex", family: "Восточный цветочный", notes: [["шафран", "жасмин"], ["амбровое дерево"], ["ель", "кедр"]], short: "Самый узнаваемый нишевый аромат: шафран и амбра.", hit: true }),
  product({ name: "Lost Cherry", brand: "Tom Ford", sub: N, price: 34500, shape: "flacon-square", color: "#8e1b2c", accent: "#1c1917", bg: "#f6e4e7", gender: "unisex", family: "Восточный гурманский", notes: [["вишня", "горький миндаль"], ["турецкая роза", "жасмин"], ["тонка", "сандал", "ваниль"]], short: "Сочная вишня, ликёр и миндаль.", hit: true }),
  product({ name: "Tobacco Vanille", brand: "Tom Ford", sub: N, price: 34500, shape: "flacon-square", color: "#8a5a2b", accent: "#1c1917", bg: "#f4ebe1", gender: "unisex", family: "Восточный пряный", notes: [["табачный лист", "специи"], ["ваниль", "какао", "тонка"], ["сухофрукты", "древесина"]], short: "Табак и ваниль — тёплая роскошь английского клуба." }),
  product({ name: "Angels' Share", brand: "Kilian Paris", sub: N, price: 27900, shape: "flacon-square", color: "#a5652a", accent: "#d4af37", bg: "#f6ece1", gender: "unisex", family: "Гурманский", notes: [["коньяк"], ["корица", "тонка", "дуб"], ["пралине", "ваниль", "сандал"]], short: "Коньяк, корица и пралине — аромат-десерт.", hit: true }),
  product({ name: "Fleur Narcotique", brand: "Ex Nihilo", sub: N, price: 25900, shape: "flacon-square", color: "#f0d6dc", accent: "#c9a46a", bg: "#fbf0f2", gender: "unisex", family: "Цветочный", notes: [["бергамот", "личи"], ["пион", "жасмин", "цветок апельсина"], ["мускус", "мох"]], short: "Пьянящий цветочный букет с личи." }),
  product({ name: "Side Effect", brand: "Initio", sub: N, price: 22900, shape: "flacon-square", color: "#5b2130", accent: "#c9a46a", bg: "#f2e6e8", gender: "unisex", family: "Восточный", notes: [["ром"], ["табак", "корица"], ["ваниль"]], short: "Ром, табак и ваниль — опьяняющий шлейф." }),
  product({ name: "Roses Musk", brand: "Montale", sub: N, price: 8900, shape: "flacon-round", color: "#efb8c4", accent: "#9aa0a6", bg: "#fbedf0", gender: "women", family: "Цветочный", notes: [["роза"], ["жасмин"], ["мускус", "амбра"]], short: "Роза и белый мускус — классика Montale." }),
  product({ name: "Oud Wood", brand: "Tom Ford", sub: N, price: 31900, shape: "flacon-square", color: "#4b3a2c", accent: "#1c1917", bg: "#efe9e3", gender: "unisex", family: "Древесный", notes: [["уд", "кардамон"], ["сандал", "ветивер"], ["тонка", "амбра"]], short: "Редкий уд в элегантном, сдержанном звучании.", isNew: true, age: 8 }),

  // ---- Миниатюры и дом
  product({ name: "Набор миниатюр «Бестселлеры ниши» 5×2 мл", brand: "Maison Francis Kurkdjian", sub: "parfyumeriya--miniatyury", price: 3900, label: "5 × 2 мл", shape: "flacon-tall", color: "#d9a3a0", accent: "#d4af37", bg: "#f8ecec", gender: "unisex", short: "Попробуйте пять самых популярных ароматов перед покупкой большого флакона.", hit: true, isNew: true, age: 2 }),
  product({ name: "Отливант Baccarat Rouge 540, 10 мл", brand: "Maison Francis Kurkdjian", sub: "parfyumeriya--miniatyury", price: 4200, label: "10 мл", shape: "flacon-tall", color: "#c8433d", accent: "#d4af37", bg: "#f8e8e6", gender: "unisex", short: "Удобный дорожный формат культового аромата." }),
  product({ name: "Свеча Baies", brand: "Diptyque", sub: "parfyumeriya--dlya-doma", price: 7900, label: "190 г", shape: "jar", color: "#23201d", accent: "#f2efe9", bg: "#efece7", short: "Чёрная смородина и болгарская роза — самая любимая свеча Diptyque.", hit: true }),
  product({ name: "Диффузор The Ritual of Sakura", brand: "Rituals", sub: "parfyumeriya--dlya-doma", price: 3900, label: "250 мл", shape: "flacon-tall", color: "#f2c5cf", accent: "#f5f0ea", bg: "#fbf0f2", short: "Аромат цветущей сакуры и рисового молочка для дома." }),

  // ---- Уход за лицом
  product({ name: "Toleriane Caring Wash", brand: "La Roche-Posay", sub: "uhod-za-licom--ochishchenie", price: 1690, label: "400 мл", shape: "pump", color: "#f4f6f8", accent: "#2b6cb0", bg: "#edf2f7", short: "Мягкий гель для умывания чувствительной кожи.", skin: ["чувствительная", "сухая"], hit: true }),
  product({ name: "Effaclar Гель очищающий", brand: "La Roche-Posay", sub: "uhod-za-licom--ochishchenie", price: 1490, label: "200 мл", shape: "tube", color: "#f4f6f8", accent: "#2b6cb0", bg: "#edf2f7", short: "Очищающий гель для жирной и проблемной кожи.", skin: ["жирная", "комбинированная"] }),
  product({ name: "Beauty Elixir", brand: "Caudalie", sub: "uhod-za-licom--tonery", price: 3900, label: "100 мл", shape: "flacon-tall", color: "#f3e7c9", accent: "#b38b4b", bg: "#f8f2e3", short: "Знаменитый эликсир красоты — сияние кожи за секунды.", isNew: true, age: 5 }),
  product({ name: "Advanced Night Repair", brand: "Estée Lauder", sub: "uhod-za-licom--syvorotki", price: 9900, oldPrice: 11900, label: "50 мл", shape: "dropper", color: "#5b3a1e", accent: "#c9a46a", bg: "#f4ece2", short: "Легендарная ночная сыворотка для восстановления кожи.", skin: ["все типы"], hit: true }),
  product({ name: "Génifique Сыворотка", brand: "Lancôme", sub: "uhod-za-licom--syvorotki", price: 8700, label: "50 мл", shape: "dropper", color: "#1c1917", accent: "#d4af37", bg: "#efe9e5", short: "Сыворотка-активатор молодости с пробиотиками.", skin: ["все типы"] }),
  product({ name: "Hyalu B5 Сыворотка", brand: "La Roche-Posay", sub: "uhod-za-licom--syvorotki", price: 3500, label: "30 мл", shape: "dropper", color: "#eef3f9", accent: "#2b6cb0", bg: "#edf2f7", short: "Гиалуроновая кислота и витамин B5 против морщин.", skin: ["сухая", "чувствительная"] }),
  product({ name: "Double Serum", brand: "Clarins", sub: "uhod-za-licom--syvorotki", price: 9400, label: "50 мл", shape: "dropper", color: "#e6c28b", accent: "#b4232b", bg: "#f8f0e2", short: "Двухфазная сыворотка с 21 растительным экстрактом." }),
  product({ name: "Cicapair Крем", brand: "Erborian", sub: "uhod-za-licom--kremy", price: 3700, label: "50 мл", shape: "jar", color: "#bcd6b0", accent: "#2f3b2b", bg: "#eef3ea", short: "Успокаивающий крем с центеллой, выравнивает тон.", skin: ["чувствительная"] }),
  product({ name: "Sisleÿa L'Intégral Anti-Âge", brand: "Sisley", sub: "uhod-za-licom--kremy", price: 39900, label: "50 мл", shape: "jar", color: "#f4efe6", accent: "#c9a46a", bg: "#f7f3ec", short: "Антивозрастной крем класса люкс.", isNew: true, age: 10 }),
  product({ name: "Ultimune Крем для лица", brand: "Shiseido", sub: "uhod-za-licom--kremy", price: 7400, label: "50 мл", shape: "jar", color: "#b4232b", accent: "#f2f2f2", bg: "#f7e6e7", short: "Укрепляет защитные силы кожи." }),
  product({ name: "Маска Vinosource-Hydra", brand: "Caudalie", sub: "uhod-za-licom--maski", price: 2900, label: "75 мл", shape: "tube", color: "#c9e0e6", accent: "#2b5d6b", bg: "#eaf3f5", short: "Увлажняющая маска с виноградной водой." }),
  product({ name: "Anthelios UVmune 400 SPF50+", brand: "La Roche-Posay", sub: "uhod-za-licom--spf", price: 2400, label: "50 мл", shape: "tube", color: "#f6a03a", accent: "#ffffff", bg: "#fdf1e2", short: "Флюид с максимальной защитой от солнца.", hit: true }),

  // ---- Макияж
  product({ name: "Luminous Silk Foundation", brand: "Giorgio Armani", sub: "makiyazh--lico", price: 6900, label: "30 мл", shape: "flacon-square", color: "#e3b896", accent: "#1c1917", bg: "#f7ede4", short: "Культовый тональный крем с эффектом шёлка.", hit: true }),
  product({ name: "Румяна Orgasm", brand: "NARS", sub: "makiyazh--lico", price: 3900, label: "4,8 г", shape: "compact", color: "#e89a8a", accent: "#1c1917", bg: "#fbeeea", short: "Персиково-розовые румяна с золотым сиянием." }),
  product({ name: "Хайлайтер Hollywood Flawless Filter", brand: "Charlotte Tilbury", sub: "makiyazh--lico", price: 5200, label: "30 мл", shape: "dropper", color: "#f1c9a3", accent: "#c9a46a", bg: "#fbefe4", short: "Праймер-хайлайтер для эффекта фильтра.", isNew: true, age: 3 }),
  product({ name: "Палетка теней Pillow Talk", brand: "Charlotte Tilbury", sub: "makiyazh--glaza", price: 6200, label: "4 оттенка", shape: "palette", color: "#d89c97", accent: "#c9a46a", bg: "#f9ecea", short: "Нюдовые розовые тени для повседневного макияжа." }),
  product({ name: "Тушь They're Real!", brand: "Benefit", sub: "makiyazh--glaza", price: 2900, label: "8,5 г", shape: "tube", color: "#1c1917", accent: "#e65a8c", bg: "#f6e9ee", short: "Удлинение и объём ресниц за один взмах." }),
  product({ name: "Помада Matte Revolution Pillow Talk", brand: "Charlotte Tilbury", sub: "makiyazh--guby", price: 3900, label: "3,5 г", shape: "lipstick", color: "#c07a72", accent: "#c9a46a", bg: "#f8ebe9", short: "Самый популярный нюдово-розовый оттенок в мире.", hit: true }),
  product({ name: "Rouge Pur Couture", brand: "Yves Saint Laurent", sub: "makiyazh--guby", price: 4200, label: "3,8 г", shape: "lipstick", color: "#b11f2d", accent: "#d4af37", bg: "#f8e5e7", short: "Насыщенный цвет и атласный финиш." }),
  product({ name: "Rouge Dior", brand: "Dior", sub: "makiyazh--guby", price: 4400, label: "3,5 г", shape: "lipstick", color: "#a3182a", accent: "#c0c0c0", bg: "#f7e4e6", short: "Легендарная помада Dior с уходом за губами." }),
  product({ name: "Гель для бровей Gimme Brow+", brand: "Benefit", sub: "makiyazh--brovi", price: 2700, label: "3 г", shape: "tube", color: "#6b4a34", accent: "#e65a8c", bg: "#f5ece6", short: "Объёмный гель с микроволокнами для бровей." }),

  // ---- Волосы
  product({ name: "Elixir Ultime Шампунь", brand: "Kérastase", sub: "volosy--shampuni", price: 3600, label: "250 мл", shape: "pump", color: "#d4a74a", accent: "#1c1917", bg: "#f8efdc", short: "Шампунь-ванна с маслами для сияния волос.", hit: true }),
  product({ name: "No.4 Bond Maintenance Shampoo", brand: "Olaplex", sub: "volosy--shampuni", price: 3200, label: "250 мл", shape: "pump", color: "#f2f2f2", accent: "#1c1917", bg: "#f3f3f1", short: "Восстанавливающий шампунь для всех типов волос." }),
  product({ name: "No.3 Hair Perfector", brand: "Olaplex", sub: "volosy--maski-i-kondicionery", price: 3200, label: "100 мл", shape: "tube", color: "#f2f2f2", accent: "#1c1917", bg: "#f3f3f1", short: "Средство для восстановления повреждённых волос.", hit: true }),
  product({ name: "Масло Moroccanoil Treatment", brand: "Moroccanoil", sub: "volosy--masla", price: 3900, label: "100 мл", shape: "dropper", color: "#8a5a2b", accent: "#2bb3b1", bg: "#f4ebe1", short: "Культовое аргановое масло для всех типов волос." }),
  product({ name: "Elixir Ultime L'Huile Originale", brand: "Kérastase", sub: "volosy--masla", price: 4600, label: "100 мл", shape: "dropper", color: "#d4a74a", accent: "#1c1917", bg: "#f8efdc", short: "Многофункциональное масло для блеска и питания." }),
  product({ name: "Спрей для объёма Volumizing Mist", brand: "Moroccanoil", sub: "volosy--stayling", price: 2700, label: "160 мл", shape: "pump", color: "#2bb3b1", accent: "#8a5a2b", bg: "#e7f5f5", short: "Лёгкий спрей для объёма от корней." }),

  // ---- Тело
  product({ name: "Крем для тела Brazilian Bum Bum", brand: "Sol de Janeiro", sub: "telo--kremy-dlya-tela", price: 4900, oldPrice: 5900, label: "240 мл", shape: "jar", color: "#f2c94c", accent: "#e85d75", bg: "#fdf5dc", short: "Знаменитый крем с ароматом фисташки и солёной карамели.", hit: true }),
  product({ name: "Дымка для тела Cheirosa 62", brand: "Sol de Janeiro", sub: "telo--dymki", price: 3400, label: "240 мл", shape: "flacon-tall", color: "#f2c94c", accent: "#e85d75", bg: "#fdf5dc", short: "Тёплый аромат фисташки и ванили для тела и волос.", isNew: true, age: 2 }),
  product({ name: "Пена для душа The Ritual of Sakura", brand: "Rituals", sub: "telo--dush", price: 1290, label: "200 мл", shape: "tube", color: "#f2c5cf", accent: "#f5f0ea", bg: "#fbf0f2", short: "Нежная пена с ароматом сакуры." }),
  product({ name: "Скраб для тела Rituals of Ayurveda", brand: "Rituals", sub: "telo--skraby", price: 1990, label: "300 г", shape: "jar", color: "#e5874a", accent: "#7a3b1d", bg: "#fbeee4", short: "Сахарный скраб с индийской розой и миндалём." }),
  product({ name: "Масло для тела Huile Tonic", brand: "Clarins", sub: "telo--kremy-dlya-tela", price: 5600, label: "100 мл", shape: "dropper", color: "#c9a46a", accent: "#b4232b", bg: "#f8f0e2", short: "Тонизирующее масло для упругости кожи." }),

  // ---- Ногти
  product({ name: "Гель-лак GelColor Big Apple Red", brand: "OPI", sub: "nogti--gel-laki", price: 1490, label: "15 мл", shape: "flacon-round", color: "#c8102e", accent: "#1c1917", bg: "#fbeceb", short: "Классический красный гель-лак: стойкость до 3 недель под лампой.", hit: true }),
  product({ name: "Гель-лак GelColor Funny Bunny", brand: "OPI", sub: "nogti--gel-laki", price: 1490, label: "15 мл", shape: "flacon-round", color: "#f4f1ea", accent: "#1c1917", bg: "#f7f5f0", short: "Молочно-белый оттенок для нежного маникюра и френча.", isNew: true, age: 4 }),
  product({ name: "Гель-лак GelColor Malaga Wine", brand: "OPI", sub: "nogti--gel-laki", price: 1490, label: "15 мл", shape: "flacon-round", color: "#7b1e2f", accent: "#1c1917", bg: "#f6e8ea", short: "Глубокий винный оттенок — хит осени и зимы." }),
  product({ name: "Гель-лак GelColor Bubble Bath", brand: "OPI", sub: "nogti--gel-laki", price: 1490, label: "15 мл", shape: "flacon-round", color: "#f2d4d0", accent: "#1c1917", bg: "#fbf0ee", short: "Самый популярный нюдовый розовый у мастеров маникюра.", hit: true }),
  product({ name: "Гель-лак Shellac Berry Boudoir", brand: "CND", sub: "nogti--gel-laki", price: 1790, label: "7,3 мл", shape: "flacon-round", color: "#6d1a36", accent: "#1c1917", bg: "#f5e7ec", short: "Ягодный оттенок Shellac: снимается без опила за 10 минут." }),
  product({ name: "База Shellac Base Coat", brand: "CND", sub: "nogti--baza-i-top", price: 1890, label: "7,3 мл", shape: "flacon-round", color: "#f0ece4", accent: "#1c1917", bg: "#f7f5f0", short: "Базовое покрытие системы Shellac — надёжное сцепление и бережное снятие." }),
  product({ name: "Топ Shellac Original Top Coat", brand: "CND", sub: "nogti--baza-i-top", price: 1890, label: "12,5 мл", shape: "flacon-round", color: "#f0ece4", accent: "#1c1917", bg: "#f7f5f0", short: "Финишное покрытие с зеркальным блеском." }),
  product({ name: "Лак для ногтей Big Apple Red", brand: "OPI", sub: "nogti--laki", price: 990, label: "15 мл", shape: "flacon-round", color: "#c8102e", accent: "#1c1917", bg: "#fbeceb", short: "Культовый красный лак OPI Nail Lacquer." }),
  product({ name: "Лак для ногтей Bubble Bath", brand: "OPI", sub: "nogti--laki", price: 990, label: "15 мл", shape: "flacon-round", color: "#f2d4d0", accent: "#1c1917", bg: "#fbf0ee", short: "Прозрачно-розовый оттенок для ухоженных ногтей.", hit: true }),
  product({ name: "Средство для укрепления ногтей Nail Envy Bubble Bath", brand: "OPI", sub: "nogti--uhod-za-nogtyami", price: 2190, label: "15 мл", shape: "flacon-round", color: "#f2d4d0", accent: "#1c1917", bg: "#fbf0ee", short: "Укрепляет тонкие и ломкие ногти, придаёт лёгкий розовый оттенок." }),
  product({ name: "Масло для кутикулы SolarOil", brand: "CND", sub: "nogti--uhod-za-nogtyami", price: 990, label: "7,3 мл", shape: "dropper", color: "#e9c46a", accent: "#1c1917", bg: "#fbf4e2", short: "Масло жожоба и витамин Е: мягкая кутикула и крепкие ногти.", hit: true }),

  // ---- Волосы: шампуни, бальзамы, маски
  product({ name: "Кондиционер No.5 Bond Maintenance", brand: "Olaplex", sub: "volosy--maski-i-kondicionery", price: 3490, label: "250 мл", shape: "pump", color: "#f4f1ea", accent: "#1c1917", bg: "#f7f5f0", short: "Восстанавливающий бальзам-кондиционер для повреждённых волос.", hit: true }),
  product({ name: "Масло для волос No.7 Bonding Oil", brand: "Olaplex", sub: "volosy--masla", price: 3290, label: "30 мл", shape: "dropper", color: "#f4f1ea", accent: "#1c1917", bg: "#f7f5f0", short: "Лёгкое масло для блеска и защиты от горячей укладки." }),
  product({ name: "Увлажняющий шампунь Hydrating Shampoo", brand: "Moroccanoil", sub: "volosy--shampuni", price: 2790, label: "250 мл", shape: "pump", color: "#7fb3d5", accent: "#e07b39", bg: "#eef5fa", short: "Мягкий шампунь с аргановым маслом для сухих волос." }),
  product({ name: "Увлажняющий кондиционер Hydrating Conditioner", brand: "Moroccanoil", sub: "volosy--maski-i-kondicionery", price: 2990, label: "250 мл", shape: "pump", color: "#7fb3d5", accent: "#e07b39", bg: "#eef5fa", short: "Бальзам для мягкости и блеска, легко расчёсывает волосы.", isNew: true, age: 3 }),
  product({ name: "Интенсивная увлажняющая маска Intense Hydrating Mask", brand: "Moroccanoil", sub: "volosy--maski-i-kondicionery", price: 4290, label: "250 мл", shape: "jar", color: "#7fb3d5", accent: "#e07b39", bg: "#eef5fa", short: "Глубокое питание для сухих и плотных волос за 5 минут." }),

  // ---- Наборы
  product({ name: "Набор Coco Mademoiselle: аромат + крем для тела", brand: "Chanel", sub: "nabory--zhenskie-nabory", price: 18900, oldPrice: 21500, label: "Набор", shape: "compact", color: "#f2c9a8", accent: "#1c1917", bg: "#f8ece2", short: "Подарочный набор с ароматом 50 мл и кремом для тела.", hit: true }),
  product({ name: "Набор Sauvage: парфюм + гель для душа", brand: "Dior", sub: "nabory--muzhskie-nabory", price: 13900, oldPrice: 15800, label: "Набор", shape: "compact", color: "#1e2b3c", accent: "#9aa6b4", bg: "#e7ecf2", short: "Мужской подарочный набор Sauvage.", isNew: true, age: 5 }),
  product({ name: "Адвент-календарь Beauty Advent 2026", brand: "Rituals", sub: "nabory--advent", price: 8900, label: "24 сюрприза", shape: "compact", color: "#4b3a63", accent: "#d4af37", bg: "#f1ecf7", short: "24 средства ухода — праздник каждый день декабря.", hit: true, isNew: true, age: 1 }),
];

/** Примеры новых механик (добавлены в версии 3): 3 = 2 на гель-лаки */
export const DEMO_PROMOTIONS = (): Database["promotions"] => [
  {
    id: "gel-3-2",
    slug: "3-2-na-gel-laki",
    title: "3 = 2 на гель-лаки",
    subtitle: "Третий оттенок — в подарок",
    discountPercent: 33,
    scope: "category",
    targetIds: ["nogti--gel-laki"],
    startsAt: daysAgo(1),
    endsAt: daysAhead(21),
    isActive: true,
    color: "#4b3a63",
    kind: "bundle",
    buyQty: 3,
    payQty: 2,
  },
];

export function createSeed(): Database {
  return {
    settings: {
      shopName: "Katy",
      tagline: "Парфюмерия и косметика · только оригинал",
      phone: "+7 (900) 000-00-00",
      email: "hello@katy-shop.ru",
      instagram: "katy.shop",
      telegram: "katy_shop",
      freeDeliveryFrom: 5000,
      deliveryPrice: 390,
      announcement: "Подарок в каждом заказе · Бесплатная доставка от 5 000 ₽ · Только оригинальная продукция",
      giftText: "Пробник аромата на выбор",
    },
    categories: seedCategories,
    brands: seedBrands,
    products: seedProducts,
    promotions: [
      {
        id: "black-friday",
        slug: "black-friday",
        title: "Чёрная пятница",
        subtitle: "−20% на всю нишевую парфюмерию",
        discountPercent: 20,
        scope: "category",
        targetIds: ["parfyumeriya--nishevaya"],
        startsAt: daysAgo(3),
        endsAt: daysAhead(10),
        isActive: true,
        color: "#1c1917",
      },
      {
        id: "care-week",
        slug: "nedelya-uhoda",
        title: "Неделя ухода",
        subtitle: "−15% на La Roche-Posay",
        discountPercent: 15,
        scope: "brand",
        targetIds: ["la-roche-posay"],
        startsAt: daysAgo(1),
        endsAt: daysAhead(20),
        isActive: true,
        color: "#2b6cb0",
      },
      ...DEMO_PROMOTIONS(),
    ],
    promoCodes: [
      { code: "KATY10", discountPercent: 10, minTotal: 3000, isActive: true },
      { code: "WELCOME", discountPercent: 5, minTotal: 0, isActive: true },
    ],
    banners: [
      { id: "b1", title: "Чёрная пятница", subtitle: "−20% на нишевую парфюмерию: Kurkdjian, Tom Ford, Kilian и другие", buttonText: "Выбрать аромат", link: "/sale", theme: "noir", artShape: "flacon-square", order: 1, isActive: true },
      { id: "b2", title: "Подберём ваш аромат", subtitle: "Ответьте на 4 вопроса — и мы предложим ароматы, которые вам подойдут", buttonText: "Пройти подбор", link: "/podbor", theme: "rose", artShape: "flacon-round", order: 2, isActive: true },
      { id: "b3", title: "Подарки к Новому году", subtitle: "Наборы, адвент-календари и подарочные карты", buttonText: "Смотреть подарки", link: "/catalog/nabory", theme: "gold", artShape: "compact", order: 3, isActive: true },
    ],
    orders: [],
  };
}
