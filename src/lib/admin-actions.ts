"use server";
// Действия админки: товары, цены, разделы, бренды, акции, баннеры, заказы, настройки
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ADMIN_COOKIE, adminPassword, tokenFor } from "./auth";
import { resetDb, updateDb } from "./db";
import { saveUploads } from "./uploads";
import { slugify } from "./slug";
import type { ArtShape, Banner, Gender, OrderStatus, Product, Promotion, PromotionScope, Settings, Variant } from "./types";

async function requireAdmin() {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token || token !== (await tokenFor(adminPassword()))) redirect("/admin/login");
}

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const num = (fd: FormData, k: string) => {
  const v = Number(String(fd.get(k) ?? "").replace(/\s/g, "").replace(",", "."));
  return isFinite(v) ? v : 0;
};
const bool = (fd: FormData, k: string) => fd.get(k) === "on" || fd.get(k) === "true";
const list = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);

function done(path?: string) {
  revalidatePath("/", "layout");
  if (path) redirect(path);
}

function uniqueSlug(base: string, taken: string[]) {
  let s = base || "item";
  let i = 2;
  while (taken.includes(s)) s = `${base}-${i++}`;
  return s;
}

// ---------- Вход ----------
export async function login(_: unknown, fd: FormData) {
  if (str(fd, "password") !== adminPassword()) return { error: "Неверный пароль" };
  (await cookies()).set(ADMIN_COOKIE, await tokenFor(adminPassword()), { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 });
  redirect("/admin");
}

export async function logout() {
  (await cookies()).delete(ADMIN_COOKIE);
  redirect("/admin/login");
}

// ---------- Товары ----------
export async function saveProduct(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id");
  const variants = (JSON.parse(str(fd, "variants") || "[]") as Variant[])
    .filter((v) => v.label && v.price > 0)
    .map((v) => ({ id: v.id || crypto.randomUUID(), label: v.label, price: Math.round(v.price), oldPrice: v.oldPrice ? Math.round(v.oldPrice) : undefined, stock: Math.max(0, Math.round(v.stock || 0)) }));
  const keptImages = JSON.parse(str(fd, "images") || "[]") as string[];
  const uploaded = await saveUploads(fd.getAll("upload") as File[]);
  const imageUrl = str(fd, "imageUrl");
  const images = [...keptImages, ...uploaded, ...(imageUrl ? [imageUrl] : [])];
  const subcategoryId = str(fd, "subcategoryId") || undefined;
  const top = str(fd, "notesTop"), heart = str(fd, "notesHeart"), base = str(fd, "notesBase");

  const data: Omit<Product, "id" | "slug" | "reviews" | "createdAt" | "rating"> = {
    name: str(fd, "name"),
    brandId: str(fd, "brandId"),
    categoryId: str(fd, "categoryId"),
    subcategoryId,
    shortDescription: str(fd, "shortDescription"),
    description: str(fd, "description"),
    images,
    art: { shape: (str(fd, "artShape") || "flacon-square") as ArtShape, color: str(fd, "artColor") || "#e8c9b8", accent: str(fd, "artAccent") || "#1c1917", bg: str(fd, "artBg") || "#f6efe9" },
    variants: variants.length ? variants : [{ id: crypto.randomUUID(), label: "1 шт", price: 1000, stock: 0 }],
    gender: (str(fd, "gender") || undefined) as Gender | undefined,
    family: str(fd, "family") || undefined,
    notes: top || heart || base ? { top: list(top), heart: list(heart), base: list(base) } : undefined,
    skinType: list(str(fd, "skinType")),
    tags: list(str(fd, "tags")),
    isHit: bool(fd, "isHit"),
    isNew: bool(fd, "isNew"),
    isActive: bool(fd, "isActive"),
  };
  if (!data.name || !data.brandId || !data.categoryId) throw new Error("Заполните название, бренд и раздел");

  await updateDb((db) => {
    const existing = db.products.find((p) => p.id === id);
    if (existing) {
      Object.assign(existing, data);
      const wanted = slugify(str(fd, "slug"));
      if (wanted && wanted !== existing.slug) existing.slug = uniqueSlug(wanted, db.products.map((p) => p.slug));
    } else {
      const brand = db.brands.find((b) => b.id === data.brandId)?.name ?? "";
      const slug = uniqueSlug(slugify(str(fd, "slug") || `${brand} ${data.name}`), db.products.map((p) => p.slug));
      db.products.unshift({ ...data, id: slug, slug, reviews: [], rating: 5, createdAt: new Date().toISOString() });
    }
  });
  done("/admin/products?saved=1");
}

export async function deleteProduct(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id");
  await updateDb((db) => { db.products = db.products.filter((p) => p.id !== id); });
  done("/admin/products");
}

export async function toggleProductFlag(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id");
  const flag = str(fd, "flag") as "isActive" | "isHit" | "isNew";
  await updateDb((db) => {
    const p = db.products.find((x) => x.id === id);
    if (p && ["isActive", "isHit", "isNew"].includes(flag)) p[flag] = !p[flag];
  });
  done();
}

/** Быстрая смена цены прямо в списке товаров */
export async function quickPrice(fd: FormData) {
  await requireAdmin();
  const productId = str(fd, "productId");
  await updateDb((db) => {
    const p = db.products.find((x) => x.id === productId);
    if (!p) return;
    for (const v of p.variants) {
      const price = num(fd, `price-${v.id}`);
      const stock = fd.get(`stock-${v.id}`);
      if (price > 0) v.price = Math.round(price);
      if (stock !== null) v.stock = Math.max(0, Math.round(num(fd, `stock-${v.id}`)));
    }
  });
  done();
}

/** Массовое изменение цен: на N% для бренда / раздела / всего каталога */
export async function bulkPrice(fd: FormData) {
  await requireAdmin();
  const percent = num(fd, "percent");
  const target = str(fd, "target"); // all | brand:<id> | cat:<id>
  const round = num(fd, "round") || 10;
  if (!percent) return;
  await updateDb((db) => {
    for (const p of db.products) {
      const match =
        target === "all" ||
        (target.startsWith("brand:") && p.brandId === target.slice(6)) ||
        (target.startsWith("cat:") && (p.categoryId === target.slice(4) || p.subcategoryId === target.slice(4)));
      if (!match) continue;
      for (const v of p.variants) v.price = Math.max(round, Math.round((v.price * (100 + percent)) / 100 / round) * round);
    }
  });
  done("/admin/products?bulk=1");
}

export async function moderateReview(fd: FormData) {
  await requireAdmin();
  const productId = str(fd, "productId"), reviewId = str(fd, "reviewId"), action = str(fd, "action");
  await updateDb((db) => {
    const p = db.products.find((x) => x.id === productId);
    if (!p) return;
    if (action === "approve") { const r = p.reviews.find((r) => r.id === reviewId); if (r) r.approved = true; }
    else p.reviews = p.reviews.filter((r) => r.id !== reviewId);
  });
  done();
}

// ---------- Разделы ----------
export async function saveCategory(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id");
  const name = str(fd, "name");
  const parentId = str(fd, "parentId") || undefined;
  if (!name) return;
  await updateDb((db) => {
    const c = db.categories.find((x) => x.id === id);
    if (c) {
      c.name = name;
      c.description = str(fd, "description");
      c.order = num(fd, "order") || c.order;
      return;
    }
    const slug = slugify(str(fd, "slug") || name);
    const newId = parentId ? `${parentId}--${slug}` : slug;
    if (db.categories.some((x) => x.id === newId)) return;
    const siblings = db.categories.filter((x) => x.parentId === parentId);
    db.categories.push({
      id: newId, slug, name, description: str(fd, "description"), parentId, order: siblings.length + 1,
      art: { shape: (str(fd, "artShape") || "flacon-round") as ArtShape, color: str(fd, "artColor") || "#e8c9b8", accent: "#1c1917", bg: str(fd, "artBg") || "#f6efe9" },
    });
  });
  done();
}

export async function deleteCategory(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id");
  await updateDb((db) => {
    const used = db.products.some((p) => p.categoryId === id || p.subcategoryId === id) || db.categories.some((c) => c.parentId === id);
    if (used) return;
    db.categories = db.categories.filter((c) => c.id !== id);
  });
  done();
}

// ---------- Бренды ----------
export async function saveBrand(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id");
  const name = str(fd, "name");
  if (!name) return;
  await updateDb((db) => {
    const b = db.brands.find((x) => x.id === id);
    const fields = { name, country: str(fd, "country"), description: str(fd, "description"), isPopular: bool(fd, "isPopular") };
    if (b) Object.assign(b, fields);
    else {
      const slug = uniqueSlug(slugify(name), db.brands.map((x) => x.slug));
      db.brands.push({ id: slug, slug, ...fields });
    }
  });
  done();
}

export async function deleteBrand(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id");
  await updateDb((db) => {
    if (db.products.some((p) => p.brandId === id)) return;
    db.brands = db.brands.filter((b) => b.id !== id);
  });
  done();
}

// ---------- Акции и промокоды ----------
export async function savePromotion(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id");
  const scope = str(fd, "scope") as PromotionScope;
  const data: Omit<Promotion, "id" | "slug"> = {
    title: str(fd, "title"),
    subtitle: str(fd, "subtitle"),
    discountPercent: Math.min(90, Math.max(1, Math.round(num(fd, "discountPercent")))),
    scope,
    targetIds: scope === "all" ? [] : (fd.getAll(`targets-${scope}`) as string[]).filter(Boolean),
    startsAt: new Date(str(fd, "startsAt") || Date.now()).toISOString(),
    endsAt: new Date(str(fd, "endsAt") || Date.now() + 7 * 86400000).toISOString(),
    isActive: bool(fd, "isActive"),
    color: str(fd, "color") || "#1c1917",
  };
  if (!data.title) return;
  await updateDb((db) => {
    const p = db.promotions.find((x) => x.id === id);
    if (p) Object.assign(p, data);
    else {
      const slug = uniqueSlug(slugify(data.title), db.promotions.map((x) => x.slug));
      db.promotions.unshift({ id: slug, slug, ...data });
    }
  });
  done("/admin/promotions");
}

export async function deletePromotion(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id");
  await updateDb((db) => { db.promotions = db.promotions.filter((p) => p.id !== id); });
  done("/admin/promotions");
}

export async function savePromoCode(fd: FormData) {
  await requireAdmin();
  const code = str(fd, "code").toUpperCase().replace(/\s/g, "");
  if (!code) return;
  await updateDb((db) => {
    const fields = { code, discountPercent: Math.min(90, Math.max(1, num(fd, "discountPercent"))), minTotal: num(fd, "minTotal"), isActive: bool(fd, "isActive") };
    const pc = db.promoCodes.find((x) => x.code === str(fd, "original") || x.code === code);
    if (pc) Object.assign(pc, fields);
    else db.promoCodes.push(fields);
  });
  done();
}

export async function deletePromoCode(fd: FormData) {
  await requireAdmin();
  const code = str(fd, "code");
  await updateDb((db) => { db.promoCodes = db.promoCodes.filter((p) => p.code !== code); });
  done();
}

// ---------- Баннеры ----------
export async function saveBanner(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id");
  const [uploaded] = await saveUploads(fd.getAll("upload") as File[]);
  await updateDb((db) => {
    const existing = db.banners.find((b) => b.id === id);
    const image = bool(fd, "removeImage") ? undefined : uploaded || existing?.image;
    const data: Omit<Banner, "id"> = {
      title: str(fd, "title"),
      subtitle: str(fd, "subtitle"),
      buttonText: str(fd, "buttonText") || "Подробнее",
      link: str(fd, "link") || "/",
      image,
      theme: (str(fd, "theme") || "rose") as Banner["theme"],
      artShape: (str(fd, "artShape") || "flacon-square") as ArtShape,
      order: num(fd, "order") || db.banners.length + 1,
      isActive: bool(fd, "isActive"),
    };
    if (existing) Object.assign(existing, data);
    else db.banners.push({ id: crypto.randomUUID(), ...data });
  });
  done("/admin/banners");
}

export async function deleteBanner(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id");
  await updateDb((db) => { db.banners = db.banners.filter((b) => b.id !== id); });
  done("/admin/banners");
}

// ---------- Заказы ----------
export async function setOrderStatus(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id");
  const status = str(fd, "status") as OrderStatus;
  await updateDb((db) => { const o = db.orders.find((x) => x.id === id); if (o) o.status = status; });
  done();
}

// ---------- Настройки ----------
export async function saveSettings(fd: FormData) {
  await requireAdmin();
  await updateDb((db) => {
    const s: Settings = {
      shopName: str(fd, "shopName") || "Katy",
      tagline: str(fd, "tagline"),
      phone: str(fd, "phone"),
      email: str(fd, "email"),
      instagram: str(fd, "instagram").replace(/^@/, ""),
      telegram: str(fd, "telegram").replace(/^@/, ""),
      freeDeliveryFrom: num(fd, "freeDeliveryFrom"),
      deliveryPrice: num(fd, "deliveryPrice"),
      announcement: str(fd, "announcement"),
      giftText: str(fd, "giftText"),
    };
    db.settings = s;
  });
  done("/admin/settings?saved=1");
}

export async function resetDemo() {
  await requireAdmin();
  await resetDb();
  done("/admin");
}
