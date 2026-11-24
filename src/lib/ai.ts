// ИИ-консультант «Спросить Katy»: ключ, подбор товаров для подсказки и правила ответа.
import type { Database, Product } from "./types";
import { toView } from "./catalog";

/** Секреты хранятся в настройках Cloudflare (или на сервере), в коде их нет */
async function secret(name: string): Promise<string | undefined> {
  if (process.env[name]) return process.env[name];
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const { env } = await getCloudflareContext({ async: true });
    const v = (env as unknown as Record<string, unknown>)[name];
    return typeof v === "string" && v ? v : undefined;
  } catch {
    return undefined;
  }
}

export type AiProvider =
  | { kind: "yandex"; apiKey: string; folderId: string; model: string }
  | { kind: "claude"; apiKey: string };

/**
 * Какой ИИ отвечает покупателям. Основной — YandexGPT (работает в России):
 * секреты YANDEX_API_KEY и YANDEX_FOLDER_ID. Если когда-нибудь добавить
 * ANTHROPIC_API_KEY, вместо него будет отвечать Claude.
 */
export async function getAiProvider(): Promise<AiProvider | undefined> {
  const claude = await secret("ANTHROPIC_API_KEY");
  if (claude) return { kind: "claude", apiKey: claude };
  const apiKey = await secret("YANDEX_API_KEY");
  const folderId = await secret("YANDEX_FOLDER_ID");
  if (apiKey && folderId) return { kind: "yandex", apiKey, folderId, model: (await secret("YANDEX_GPT_MODEL")) || "yandexgpt/latest" };
  return undefined;
}

const words = (s: string) => s.toLowerCase().replace(/ё/g, "е").split(/[^a-zа-я0-9]+/i).filter((w) => w.length > 2);

function productText(db: Database, p: Product) {
  const brand = db.brands.find((b) => b.id === p.brandId)?.name ?? "";
  const cat = db.categories.find((c) => c.id === (p.subcategoryId ?? p.categoryId))?.name ?? "";
  const notes = p.notes ? [...p.notes.top, ...p.notes.heart, ...p.notes.base].join(", ") : "";
  return { brand, cat, notes, all: `${brand} ${p.name} ${cat} ${p.family ?? ""} ${notes} ${p.tags.join(" ")} ${p.shortDescription}` };
}

/**
 * Список товаров для консультанта. Пока товаров немного, отдаём все;
 * когда их станут тысячи, берём самые подходящие к разговору (до 250 штук).
 */
export function catalogForAi(db: Database, conversation: string, limit = 250) {
  const active = db.products.filter((p) => p.isActive);
  let list = active;
  if (active.length > limit) {
    const q = new Set(words(conversation));
    const scored = active.map((p) => {
      const t = words(productText(db, p).all);
      let s = t.reduce((n, w) => n + (q.has(w) ? 3 : [...q].some((x) => w.startsWith(x.slice(0, 5))) ? 1 : 0), 0);
      if (p.isHit) s += 0.5;
      return { p, s };
    });
    list = scored.sort((a, b) => b.s - a.s).slice(0, limit).map((x) => x.p);
  }
  return list
    .map((p) => {
      const v = toView(db, p);
      const t = productText(db, p);
      const vols = v.variants.map((x) => `${x.label} ${x.price}₽${x.stock > 0 ? "" : " (нет в наличии)"}`).join("; ");
      return `- [[${p.slug}]] ${t.brand} — ${p.name} | ${t.cat}${p.family ? ` | ${p.family}` : ""}${t.notes ? ` | ноты: ${t.notes}` : ""}${p.skinType?.length ? ` | кожа: ${p.skinType.join(", ")}` : ""} | ${vols}${v.discountPercent ? ` | скидка ${v.discountPercent}%` : ""}${p.isHit ? " | хит" : ""} | ${p.shortDescription}`;
    })
    .join("\n");
}

export function systemPrompt(db: Database) {
  const s = db.settings;
  return `Ты — Katy, консультант интернет-магазина косметики и парфюмерии «${s.shopName}». Покупатель пишет тебе в окне чата на сайте.

Как отвечать:
- Пиши по-русски, тепло и по делу, как опытный консультант в магазине. Обычно 2–5 коротких предложений.
- Предлагай только товары из каталога ниже. Чтобы показать товар, вставь его метку в двойных квадратных скобках на отдельной строке, например [[${db.products[0]?.slug ?? "slug"}]]. Сайт превратит метку в карточку с фото, ценой и кнопкой «В корзину». Не больше 4 товаров за ответ.
- Если вопрос неясен (для кого подарок, тип кожи или волос, бюджет, любимые ароматы), задай один уточняющий вопрос.
- Если подходящего товара нет, честно скажи об этом и предложи ближайшую замену из каталога.
- Цены называй только из каталога. Не выдумывай составы, акции и сроки доставки.
- Про медицинские проблемы кожи советуй обратиться к дерматологу.
- Доставка: бесплатно от ${s.freeDeliveryFrom} ₽, иначе ${s.deliveryPrice} ₽. ${s.giftText ? `Подарок: ${s.giftText}.` : ""} Телефон магазина: ${s.phone}.
- Не используй заголовки и таблицы. Можно выделять **жирным**.`;
}
