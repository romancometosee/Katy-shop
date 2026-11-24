// Хранилище данных магазина.
// Сейчас — JSON-файл data/db.json (создаётся из демо-каталога при первом запуске).
// Для боевого сайта этот модуль меняется на базу данных (Postgres) без изменений в страницах.
import { promises as fs } from "fs";
import path from "path";
import { createSeed } from "./seed";
import type { Database } from "./types";

const DATA_DIR = process.env.KATY_DATA_DIR || path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "db.json");

let cache: Database | null = null;
let loading: Promise<Database> | null = null;
let queue: Promise<unknown> = Promise.resolve();

export async function getDb(): Promise<Database> {
  if (cache) return cache;
  loading ??= (async () => {
    try {
      cache = JSON.parse(await fs.readFile(FILE, "utf8")) as Database;
    } catch {
      cache = createSeed();
      await persist(cache);
    }
    return cache;
  })();
  return loading;
}

async function persist(db: Database) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmp = `${FILE}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(db, null, 2), "utf8");
  await fs.rename(tmp, FILE);
}

/** Изменить данные: изменения выполняются по очереди и сразу сохраняются */
export async function updateDb<T>(fn: (db: Database) => T | Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    const db = await getDb();
    const result = await fn(db);
    await persist(db);
    return result;
  });
  queue = run.catch(() => undefined);
  return run;
}

export async function resetDb() {
  cache = createSeed();
  await persist(cache);
}
