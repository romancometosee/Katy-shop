"use server";
// Действия админки: товары, цены, разделы, бренды, акции, баннеры, заказы, настройки
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ADMIN_COOKIE, adminToken, checkAdminPassword, isAdmin, setAdminPassword } from "./auth";
import { resetDb, updateDb } from "./db";
import { saveUploads } from "./uploads";
import { isExternal, mirrorImage } from "./mirror";
import { getDb } from "./db";
import { sendSms } from "./customer";
import { headers } from "next/headers";
import { slugify } from "./slug";
import { normPhone } from "./club";
import { catalogSheets, runImport, type ImportResult } from "./catalog-import";
import type { Cell, Sheet } from "./xlsx";
import type { ArtShape, Banner, Brand, Database, Gender, OrderStatus, Product, Promotion, PromotionKind, PromotionScope, Settings, Variant } from "./types";

async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
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
  // не больше 10 неверных паролей в час с одного адреса — подобрать пароль перебором не выйдет
  const h = await headers();
  const ip = h.get("cf-connecting-ip") || h.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const key = `admin:${ip}`;
  const now = Date.now();
  const rec = (await getDb()).loginCodes?.find((c) => c.phone === key);
  if (rec && rec.tries >= 10 && new Date(rec.expires).getTime() > now) return { error: "Слишком много попыток. Попробуйте через час." };
  if (!(await checkAdminPassword(str(fd, "password")))) {
    await updateDb((db) => {
      db.loginCodes = (db.loginCodes ?? []).filter((c) => new Date(c.expires).getTime() > now);
      let r = db.loginCodes.find((c) => c.phone === key);
      if (!r) db.loginCodes.push((r = { phone: key, hash: "", expires: "", tries: 0, sentAt: [] }));
      r.tries++;
      r.expires = new Date(now + 3600000).toISOString();
    });
    return { error: "Неверный пароль" };
  }
  if (rec) await updateDb((db) => { db.loginCodes = (db.loginCodes ?? []).filter((c) => c.phone !== key); });
  (await cookies()).set(ADMIN_COOKIE, await adminToken(), { httpOnly: true, secure: process.env.NODE_ENV === "production" && !h.get("host")?.startsWith("localhost"), sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 });
  redirect("/admin");
}

/** Смена пароля админки (в «Настройках») */
export async function changeAdminPassword(_: unknown, fd: FormData): Promise<{ ok?: boolean; error?: string } | null> {
  await requireAdmin();
  const now = str(fd, "current"), next = str(fd, "next"), again = str(fd, "again");
  if (!(await checkAdminPassword(now))) return { error: "Текущий пароль неверный" };
  if (next.length < 8) return { error: "Новый пароль — не короче 8 знаков" };
  if (next !== again) return { error: "Новый пароль и повтор не совпадают" };
  if (/^(katy|12345|qwerty|password|пароль)/i.test(next)) return { error: "Слишком простой пароль — придумайте другой" };
  await setAdminPassword(next);
  (await cookies()).set(ADMIN_COOKIE, await adminToken(), { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 });
  return { ok: true };
}

export async function logout() {
  (await cookies()).delete(ADMIN_COOKIE);
  redirect("/admin/login");
}

// ---------- «Сообщить о поступлении»: товара не было, а теперь есть — оповещаем ждущих ----------
type Arrival = { alertId: string; phone: string; text: string };
function markArrivals(db: Database, product: Product, next: Variant[], name: string, host: string): Arrival[] {
  const was = new Map(product.variants.map((v) => [v.id, v.stock]));
  const arrived = next.filter((v) => v.stock > 0 && (was.get(v.id) ?? 0) <= 0).map((v) => v.id);
  const out: Arrival[] = [];
  for (const a of db.stockAlerts ?? []) {
    if (a.productId === product.id && !a.notifiedAt && arrived.includes(a.variantId)) {
      a.notifiedAt = new Date().toISOString();
      out.push({ alertId: a.id, phone: a.phone, text: `Katy: «${name}» снова в наличии! ${host ? `https://${host}/product/${product.slug}` : ""}`.trim() });
    }
  }
  return out;
}
/** SMS уйдут, когда подключим SMS-сервис; до этого клиенты видны в «Ждут поступления» — им можно позвонить */
async function sendArrivalSms(list: Arrival[]) {
  if (!list.length) return;
  const sent = new Set<string>();
  for (const b of list) if (await sendSms(b.phone, b.text)) sent.add(b.alertId);
  if (sent.size) await updateDb((db) => { for (const a of db.stockAlerts ?? []) if (sent.has(a.id)) a.smsSent = true; });
}

// ---------- Товары ----------
export async function saveProduct(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id");
  const variants = (JSON.parse(str(fd, "variants") || "[]") as Variant[])
    .filter((v) => v.label && v.price > 0)
    .map((v) => ({ id: v.id || crypto.randomUUID(), label: v.label, price: Math.round(v.price), oldPrice: v.oldPrice ? Math.round(v.oldPrice) : undefined, stock: Math.max(0, Math.round(v.stock || 0)), sku: v.sku?.trim() || undefined, barcode: v.barcode || undefined }));
  const keptImages = JSON.parse(str(fd, "images") || "[]") as string[];
  const uploaded = await saveUploads(fd.getAll("upload") as File[]);
  let imageUrl = str(fd, "imageUrl");
  // фото по ссылке сразу переносим к себе; если сайт не отдал — оставляем ссылку
  if (imageUrl && isExternal(imageUrl)) imageUrl = (await mirrorImage(imageUrl)) ?? imageUrl;
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
    collection: str(fd, "collection") || undefined,
    notes: top || heart || base ? { top: list(top), heart: list(heart), base: list(base) } : undefined,
    skinType: list(str(fd, "skinType")),
    tags: list(str(fd, "tags")),
    isHit: bool(fd, "isHit"),
    isNew: bool(fd, "isNew"),
    isActive: bool(fd, "isActive"),
  };
  if (!data.name || !data.brandId || !data.categoryId) throw new Error("Заполните название, бренд и раздел");

  const back: Arrival[] = [];
  const host = (await headers()).get("host") ?? "";
  await updateDb((db) => {
    const existing = db.products.find((p) => p.id === id);
    if (existing) {
      back.push(...markArrivals(db, existing, data.variants, data.name, host));
      Object.assign(existing, data);
      const wanted = slugify(str(fd, "slug"));
      if (wanted && wanted !== existing.slug) existing.slug = uniqueSlug(wanted, db.products.map((p) => p.slug));
    } else {
      const brand = db.brands.find((b) => b.id === data.brandId)?.name ?? "";
      const slug = uniqueSlug(slugify(str(fd, "slug") || `${brand} ${data.name}`), db.products.map((p) => p.slug));
      db.products.unshift({ ...data, id: slug, slug, reviews: [], rating: 5, createdAt: new Date().toISOString() });
    }
  });
  await sendArrivalSms(back);
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
  const host = (await headers()).get("host") ?? "";
  const back = await updateDb((db) => {
    const p = db.products.find((x) => x.id === productId);
    if (!p) return [];
    const next = p.variants.map((v) => {
      const price = num(fd, `price-${v.id}`);
      const stock = fd.get(`stock-${v.id}`);
      return { ...v, price: price > 0 ? Math.round(price) : v.price, stock: stock !== null ? Math.max(0, Math.round(num(fd, `stock-${v.id}`))) : v.stock };
    });
    const msgs = markArrivals(db, p, next, p.name, host);
    p.variants = next;
    return msgs;
  });
  await sendArrivalSms(back);
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
    const fields: Partial<Brand> & { name: string; country: string; description: string; isPopular: boolean } = { name, country: str(fd, "country"), description: str(fd, "description"), isPopular: bool(fd, "isPopular") };
    // расширенные поля есть только в форме «Страница бренда»
    if (fd.has("story")) Object.assign(fields, { story: str(fd, "story").slice(0, 4000) || undefined, image: str(fd, "image") || undefined, founded: str(fd, "founded").slice(0, 20) || undefined });
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
  const kinds: PromotionKind[] = ["percent", "bundle", "gift", "tiers", "delivery"];
  const kind = kinds.includes(str(fd, "kind") as PromotionKind) ? (str(fd, "kind") as PromotionKind) : "percent";
  // даты из формы — по московскому времени, последний день акции включительно
  const day = (k: string, fallback: number) => (/^\d{4}-\d{2}-\d{2}$/.test(str(fd, k)) ? str(fd, k) : new Date(fallback).toISOString().slice(0, 10));
  const buyQty = Math.min(10, Math.max(2, Math.round(num(fd, "buyQty")) || 3));
  const data: Omit<Promotion, "id" | "slug"> = {
    title: str(fd, "title"),
    subtitle: str(fd, "subtitle"),
    discountPercent: Math.min(90, Math.max(1, Math.round(num(fd, "discountPercent")))),
    scope,
    targetIds: scope === "all" ? [] : (fd.getAll(`targets-${scope}`) as string[]).filter(Boolean),
    startsAt: new Date(`${day("startsAt", Date.now())}T00:00:00+03:00`).toISOString(),
    endsAt: new Date(`${day("endsAt", Date.now() + 7 * 86400000)}T23:59:59+03:00`).toISOString(),
    isActive: bool(fd, "isActive"),
    color: str(fd, "color") || "#1c1917",
    kind,
    ...(kind === "bundle" ? { buyQty, payQty: Math.min(buyQty - 1, Math.max(1, Math.round(num(fd, "payQty")) || buyQty - 1)) } : {}),
    ...(kind === "gift" || kind === "delivery" ? { minTotal: Math.max(0, Math.round(num(fd, "minTotal"))) } : {}),
    ...(kind === "gift" ? { giftText: str(fd, "giftText").slice(0, 120) } : {}),
    ...(kind === "tiers"
      ? { tiers: [0, 1, 2].map((i) => ({ from: Math.max(0, Math.round(num(fd, `tierFrom${i}`))), percent: Math.min(90, Math.max(0, Math.round(num(fd, `tierPercent${i}`)))) })).filter((t) => t.percent > 0).sort((a, b) => a.from - b.from) }
      : {}),
    ...(bool(fd, "dayDeal") ? { dayDeal: true } : {}),
  };
  if (!data.title) return;
  await updateDb((db) => {
    const p = db.promotions.find((x) => x.id === id);
    if (p) {
      // поля другой механики не оставляем
      for (const k of ["buyQty", "payQty", "minTotal", "giftText", "tiers"] as const) delete p[k];
      Object.assign(p, data);
    } else {
      const slug = uniqueSlug(slugify(data.title), db.promotions.map((x) => x.slug));
      db.promotions.unshift({ id: slug, slug, ...data });
    }
  });
  done("/admin/promotions");
}

/** Адвент-календарь: 24 товара дня на декабрь */
export async function saveAdvent(fd: FormData) {
  await requireAdmin();
  const { ADVENT_DAYS, adventId, adventPromotion, autoAdvent } = await import("./advent");
  const year = Math.round(num(fd, "year"));
  const auto = str(fd, "auto") === "1";
  await updateDb((db) => {
    const autoList = auto ? autoAdvent(db, year) : [];
    for (let day = 1; day <= ADVENT_DAYS; day++) {
      const id = adventId(year, day);
      const slug = auto ? undefined : str(fd, `slug${day}`);
      const fromAuto = autoList.find((p) => p.id === id);
      const productId = auto ? fromAuto?.targetIds[0] : db.products.find((p) => p.slug === slug)?.id;
      const percent = auto ? fromAuto?.discountPercent ?? 20 : num(fd, `percent${day}`) || 20;
      db.promotions = db.promotions.filter((p) => p.id !== id);
      if (productId) db.promotions.push(adventPromotion(year, day, productId, percent));
    }
  });
  done("/admin/promotions/advent");
}

/** Начислить или списать баллы клиенту вручную (например, покупка в магазине или подарок) */
export async function adjustPoints(fd: FormData) {
  await requireAdmin();
  const phone = str(fd, "phone");
  const points = Math.round(num(fd, "points"));
  const note = str(fd, "note").slice(0, 120);
  const kind = str(fd, "kind") === "store" ? "store" : "manual";
  if (!points) return;
  await updateDb((db) => {
    const m = (db.members ?? []).find((x) => x.phone === phone);
    if (!m) return;
    m.points = Math.max(0, m.points + points);
    (m.history ??= []).unshift({ at: new Date().toISOString(), kind, points, note: note || undefined });
  });
  done(`/admin/club/${phone}`);
}

/** Накопительная скидка: покупка в магазине (или исправление суммы) — увеличивает сумму покупок клиента */
export async function addStoreSpend(fd: FormData) {
  await requireAdmin();
  const phone = str(fd, "phone");
  const amount = Math.round(num(fd, "amount"));
  const note = str(fd, "note").slice(0, 120);
  if (!amount || phone.length !== 11) return;
  await updateDb((db) => {
    db.members ??= [];
    let m = db.members.find((x) => x.phone === phone);
    if (!m) {
      const o = db.orders.find((x) => x.customer.phone.replace(/\D/g, "").endsWith(phone.slice(1)));
      m = { phone, name: o?.customer.name || "Клиент магазина", points: 0, createdAt: new Date().toISOString() };
      db.members.unshift(m);
    }
    m.storeSpend = Math.max(0, (m.storeSpend ?? 0) + amount);
    (m.history ??= []).unshift({ at: new Date().toISOString(), kind: "storeSpend", points: 0, amount, note: note || undefined });
  });
  done(`/admin/club/${phone}`);
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
      // «Название | Адрес | Часы | Телефон» — по одному магазину в строке
      stores: str(fd, "stores").split(/\r?\n/).map((l) => l.split("|").map((x) => x.trim())).filter((a) => a[0] && a[1]).slice(0, 50)
        .map(([name, address, hours, phone]) => ({ name: name.slice(0, 80), address: address.slice(0, 200), hours: hours?.slice(0, 80) || undefined, phone: phone?.slice(0, 40) || undefined })),
    };
    // остальные настройки (разделы PRO и т. п.) не трогаем
    db.settings = { ...db.settings, ...s };
  });
  done("/admin/settings?saved=1");
}

export async function resetDemo() {
  await requireAdmin();
  await resetDb();
  done("/admin");
}

// ---------- Фото товаров: переносим с сайтов брендов к себе ----------
export async function mirrorPhotosBatch(): Promise<{ moved: number; failed: number; left: number }> {
  await requireAdmin();
  const db = await getDb();
  const failedBefore = new Set(db.mirrorFailed ?? []);
  const all = [...new Set(db.products.flatMap((p) => p.images).filter((u) => isExternal(u) && !failedBefore.has(u)))];
  const batch = all.slice(0, 10); // понемногу, чтобы сервер успевал
  const map = new Map<string, string>();
  const failed: string[] = [];
  await Promise.all(batch.map(async (u) => { const m = await mirrorImage(u); if (m) map.set(u, m); else failed.push(u); }));
  await updateDb((d) => {
    for (const p of d.products) p.images = p.images.map((u) => map.get(u) ?? u);
    if (failed.length) d.mirrorFailed = [...new Set([...(d.mirrorFailed ?? []), ...failed])];
  });
  revalidatePath("/", "layout");
  return { moved: map.size, failed: failed.length, left: all.length - batch.length };
}

/** Снова попробовать фото, которые не удалось перенести */
export async function retryFailedPhotos() {
  await requireAdmin();
  await updateDb((d) => { d.mirrorFailed = []; });
  done("/admin/products");
}

// ---------- «Сообщить о поступлении» ----------
export async function closeStockAlert(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id");
  await updateDb((db) => { db.stockAlerts = (db.stockAlerts ?? []).filter((a) => a.id !== id); });
  done("/admin/waitlist");
}

// ---------- Katy PRO ----------
const newCode = () => String(100000 + Math.floor(Math.random() * 900000));

/** Одобрить мастера (или поменять скидку): выдаётся код для входа */
export async function approvePro(fd: FormData) {
  await requireAdmin();
  const phone = str(fd, "phone");
  const discount = Math.min(50, Math.max(1, Math.round(num(fd, "discount")) || 20));
  await updateDb((db) => {
    const p = (db.pros ?? []).find((x) => x.phone === phone);
    if (!p) return;
    if (p.status !== "approved") { p.approvedAt = new Date().toISOString(); p.code ??= newCode(); }
    p.status = "approved";
    p.discount = discount;
  });
  done("/admin/pro");
}

export async function rejectPro(fd: FormData) {
  await requireAdmin();
  const phone = str(fd, "phone");
  await updateDb((db) => { const p = (db.pros ?? []).find((x) => x.phone === phone); if (p) p.status = "rejected"; });
  done("/admin/pro");
}

export async function deletePro(fd: FormData) {
  await requireAdmin();
  const phone = str(fd, "phone");
  await updateDb((db) => { db.pros = (db.pros ?? []).filter((x) => x.phone !== phone); });
  done("/admin/pro");
}

/** Новый код входа (если мастер потерял старый) */
export async function newProCode(fd: FormData) {
  await requireAdmin();
  const phone = str(fd, "phone");
  await updateDb((db) => { const p = (db.pros ?? []).find((x) => x.phone === phone); if (p) p.code = newCode(); });
  done("/admin/pro");
}

/** Добавить мастера вручную (например, давний клиент салона) */
export async function addPro(fd: FormData) {
  await requireAdmin();
  const phone = normPhone(str(fd, "phone"));
  const name = str(fd, "name");
  if (phone.length !== 11 || !name) return;
  await updateDb((db) => {
    db.pros ??= [];
    if (db.pros.some((p) => p.phone === phone)) return;
    db.pros.unshift({ phone, name, kind: str(fd, "kind") || "other", salon: str(fd, "salon") || undefined, city: str(fd, "city") || undefined, status: "approved", discount: Math.min(50, Math.max(1, Math.round(num(fd, "discount")) || 20)), code: newCode(), createdAt: new Date().toISOString(), approvedAt: new Date().toISOString() });
  });
  done("/admin/pro");
}

/** На какие разделы действуют цены PRO */
export async function saveProCategories(fd: FormData) {
  await requireAdmin();
  const ids = fd.getAll("cat").map(String);
  await updateDb((db) => { db.settings.proCategories = ids; });
  done("/admin/pro");
}

// ---------- Загрузка и выгрузка каталога в Excel ----------
/**
 * Таблицу читает браузер и присылает строки. apply=false — только показать, что изменится (ничего не сохраняем).
 */
export async function importCatalog(rows: Cell[][], opts: { apply: boolean; onlyPriceStock: boolean }): Promise<{ ok: true; result: ImportResult } | { ok: false; error: string }> {
  await requireAdmin();
  if (!Array.isArray(rows) || rows.length > 20000) return { ok: false, error: "Слишком большая таблица: можно до 20 000 строк за раз" };
  try {
    if (!opts.apply) {
      const copy = structuredClone(await getDb());
      return { ok: true, result: runImport(copy, rows, opts.onlyPriceStock) };
    }
    const host = (await headers()).get("host") ?? "";
    const { result, back } = await updateDb((db) => {
      const before = new Map(db.products.flatMap((p) => p.variants.map((v) => [v.id, v.stock] as const)));
      const result = runImport(db, rows, opts.onlyPriceStock);
      // «Сообщить о поступлении»: товар был закончился, а теперь есть
      const back: Arrival[] = [];
      for (const a of db.stockAlerts ?? []) {
        if (a.notifiedAt) continue;
        const p = db.products.find((x) => x.id === a.productId);
        const v = p?.variants.find((x) => x.id === a.variantId);
        if (p && v && v.stock > 0 && (before.get(v.id) ?? 0) <= 0) {
          a.notifiedAt = new Date().toISOString();
          back.push({ alertId: a.id, phone: a.phone, text: `Katy: «${p.name}» снова в наличии! ${host ? `https://${host}/product/${p.slug}` : ""}`.trim() });
        }
      }
      return { result, back };
    });
    await sendArrivalSms(back);
    revalidatePath("/", "layout");
    return { ok: true, result };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Не получилось прочитать таблицу" };
  }
}

/** Весь каталог для скачивания в Excel (файл собирает браузер) */
export async function exportCatalog(): Promise<Sheet[]> {
  await requireAdmin();
  return catalogSheets(await getDb());
}
