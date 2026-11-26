// Вход в админку.
// Пароль: свой (Роман задаёт в «Настройках», хранится только отпечаток) → переменная ADMIN_PASSWORD → пароль по умолчанию.
// Подписи cookie делаются секретным ключом, который сайт сам создаёт и хранит в своих данных (не в коде:
// код магазина открыт на GitHub, поэтому ключ из кода позволил бы подделать вход).
import { cookies } from "next/headers";
import { getDb, updateDb } from "./db";

export const ADMIN_COOKIE = "katy_admin";
export const DEFAULT_ADMIN_PASSWORD = "katy2026";

const hex = (b: ArrayBuffer | Uint8Array) => Array.from(b instanceof Uint8Array ? b : new Uint8Array(b)).map((x) => x.toString(16).padStart(2, "0")).join("");
const sha = async (s: string) => hex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)));

/** Секретный ключ сайта: из ADMIN_SECRET, иначе случайный, созданный один раз и сохранённый в данных */
// Ключ читаем из данных каждый раз (без запоминания в памяти): на Cloudflare сайт работает сразу в нескольких
// копиях, и запомненный в одной из них устаревший ключ выкидывал бы из админки сразу после входа.
export async function authKey(): Promise<string> {
  if (process.env.ADMIN_SECRET) return process.env.ADMIN_SECRET;
  const db = await getDb();
  return db.authKey ?? (await updateDb((d) => (d.authKey ??= hex(crypto.getRandomValues(new Uint8Array(32))))));
}

async function pbkdf2(password: string, salt: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: new TextEncoder().encode(salt), iterations: 100000 }, key, 256);
  return hex(bits);
}

/** Какой пароль сейчас действует: own — свой, env — из настроек Cloudflare, default — пароль по умолчанию (небезопасно) */
export async function passwordKind(): Promise<"own" | "env" | "default"> {
  if ((await getDb()).adminPassword) return "own";
  return process.env.ADMIN_PASSWORD ? "env" : "default";
}

// Русская раскладка → латинская: «лфен2026», набранное без переключения языка, = «katy2026»
const RU = "йцукенгшщзхъфывапролджэячсмитьбю", EN = "qwertyuiop[]asdfghjkl;'zxcvbnm,.";
const toLatin = (s: string) => s.replace(/[а-яё]/gi, (ch) => { const lo = ch.toLowerCase(); const i = RU.indexOf(lo === "ё" ? "е" : lo); if (i < 0) return ch; const e = EN[i]; return ch === lo ? e : e.toUpperCase(); });

export async function checkAdminPassword(password: string): Promise<boolean> {
  password = password.trim(); // телефон часто добавляет пробел после слова
  const tries = [...new Set([password, toLatin(password)])];
  const own = (await getDb()).adminPassword;
  if (own) {
    for (const p of tries) if ((await pbkdf2(p, own.salt)) === own.hash) return true;
    return false;
  }
  const want = process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;
  // пароль по умолчанию открыт в коде, поэтому для него не важны заглавные буквы (телефон любит делать первую букву большой)
  return tries.some((p) => p === want || (!process.env.ADMIN_PASSWORD && p.toLowerCase() === want));
}

export async function setAdminPassword(password: string) {
  const salt = hex(crypto.getRandomValues(new Uint8Array(16)));
  const hash = await pbkdf2(password, salt);
  await updateDb((d) => { d.adminPassword = { salt, hash, changedAt: new Date().toISOString() }; });
}

/** Значение cookie админа. Меняется при смене пароля — старые входы перестают действовать */
export async function adminToken(): Promise<string> {
  const db = await getDb();
  const pw = db.adminPassword?.hash ?? (await sha(process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD));
  // Без ключа из данных: на Cloudflare данные доходят до всех копий сайта не сразу, и вход «не держался».
  // Свой пароль хранится только отпечатком в данных (его не узнать), так что подделать cookie без пароля нельзя.
  return sha(`katy-admin:${process.env.ADMIN_SECRET ?? ""}:${pw}`);
}

export async function isAdmin(): Promise<boolean> {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  const want = await adminToken();
  if (token.length !== want.length) return false;
  let diff = 0;
  for (let i = 0; i < want.length; i++) diff |= token.charCodeAt(i) ^ want.charCodeAt(i);
  return diff === 0;
}
