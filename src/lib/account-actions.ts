"use server";
// Вход в личный кабинет: код по SMS или (пока SMS не подключены) номер одного из своих заказов
import { revalidatePath } from "next/cache";
import { overLimit } from "./limit";
import { updateDb } from "./db";
import { normPhone } from "./club";
import { endSession, hashCode, sendSms, smsEnabled, startSession } from "./customer";

export type AuthResult = { ok: true } | { ok: false; error: string };

export async function requestCode(rawPhone: string): Promise<AuthResult & { sms?: boolean }> {
  if (await overLimit("sms", 10, 3600000)) return { ok: false, error: "Слишком много попыток. Попробуйте через час." };
  const phone = normPhone(rawPhone ?? "");
  if (phone.length !== 11) return { ok: false, error: "Проверьте номер телефона" };
  if (!(await smsEnabled())) return { ok: false, error: "nosms" };
  const code = String(Math.floor(1000 + Math.random() * 9000));
  const hash = await hashCode(phone, code);
  const now = Date.now();
  const tooMany = await updateDb((db) => {
    db.loginCodes = (db.loginCodes ?? []).filter((c) => new Date(c.expires).getTime() > now - 3600000);
    let rec = db.loginCodes.find((c) => c.phone === phone);
    const recent = (rec?.sentAt ?? []).filter((t) => now - new Date(t).getTime() < 10 * 60000);
    if (recent.length >= 3) return true;
    if (!rec) db.loginCodes.push((rec = { phone, hash, expires: "", tries: 0, sentAt: [] }));
    Object.assign(rec, { hash, expires: new Date(now + 10 * 60000).toISOString(), tries: 0, sentAt: [...recent, new Date(now).toISOString()] });
    return false;
  });
  if (tooMany) return { ok: false, error: "Слишком много попыток. Попробуйте через 10 минут." };
  const sent = await sendSms(phone, `Katy: код для входа ${code}`);
  return sent ? { ok: true, sms: true } : { ok: false, error: "Не получилось отправить SMS. Попробуйте позже." };
}

export async function verifyCode(rawPhone: string, code: string): Promise<AuthResult> {
  const phone = normPhone(rawPhone ?? "");
  const hash = await hashCode(phone, String(code ?? "").trim());
  const ok = await updateDb((db) => {
    const rec = (db.loginCodes ?? []).find((c) => c.phone === phone);
    if (!rec || new Date(rec.expires).getTime() < Date.now() || rec.tries >= 5) return false;
    rec.tries++;
    if (rec.hash !== hash) return false;
    db.loginCodes = db.loginCodes!.filter((c) => c !== rec);
    return true;
  });
  if (!ok) return { ok: false, error: "Неверный или устаревший код" };
  await startSession(phone);
  revalidatePath("/account");
  return { ok: true };
}

/** Пока SMS не подключены: телефон + номер любого своего заказа */
export async function loginByOrder(rawPhone: string, orderNumber: string): Promise<AuthResult> {
  if (await overLimit("login", 30, 3600000)) return { ok: false, error: "Слишком много попыток входа. Попробуйте через час." };
  const phone = normPhone(rawPhone ?? "");
  const digits = String(orderNumber ?? "").replace(/\D/g, "");
  const n = Number(digits);
  if (phone.length !== 11 || !n) return { ok: false, error: "Укажите телефон и номер заказа" };
  const proCode = digits.length === 6; // код мастера Katy PRO — 6 цифр, номер заказа — 4
  if (!proCode && (await smsEnabled())) return { ok: false, error: "Войдите по коду из SMS" };
  // не больше 5 неудачных попыток в час на один номер, чтобы номер заказа нельзя было подобрать
  const now = Date.now();
  const res = await updateDb((db) => {
    db.loginCodes = (db.loginCodes ?? []).filter((c) => new Date(c.expires).getTime() > now - 3600000);
    const key = `order:${phone}`;
    let rec = db.loginCodes.find((c) => c.phone === key);
    if (rec && rec.tries >= 5 && new Date(rec.expires).getTime() > now) return "blocked" as const;
    const found = proCode
      ? (db.pros ?? []).some((p) => p.phone === phone && p.status === "approved" && p.code === digits)
      : db.orders.some((o) => o.number === n && normPhone(o.customer.phone) === phone);
    if (found) { db.loginCodes = db.loginCodes.filter((c) => c !== rec); return "ok" as const; }
    if (!rec) db.loginCodes.push((rec = { phone: key, hash: "", expires: "", tries: 0, sentAt: [] }));
    rec.tries++;
    rec.expires = new Date(now + 3600000).toISOString();
    return "no" as const;
  });
  if (res === "blocked") return { ok: false, error: "Слишком много попыток. Попробуйте через час или позвоните нам." };
  if (res === "no") return { ok: false, error: proCode ? "Код мастера не подходит к этому телефону" : "Заказ с таким номером и телефоном не найден" };
  await startSession(phone);
  revalidatePath("/account");
  return { ok: true };
}

export async function logout() {
  await endSession();
  revalidatePath("/account");
}
