// Простой вход в админку по паролю (пароль задаётся в переменной ADMIN_PASSWORD)
export const ADMIN_COOKIE = "katy_admin";

export function adminPassword() {
  return process.env.ADMIN_PASSWORD || "katy2026";
}

export async function tokenFor(password: string) {
  const data = new TextEncoder().encode(`katy-admin:${password}:${process.env.ADMIN_SECRET || "katy-secret"}`);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
