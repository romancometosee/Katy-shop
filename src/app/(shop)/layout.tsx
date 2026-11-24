import Header, { type NavItem } from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import AskKaty from "@/components/AskKaty";
import { CartProvider } from "@/components/CartProvider";
import { getDb } from "@/lib/db";
import { subcategoriesOf, topCategories } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const db = await getDb();
  const tops = topCategories(db);
  const nav: NavItem[] = tops.map((c) => {
    const brandIds = new Set(db.products.filter((p) => p.categoryId === c.id && p.isActive).map((p) => p.brandId));
    return {
      name: c.name,
      href: `/catalog/${c.slug}`,
      description: c.description,
      art: c.art,
      subs: subcategoriesOf(db, c.id).map((s) => ({ name: s.name, href: `/catalog/${c.slug}/${s.slug}` })),
      brands: db.brands.filter((b) => brandIds.has(b.id)).slice(0, 10).map((b) => ({ name: b.name, href: `/brands/${b.slug}` })),
    };
  });
  return (
    <CartProvider>
      <Header shopName={db.settings.shopName} announcement={db.settings.announcement} nav={nav} />
      <main className="min-h-[60vh]">{children}</main>
      <Footer settings={db.settings} categories={tops} />
      <CartDrawer freeDeliveryFrom={db.settings.freeDeliveryFrom} giftText={db.settings.giftText} />
      <AskKaty />
    </CartProvider>
  );
}
