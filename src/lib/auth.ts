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
export async function authKey(): Promise<string> {
  if (process.env.ADMIN_SECRET) return process.env.ADMIN_SECRET;
  const db = await getDb();
  if (db.authKey) return db.authKey;
  return updateDb((d) => (d.authKey ??= hex(crypto.getRandomValues(new Uint8Array(32)))));
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

export async function checkAdminPassword(password: string): Promise<boolean> {
  const own = (await getDb()).adminPassword;
  if (own) return (await pbkdf2(password, own.salt)) === own.hash;
  return password === (process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD);
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
  return sha(`katy-admin:${await authKey()}:${pw}`);
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
