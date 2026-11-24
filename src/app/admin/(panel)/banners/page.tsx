import Link from "next/link";
import { PageHead } from "@/components/admin/ui";
import { bannerThemes } from "@/lib/bannerThemes";
import { getDb } from "@/lib/db";

export default async function BannersAdmin() {
  const db = await getDb();
  const banners = [...db.banners].sort((a, b) => a.order - b.order);
  return (
    <div>
      <PageHead title="Баннеры на главной" desc="Большие слайды в самом верху сайта. Они листаются автоматически. Можно загрузить своё фото или выбрать цветную тему." action={{ href: "/admin/banners/new", label: "+ Новый баннер" }} />
      <div className="space-y-4">
        {banners.map((b) => (
          <Link key={b.id} href={`/admin/banners/${b.id}`} className={`relative flex min-h-36 items-center overflow-hidden rounded-3xl p-8 transition hover:opacity-95 ${b.isActive ? "" : "opacity-50"}`} style={{ background: bannerThemes[b.theme].bg }}>
            {b.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={b.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
            )}
            <div className="relative">
              <p className={`text-xs font-semibold ${bannerThemes[b.theme].sub}`}>#{b.order} · {b.isActive ? "показывается" : "скрыт"} · ведёт на {b.link}</p>
              <p className={`h-display mt-1 text-3xl ${bannerThemes[b.theme].text}`}>{b.title}</p>
              <p className={`text-sm ${bannerThemes[b.theme].sub}`}>{b.subtitle}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
