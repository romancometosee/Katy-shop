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
    return <img src={images[0]} alt={label || ""} className={`h-full w-full object-cover ${className}`} />;
  }
  return (
    <div className="h-full w-full" style={{ background: art.bg }}>
      <ProductArt {...art} label={label} className={`h-full w-full ${className}`} />
    </div>
  );
}
