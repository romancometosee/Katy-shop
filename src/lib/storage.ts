// Где физически лежат данные магазина.
// «file» — обычный сервер (папка data/), «kv» — Cloudflare (хранилище KV).
import type { Database } from "./types";

type KV = {
  get(key: string, type: "text"): Promise<string | null>;
  get(key: string, type: "arrayBuffer"): Promise<ArrayBuffer | null>;
  getWithMetadata<M>(key: string, type: "arrayBuffer"): Promise<{ value: ArrayBuffer | null; metadata: M | null }>;
  put(key: string, value: string | ArrayBuffer, opts?: { metadata?: unknown }): Promise<void>;
};

export const isKv = () => process.env.KATY_STORAGE === "kv";

async function kv(): Promise<KV> {
  const { getCloudflareContext } = await import("@opennextjs/cloudflare");
  const { env } = await getCloudflareContext({ async: true });
  return (env as unknown as { KATY_KV: KV }).KATY_KV;
}

const dataDir = async () => {
  const path = await import("path");
  return process.env.KATY_DATA_DIR || path.join(process.cwd(), "data");
};

export async function readDb(): Promise<Database | null> {
  if (isKv()) {
    const raw = await (await kv()).get("db", "text");
    return raw ? (JSON.parse(raw) as Database) : null;
  }
  const fs = await import("fs/promises");
  const path = await import("path");
  try {
    return JSON.parse(await fs.readFile(path.join(await dataDir(), "db.json"), "utf8")) as Database;
  } catch {
    return null;
  }
}

export async function writeDb(db: Database) {
  const json = JSON.stringify(db);
  if (isKv()) return (await kv()).put("db", json);
  const fs = await import("fs/promises");
  const path = await import("path");
  const dir = await dataDir();
  await fs.mkdir(dir, { recursive: true });
  const file = path.join(dir, "db.json");
  const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(db, null, 2), "utf8");
  await fs.rename(tmp, file);
}

export async function putFile(name: string, data: ArrayBuffer, contentType: string) {
  if (isKv()) return (await kv()).put(`file:${name}`, data, { metadata: { contentType } });
  const fs = await import("fs/promises");
  const path = await import("path");
  const dir = path.join(await dataDir(), "uploads");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, name), Buffer.from(data));
}

export async function getFile(name: string): Promise<ArrayBuffer | null> {
  if (isKv()) return (await (await kv()).getWithMetadata(`file:${name}`, "arrayBuffer")).value;
  const fs = await import("fs/promises");
  const path = await import("path");
  try {
    const buf = await fs.readFile(path.join(await dataDir(), "uploads", name));
    return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
  } catch {
    return null;
  }
}
