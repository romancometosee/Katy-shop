import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getDb } from "@/lib/db";

export const metadata = { title: "Магазины Katy", description: "Адреса магазинов Katy, часы работы и самовывоз заказов с сайта." };

export default async function StoresPage() {
  const { settings: s } = await getDb();
  const stores = s.stores ?? [];
  const map = (a: string) => `https://yandex.ru/maps/?text=${encodeURIComponent(a)}`;
  return (
    <div className="container-x pt-8">
      <Breadcrumbs items={[{ name: "Магазины" }]} />
      <h1 className="h-display mt-6 text-5xl">Магазины Katy</h1>
      <p className="mt-3 max-w-2xl text-ink-soft">Приходите понюхать ароматы, подобрать оттенок и получить совет консультанта. Заказ с сайта можно забрать в любом магазине бесплатно.</p>
      {stores.length ? (
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {stores.map((st, i) => (
            <div key={i} className="card p-7">
              <p className="h-display text-2xl">{st.name}</p>
              <p className="mt-2">{st.address}</p>
              {st.hours && <p className="mt-1 text-sm text-ink-soft">{st.hours}</p>}
              {st.phone && <p className="mt-1 text-sm"><a href={`tel:${st.phone.replace(/[^\d+]/g, "")}`} className="underline">{st.phone}</a></p>}
              <a href={map(st.address)} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-sm font-semibold underline">Как добраться</a>
            </div>
          ))}
        </div>
      ) : (
        <div className="card mt-10 max-w-2xl p-7">
          <p className="h-display text-2xl">Адреса скоро появятся</p>
          <p className="mt-2 text-ink-soft">Пока можно оформить заказ с самовывозом — менеджер подскажет ближайший магазин при подтверждении.{s.phone && <> Или позвоните: <a href={`tel:${s.phone.replace(/[^\d+]/g, "")}`} className="underline">{s.phone}</a>.</>}</p>
          <Link href="/catalog" className="btn-dark mt-5 inline-block">В каталог</Link>
        </div>
      )}
    </div>
  );
}
