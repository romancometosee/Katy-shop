import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { queryStems, searchProducts } from "@/lib/catalog";

// Товары по списку id (для избранного) или по фильтрам (для подбора аромата)
export async function GET(req: Request) {
  const url = new URL(req.url);
  const db = await getDb();
  const ids = url.searchParams.get("ids");
  if (ids !== null) {
    return NextResponse.json(searchProducts(db, { ids: ids.split(",").filter(Boolean) }));
  }
  // карточки для консультанта: товары по их адресам (slug)
  const slugs = url.searchParams.get("slugs");
  if (slugs !== null) {
    const want = slugs.split(",").filter(Boolean);
    const ids = want.map((s) => db.products.find((p) => p.slug === s)?.id).filter(Boolean) as string[];
    const found = searchProducts(db, { ids });
    return NextResponse.json(want.map((s) => found.find((v) => v.slug === s)).filter(Boolean));
  }
  // запасной поиск по отдельным словам (когда консультант выключен)
  const words = url.searchParams.get("words");
  if (words !== null) {
    const ws = queryStems(words);
    const all = searchProducts(db, {});
    const scored = all.map((v) => {
      const t = `${v.brandName} ${v.name} ${v.shortDescription} ${v.family ?? ""}`.toLowerCase().replace(/ё/g, "е");
      return { v, s: ws.filter((w) => t.includes(w)).length };
    });
    return NextResponse.json(scored.filter((x) => x.s > 0).sort((a, b) => b.s - a.s).slice(0, Math.min(12, Number(url.searchParams.get("limit") ?? 4))).map((x) => x.v));
  }
  const list = (k: string) => url.searchParams.get(k)?.split(",").filter(Boolean);
  const products = searchProducts(db, {
    category: url.searchParams.get("category") ?? undefined,
    genders: list("gender"),
    families: list("family"),
    priceMax: url.searchParams.get("max") ? Number(url.searchParams.get("max")) : undefined,
  });
  return NextResponse.json(products.slice(0, Number(url.searchParams.get("limit") ?? 24)));
}
