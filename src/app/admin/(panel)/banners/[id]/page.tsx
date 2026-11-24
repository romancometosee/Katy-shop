import Link from "next/link";
import { notFound } from "next/navigation";
import BannerForm from "@/components/admin/BannerForm";
import { PageHead } from "@/components/admin/ui";
import { getDb } from "@/lib/db";
import { categoryPath } from "@/lib/catalog";

export default async function EditBanner({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await getDb();
  const banner = id === "new" ? undefined : db.banners.find((b) => b.id === id);
  if (id !== "new" && !banner) notFound();
  const links = [
    { href: "/sale", name: "Все акции" },
    { href: "/podbor", name: "Подбор аромата" },
    { href: "/brands", name: "Бренды" },
    ...db.promotions.map((p) => ({ href: `/sale/${p.slug}`, name: `Акция: ${p.title}` })),
    ...db.categories.map((c) => ({ href: categoryPath(db, c), name: c.name })),
    ...db.brands.map((b) => ({ href: `/brands/${b.slug}`, name: b.name })),
  ];
  return (
    <div>
      <Link href="/admin/banners" className="text-sm text-ink-soft hover:underline">← Все баннеры</Link>
      <PageHead title={banner ? "Баннер" : "Новый баннер"} />
      <BannerForm banner={banner} links={links} />
    </div>
  );
}
