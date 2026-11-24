import { putFile } from "./storage";

const types: Record<string, string> = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", gif: "image/gif", avif: "image/avif" };
export const contentTypeFor = (name: string) => types[name.split(".").pop()?.toLowerCase() ?? ""] ?? "application/octet-stream";

/** Сохраняет загруженные фото и возвращает их адреса */
export async function saveUploads(files: File[]): Promise<string[]> {
  const urls: string[] = [];
  for (const f of files) {
    if (!f || typeof f === "string" || f.size === 0) continue;
    const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
    if (!types[ext]) continue;
    const name = `${crypto.randomUUID()}.${ext}`;
    await putFile(name, await f.arrayBuffer(), types[ext]);
    urls.push(`/api/uploads/${name}`);
  }
  return urls;
}
