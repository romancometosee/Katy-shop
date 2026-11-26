import Link from "next/link";
import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import { PageHead } from "@/components/admin/ui";
import { getDb } from "@/lib/db";

export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await getDb();
  const product = id === "new" ? undefined : db.products.find((p) => p.id === id);
  if (id !== "new" && !product) notFound();
  const brands = [...db.brands].sort((a, b) => a.name.localeCompare(b.name));
  const categories = [...db.categories].sort((a, b) => a.order - b.order);
  const collections = [...new Set(db.products.filter((p) => p.collection && (!product || p.brandId === product.brandId)).map((p) => p.collection!))].sort();
  return (
    <div>
      <Link href="/admin/products" className="text-sm text-ink-soft hover:underline">← Все товары</Link>
      <PageHead title={product ? product.name : "Новый товар"} desc={product ? undefined : "Заполните название, бренд, раздел и цену — остальное можно добавить позже."} />
      {product && <Link href={`/product/${product.slug}`} target="_blank" className="-mt-6 mb-6 inline-block text-sm underline">Открыть на сайте ↗</Link>}
      <ProductForm product={product} brands={brands} categories={categories} collections={collections} />
    </div>
  );
}
