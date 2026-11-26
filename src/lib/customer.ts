// Личный кабинет покупателя: вход по номеру телефона, сессия в подписанной cookie.
import { cookies } from "next/headers";
import { secret } from "./ai";
import { authKey } from "./auth";

export const CUSTOMER_COOKIE = "katy_customer";

async function sign(value: string) {
  const key = `${await authKey()}:customer`;
  const data = new TextEncoder().encode(`${key}:${value}`);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 32);
}

export async function hashCode(phone: string, code: string) {
  return sign(`code:${phone}:${code}`);
}

/** Телефон вошедшего покупателя или undefined */
export async function currentCustomer(): Promise<string | undefined> {
  const raw = (await cookies()).get(CUSTOMER_COOKIE)?.value;
  if (!raw) return undefined;
  const [phone, sig] = raw.split(".");
  if (!phone || !sig || sig !== (await sign(phone))) return undefined;
  return phone;
}

export async function startSession(phone: string) {
  (await cookies()).set(CUSTOMER_COOKIE, `${phone}.${await sign(phone)}`, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 180 });
}

export async function endSession() {
  (await cookies()).delete(CUSTOMER_COOKIE);
}

/**
 * Отправка SMS с кодом. Работает, когда в настройках Cloudflare есть ключ SMS_RU_API_KEY
 * (сервис sms.ru; подключаем вместе с остальными оплатами). Без ключа возвращает false.
 */
export async function sendSms(phone: string, text: string): Promise<boolean> {
  const key = await secret("SMS_RU_API_KEY");
  if (!key) return false;
  const body = new URLSearchParams({ api_id: key, to: phone, msg: text, json: "1" });
  const res = await fetch("https://sms.ru/sms/send", { method: "POST", body }).catch(() => undefined);
  if (!res?.ok) return false;
  const j = (await res.json().catch(() => ({}))) as { status?: string };
  return j.status === "OK";
}

export async function smsEnabled() {
  return Boolean(await secret("SMS_RU_API_KEY"));
}
