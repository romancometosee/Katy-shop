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
      <div className="h-full w-full bg-[#f6f3ef]">
        {/* фото товара на светлом фоне: белый фон снимка «растворяется» в фоне карточки */}
        <img src={images[0]} alt={label || ""} loading="lazy" referrerPolicy="no-referrer" className={`h-full w-full object-contain p-[8%] mix-blend-multiply ${className}`} />
      </div>
    );
  }
  return (
    <div className="h-full w-full" style={{ background: art.bg }}>
      <ProductArt {...art} label={label} className={`h-full w-full ${className}`} />
    </div>
  );
}
