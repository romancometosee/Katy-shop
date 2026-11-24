import { promises as fs } from "fs";
import path from "path";
import { UPLOAD_DIR } from "@/lib/uploads";

const types: Record<string, string> = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".gif": "image/gif", ".avif": "image/avif" };

export async function GET(_: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const safe = path.basename(name);
  try {
    const buf = await fs.readFile(path.join(UPLOAD_DIR, safe));
    return new Response(buf, { headers: { "Content-Type": types[path.extname(safe).toLowerCase()] ?? "application/octet-stream", "Cache-Control": "public, max-age=31536000, immutable" } });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
