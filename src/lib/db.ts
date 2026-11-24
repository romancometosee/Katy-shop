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

let cache: Database | null = null;
let loading: Promise<Database> | null = null;
let queue: Promise<unknown> = Promise.resolve();

export const SEED_VERSION = 3;

/** Демо-данные + заполненный адвент-календарь */
function createSeed() {
  const s = baseSeed();
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
  add(db.categories, seed.categories);
  add(db.brands, seed.brands);
  add(db.products, seed.products);
  // порядок разделов в меню — как в новой версии (новый раздел «Ногти» встаёт перед «Подарочными наборами»)
  for (const c of db.categories) {
    const s = seed.categories.find((x) => x.id === c.id);
    if (s && !c.parentId) c.order = s.order;
  }
  // версия 3: пример акции «3 = 2» и заполненный адвент-календарь
  if ((db.seedVersion ?? 1) < 3) {
    add(db.promotions, DEMO_PROMOTIONS());
    if (!hasAdvent(db)) db.promotions.push(...autoAdvent(db));
  }
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
  if (isKv()) return load();
  if (cache) return cache;
  loading ??= load().then((db) => (cache = db));
  return loading;
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
  const seed = withImages({ ...createSeed(), seedVersion: SEED_VERSION });
  if (!isKv()) cache = seed;
  await writeDb(seed);
}
