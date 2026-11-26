// Хранилище данных магазина. Сами данные лежат либо в файле data/db.json (обычный сервер),
// либо в Cloudflare KV — см. storage.ts. При первом запуске загружается демо-каталог.
import { DEMO_PROMOTIONS, createSeed as baseSeed } from "./seed";
import { autoAdvent, hasAdvent } from "./advent";
import { isKv, readDb, writeDb } from "./storage";
import type { Database } from "./types";
import { productImages } from "./productImages";

/** Если у товара нет своего фото — подставляем официальное фото бренда */
function withImages(db: Database): Database {
  for (const p of db.products) {
    if (!p.images?.length && productImages[p.id]) p.images = [productImages[p.id]];
  }
  return db;
}

let queue: Promise<unknown> = Promise.resolve();

export const SEED_VERSION = 6;

/** Пример страниц брендов: история, год основания и коллекции у части демо-каталога (заполняем только пустое) */
const BRAND_STORIES: Record<string, { founded: string; story: string }> = {
  chanel: { founded: "1910", story: "Дом Chanel начался в 1910 году с маленького ателье шляпок Габриэль Шанель в Париже.\n\nВ 1921 году вышел Chanel N°5 — аромат, который изменил парфюмерию: впервые альдегиды сделали цветы абстрактными и «невозможными». С тех пор ароматы Chanel создаются собственными парфюмерами дома." },
  dior: { founded: "1946", story: "Кристиан Диор открыл свой дом моды в Париже в 1946 году, а уже через год вместе с первой коллекцией «New Look» представил аромат Miss Dior.\n\nСегодня Parfums Christian Dior — это классика вроде J’adore и Sauvage и коллекции, созданные парфюмерами дома." },
  "maison-francis-kurkdjian": { founded: "2009", story: "Парфюмер Франсис Куркджан создал свой дом в Париже в 2009 году вместе с Марком Шайя.\n\nСамый известный аромат дома — Baccarat Rouge 540: шафран, амбра и кедр, узнаваемые с первого вдоха." },
  "kilian-paris": { founded: "2007", story: "Килиан Эннесси, наследник семьи коньячного дома Hennessy, основал свой бренд в 2007 году.\n\nФлаконы Kilian задуманы как предметы, которые не выбрасывают: их можно наполнять снова." },
  "tom-ford": { founded: "2006", story: "Tom Ford Beauty появился в 2006 году, а в 2007-м вышла коллекция Private Blend — смелые ароматы, созданные как будто для личной коллекции дизайнера.\n\nСреди самых известных — Tobacco Vanille, Oud Wood и Lost Cherry." },
  guerlain: { founded: "1828", story: "Пьер-Франсуа-Паскаль Герлен открыл парфюмерную лавку в Париже в 1828 году.\n\nShalimar, Mitsouko, L’Heure Bleue — классика, которую до сих пор изучают парфюмеры всего мира." },
};
const DEMO_COLLECTIONS: Record<string, string> = {
  "tom-ford-lost-cherry": "Private Blend", "tom-ford-tobacco-vanille": "Private Blend", "tom-ford-oud-wood": "Private Blend", "tom-ford-ombre-leather": "Signature", "kilian-paris-angels-share": "The Liquors",
  "kerastase-elixir-ultime-shampun": "Elixir Ultime", "kerastase-elixir-ultime-l-huile-originale": "Elixir Ultime",
  "opi-gel-lak-gelcolor-big-apple-red": "GelColor", "opi-gel-lak-gelcolor-funny-bunny": "GelColor", "opi-gel-lak-gelcolor-malaga-wine": "GelColor", "opi-gel-lak-gelcolor-bubble-bath": "GelColor",
  "opi-lak-dlya-nogtey-big-apple-red": "Nail Lacquer", "opi-lak-dlya-nogtey-bubble-bath": "Nail Lacquer", "opi-sredstvo-dlya-ukrepleniya-nogtey-nail-envy-bubble-bath": "Nail Envy",
};
function addBrandPages(db: Database) {
  for (const b of db.brands) { const s = BRAND_STORIES[b.id]; if (s && !b.story) Object.assign(b, s); }
  for (const p of db.products) if (!p.collection && DEMO_COLLECTIONS[p.id]) p.collection = DEMO_COLLECTIONS[p.id];
}

/** Пример распива: у нишевых ароматов демо-каталога появляется «Распив 10 мл» (цена ≈ 100-мл флакон / 10 + 30% за розлив) */
function addDemoDecants(db: Database) {
  for (const p of db.products) {
    if (p.subcategoryId !== "parfyumeriya--nishevaya" || p.variants.some((v) => /распив/i.test(v.label))) continue;
    const big = p.variants.find((v) => v.label === "100 мл");
    if (!big) continue;
    p.variants.unshift({ id: `${p.id}-raspiv-10`, label: "Распив 10 мл", price: Math.round((big.price / 10) * 1.3 / 10) * 10, stock: 10 });
  }
}

/** Демо-данные + заполненный адвент-календарь */
function createSeed() {
  const s = baseSeed();
  addDemoDecants(s);
  addBrandPages(s);
  s.promotions.push(...autoAdvent(s));
  return s;
}

/** Добавляет в сохранённые данные новые разделы, бренды и товары из обновлений сайта (ничего не удаляет и не меняет) */
function upgrade(db: Database): boolean {
  if ((db.seedVersion ?? 1) >= SEED_VERSION) return false;
  const seed = createSeed();
  const add = <T extends { id: string }>(have: T[], from: T[]) => {
    const ids = new Set(have.map((x) => x.id));
    from.forEach((x) => { if (!ids.has(x.id)) have.push(x); });
  };
  // до версии 3: новые разделы, бренды и товары демо-каталога (позже не добавляем — вдруг их удалили в админке)
  if ((db.seedVersion ?? 1) < 3) {
    add(db.categories, seed.categories);
    add(db.brands, seed.brands);
    add(db.products, seed.products);
    // порядок разделов в меню — как в новой версии (новый раздел «Ногти» встаёт перед «Подарочными наборами»)
    for (const c of db.categories) {
      const s = seed.categories.find((x) => x.id === c.id);
      if (s && !c.parentId) c.order = s.order;
    }
  }
  // версия 3: пример акции «3 = 2» и заполненный адвент-календарь
  if ((db.seedVersion ?? 1) < 3) {
    add(db.promotions, DEMO_PROMOTIONS());
    if (!hasAdvent(db)) db.promotions.push(...autoAdvent(db));
  }
  // версия 4: убрали из описания парфюмерии непроверенную цифру «Более 5000 ароматов» (если её не меняли в админке)
  if ((db.seedVersion ?? 1) < 4) {
    const c = db.categories.find((x) => x.id === "parfyumeriya");
    if (c?.description.startsWith("Более 5000")) c.description = "Оригинальные ароматы: от культовой классики до редкой ниши.";
  }
  // версия 5: пример распива у нишевых ароматов
  if ((db.seedVersion ?? 1) < 5) addDemoDecants(db);
  // версия 6: истории брендов и коллекции (страница бренда)
  if ((db.seedVersion ?? 1) < 6) addBrandPages(db);
  db.seedVersion = SEED_VERSION;
  return true;
}

async function load(): Promise<Database> {
  const db = await readDb();
  if (db) {
    if (upgrade(db)) await writeDb(db);
    return withImages(db);
  }
  const seed = withImages({ ...createSeed(), seedVersion: SEED_VERSION });
  await writeDb(seed);
  return seed;
}

export async function getDb(): Promise<Database> {
  // На Cloudflare несколько копий сайта работают параллельно — читаем свежие данные каждый раз
  // Файл тоже читаем каждый раз: у Next.js несколько копий модулей в одном процессе,
  // и общий кэш в памяти приводил к тому, что одна копия затирала изменения другой.
  return load();
}

/** Изменить данные: изменения выполняются по очереди и сразу сохраняются */
export async function updateDb<T>(fn: (db: Database) => T | Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    const db = await getDb();
    const result = await fn(db);
    await writeDb(db);
    return result;
  });
  queue = run.catch(() => undefined);
  return run;
}

export async function resetDb() {
  const old = await readDb();
  // пароль админки и секретный ключ при сбросе демо-данных сохраняем
  const seed = withImages({ ...createSeed(), seedVersion: SEED_VERSION, authKey: old?.authKey, adminPassword: old?.adminPassword });
  await writeDb(seed);
}
