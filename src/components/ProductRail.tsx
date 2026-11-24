import ProductCard from "./ProductCard";
import type { ProductView } from "@/lib/catalog";

/** Горизонтальная лента товаров (на телефоне листается пальцем) */
export default function ProductRail({ products }: { products: ProductView[] }) {
  return (
    <div className="no-scrollbar -mx-4 flex snap-x gap-5 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-4">
      {products.map((p) => (
        <div key={p.id} className="w-[62vw] shrink-0 snap-start sm:w-auto">
          <ProductCard p={p} />
        </div>
      ))}
    </div>
  );
}
