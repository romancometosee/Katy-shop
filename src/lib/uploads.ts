import { promises as fs } from "fs";
import path from "path";

export const UPLOAD_DIR = path.join(process.env.KATY_DATA_DIR || path.join(process.cwd(), "data"), "uploads");
const allowed = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"];

/** Сохраняет загруженные фото и возвращает их адреса */
export async function saveUploads(files: File[]): Promise<string[]> {
  const urls: string[] = [];
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  for (const f of files) {
    if (!f || typeof f === "string" || f.size === 0) continue;
    const ext = path.extname(f.name).toLowerCase();
    if (!allowed.includes(ext)) continue;
    const name = `${crypto.randomUUID()}${ext}`;
    await fs.writeFile(path.join(UPLOAD_DIR, name), Buffer.from(await f.arrayBuffer()));
    urls.push(`/api/uploads/${name}`);
  }
  return urls;
}
