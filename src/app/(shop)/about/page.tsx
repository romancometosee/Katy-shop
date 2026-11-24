import Breadcrumbs from "@/components/Breadcrumbs";
import { getDb } from "@/lib/db";

export const metadata = { title: "О магазине" };

export default async function AboutPage() {
  const { settings: s } = await getDb();
  return (
    <div className="container-x max-w-3xl pt-8">
      <Breadcrumbs items={[{ name: "О магазине" }]} />
      <h1 className="h-display mt-6 text-5xl">О магазине {s.shopName}</h1>
      <div className="mt-8 space-y-5 text-[17px] leading-relaxed">
        <p>{s.shopName} — магазин оригинальной парфюмерии и косметики. Мы работаем только с официальными поставщиками и проверяем каждую партию.</p>
        <p><b>Гарантия оригинальности.</b> Если вы сомневаетесь в подлинности товара — вернём деньги в полном объёме.</p>
        <p><b>Подбор аромата.</b> Наш парфюмер-консультант поможет выбрать аромат по вашим любимым нотам — напишите нам в Instagram @{s.instagram} или Telegram @{s.telegram}.</p>
        <p><b>Подарок в каждом заказе.</b> {s.giftText} — чтобы вы могли открыть для себя что-то новое.</p>
      </div>
    </div>
  );
}
