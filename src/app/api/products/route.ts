import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { searchProducts } from "@/lib/catalog";

// Товары по списку id (для избранного) или по фильтрам (для подбора аромата)
export async function GET(req: Request) {
  const url = new URL(req.url);
  const db = await getDb();
  const ids = url.searchParams.get("ids");
  if (ids !== null) {
    return NextResponse.json(searchProducts(db, { ids: ids.split(",").filter(Boolean) }));
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
