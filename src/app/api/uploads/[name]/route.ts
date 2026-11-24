import { getFile } from "@/lib/storage";
import { contentTypeFor } from "@/lib/uploads";

export async function GET(_: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const safe = name.replace(/[^a-zA-Z0-9.-]/g, "");
  const data = await getFile(safe);
  if (!data) return new Response("Not found", { status: 404 });
  return new Response(data, { headers: { "Content-Type": contentTypeFor(safe), "Cache-Control": "public, max-age=31536000, immutable" } });
}
