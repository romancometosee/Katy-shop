// Хранилище данных магазина. Сами данные лежат либо в файле data/db.json (обычный сервер),
// либо в Cloudflare KV — см. storage.ts. При первом запуске загружается демо-каталог.
import { createSeed } from "./seed";
import { isKv, readDb, writeDb } from "./storage";
import type { Database } from "./types";

let cache: Database | null = null;
let loading: Promise<Database> | null = null;
let queue: Promise<unknown> = Promise.resolve();

async function load(): Promise<Database> {
  const db = await readDb();
  if (db) return db;
  const seed = createSeed();
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
  const seed = createSeed();
  if (!isKv()) cache = seed;
  await writeDb(seed);
}
