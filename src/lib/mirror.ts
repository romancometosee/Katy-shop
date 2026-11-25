// Перенос фото товаров к нам: фото с сайтов брендов скачиваются и хранятся в нашем хранилище,
// чтобы не зависеть от чужих сайтов (в России часть из них может не открываться).
import { putFile } from "./storage";

const EXT: Record<string, string> = { "image/jpeg": "jpg", "image/jpg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif", "image/gif": "gif" };

export const isExternal = (u: string) => /^https?:\/\//i.test(u);

async function hash(s: string) {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 24);
}

/** Скачивает фото и сохраняет у нас. Возвращает наш адрес или null, если сайт бренда не отдал фото */
export async function mirrorImage(url: string): Promise<string | null> {
  if (!isExternal(url)) return url;
  try {
    const r = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36", Accept: "image/avif,image/webp,image/png,image/jpeg,image/*;q=0.8" },
      redirect: "follow",
      signal: AbortSignal.timeout(15000),
    });
    if (!r.ok) return null;
    const ct = (r.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
    const fromUrl = url.split("?")[0].split(".").pop()?.toLowerCase() ?? "";
    const ext = EXT[ct] ?? (Object.values(EXT).includes(fromUrl) ? fromUrl : "");
    if (!ext) return null;
    const buf = await r.arrayBuffer();
    if (buf.byteLength < 500 || buf.byteLength > 8_000_000) return null;
    const name = `m-${await hash(url)}.${ext}`;
    await putFile(name, buf, ct || `image/${ext}`);
    return `/api/uploads/${name}`;
  } catch {
    return null;
  }
}
