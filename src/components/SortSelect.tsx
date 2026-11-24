"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const options = [
  ["popular", "Популярные"],
  ["new", "Новинки"],
  ["price-asc", "Сначала дешевле"],
  ["price-desc", "Сначала дороже"],
  ["discount", "По размеру скидки"],
  ["rating", "По рейтингу"],
];

export default function SortSelect() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  return (
    <select
      value={params.get("sort") ?? "popular"}
      onChange={(e) => {
        const p = new URLSearchParams(params.toString());
        p.set("sort", e.target.value);
        router.push(`${pathname}?${p.toString()}`, { scroll: false });
      }}
      className="rounded-full border border-line bg-white px-4 py-2 text-sm outline-none"
    >
      {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>
  );
}
