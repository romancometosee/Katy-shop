import ProductArt from "./ProductArt";
import type { ProductArt as Art } from "@/lib/types";

export default function ProductImage({
  images,
  art,
  label,
  className = "",
}: {
  images: string[];
  art: Art;
  label?: string;
  className?: string;
}) {
  if (images[0]) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <div className="h-full w-full bg-white">
        {/* фото товара на белом фоне; светло-серый фон некоторых снимков осветляем до белого */}
        <img src={images[0]} alt={label || ""} loading="lazy" referrerPolicy="no-referrer" className={`h-full w-full object-contain p-[6%] brightness-[1.08] contrast-[1.03] ${className}`} />
      </div>
    );
  }
  return (
    <div className="h-full w-full" style={{ background: art.bg }}>
      <ProductArt {...art} label={label} className={`h-full w-full ${className}`} />
    </div>
  );
}
