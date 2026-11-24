"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "./CartProvider";
import ProductCard from "./ProductCard";
import type { ProductView } from "@/lib/catalog";

export default function FavoritesList() {
  const { favorites } = useCart();
  const [items, setItems] = useState<ProductView[] | null>(null);
  useEffect(() => {
    fetch(`/api/products?ids=${favorites.join(",")}`).then((r) => r.json()).then(setItems);
  }, [favorites]);
  if (items === null) return <p className="text-ink-soft">Загружаем…</p>;
  if (!items.length)
    return (
      <div className="card p-12 text-center">
        <p className="h-display text-3xl">Здесь будут ваши любимые товары</p>
        <p className="mt-2 text-ink-soft">Нажимайте на сердечко у товара, чтобы сохранить его.</p>
        <Link href="/catalog/parfyumeriya" className="btn-dark mt-6">В каталог</Link>
      </div>
    );
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
      {items.map((p) => <ProductCard key={p.id} p={p} />)}
    </div>
  );
}
