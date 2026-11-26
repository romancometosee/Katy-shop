import Breadcrumbs from "@/components/Breadcrumbs";
import { getDb } from "@/lib/db";
import { rub } from "@/lib/format";

export const metadata = { title: "Доставка и оплата" };

export default async function DeliveryPage() {
  const { settings: s } = await getDb();
  const blocks = [
    ["Курьером", `По городу и ближайшим районам — в удобное время. Стоимость ${rub(s.deliveryPrice)}, бесплатно от ${rub(s.freeDeliveryFrom)}.`],
    ["Самовывоз", "Бесплатно из любого магазина Katy. Позвоним, когда заказ будет ждать вас."],
    ["По всей России", "СДЭК, Boxberry или Почта России — до пункта выдачи или до двери, обычно 2–7 дней."],
    ["Оплата", "Картой или через СБП по ссылке после подтверждения заказа. Или при получении: в магазине, курьеру, в пункте СДЭК."],
    ["Подарок", `В каждый заказ кладём подарок: ${s.giftText.toLowerCase()}.`],
    ["Возврат", "Если товар не подошёл и упаковка не вскрыта — вернём деньги в течение 14 дней."],
  ];
  return (
    <div className="container-x pt-8">
      <Breadcrumbs items={[{ name: "Доставка и оплата" }]} />
      <h1 className="h-display mt-6 text-5xl">Доставка и оплата</h1>
      <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {blocks.map(([t, d]) => (
          <div key={t} className="card p-7">
            <p className="h-display text-2xl">{t}</p>
            <p className="mt-2 text-ink-soft">{d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
