// Простая защита от автоматических «спам»-запросов: не больше N действий за окно времени с одного адреса.
// Счётчики живут в памяти сервера — этого хватает, чтобы бот не завалил заказы, отзывы и заявки.
import { headers } from "next/headers";

const hits = new Map<string, number[]>();

export async function clientIp() {
  const h = await headers();
  return h.get("cf-connecting-ip") || h.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}

/** true — лимит превышен (действие выполнять не нужно) */
export async function overLimit(action: string, max: number, windowMs: number) {
  const key = `${action}:${await clientIp()}`;
  const now = Date.now();
  const list = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  list.push(now);
  hits.set(key, list);
  if (hits.size > 20000) hits.clear();
  return list.length > max;
}
