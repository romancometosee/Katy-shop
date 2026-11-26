import { Field, Notice, PageHead } from "@/components/admin/ui";
import { getDb } from "@/lib/db";
import { resetDemo, saveSettings } from "@/lib/admin-actions";
import ConfirmButton from "@/components/admin/ConfirmButton";
import PasswordForm from "@/components/admin/PasswordForm";
import { passwordKind } from "@/lib/auth";

export default async function SettingsAdmin({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const { saved } = await searchParams;
  const { settings: s } = await getDb();
  const f = (name: keyof typeof s, label: string, hint?: string) => (
    <Field label={label} hint={hint}><input name={name} defaultValue={String(s[name])} className="input" /></Field>
  );
  return (
    <div className="max-w-3xl">
      <PageHead title="Настройки магазина" />
      {saved && <Notice>Сохранено.</Notice>}
      <PasswordForm weak={(await passwordKind()) === "default"} />
      <div className="h-8" />
      <form action={saveSettings} className="card space-y-4 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {f("shopName", "Название магазина")}
          {f("tagline", "Слоган")}
          {f("phone", "Телефон")}
          {f("email", "E-mail")}
          {f("instagram", "Instagram")}
          {f("telegram", "Telegram")}
          {f("freeDeliveryFrom", "Бесплатная доставка от, ₽")}
          {f("deliveryPrice", "Стоимость доставки, ₽")}
        </div>
        {f("announcement", "Бегущая строка сверху", "Фразы разделяйте знаком «·»")}
        {f("giftText", "Подарок в каждом заказе")}
        <Field label="Магазины (для самовывоза и страницы «Магазины»)" hint="Каждый магазин с новой строки: Название | Адрес | Часы работы | Телефон. Например: Katy на Ленина | Москва, ул. Ленина, 1 | ежедневно 10–21 | +7 900 000-00-00">
          <textarea name="stores" rows={4} className="input font-mono text-xs" defaultValue={(s.stores ?? []).map((x) => [x.name, x.address, x.hours ?? "", x.phone ?? ""].join(" | ").replace(/( \| )+$/, "")).join("\n")} />
        </Field>
        <Field label="Реквизиты продавца (для оферты и политики конфиденциальности)" hint="Например: ИП Иванова Екатерина Ивановна, ИНН 000000000000, ОГРНИП 000000000000000, адрес: г. Москва, ул. Ленина, 1. Пока пусто — на страницах документов стоит «реквизиты будут указаны».">
          <textarea name="requisites" rows={3} className="input text-sm" defaultValue={s.requisites ?? ""} />
        </Field>
        <button className="btn-dark">Сохранить</button>
      </form>
      <form action={resetDemo} className="mt-10 rounded-3xl border border-rose/30 p-6">
        <p className="font-semibold">Вернуть демо-каталог</p>
        <p className="mt-1 text-sm text-ink-soft">Удалит все ваши изменения, товары и заказы и загрузит стартовый каталог заново.</p>
        <ConfirmButton message="Точно удалить все изменения и заказы?" className="mt-4 rounded-full border border-rose px-5 py-2 text-sm font-semibold text-rose">Сбросить всё</ConfirmButton>
      </form>
    </div>
  );
}
