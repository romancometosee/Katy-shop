import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import ClubJoin from "@/components/ClubJoin";
import { DISCOUNT_LEVELS } from "@/lib/club";
import { rub } from "@/lib/format";

export const metadata = { title: "Клуб Katy — накопительная скидка", description: "Накопительная скидка до 10%, которая растёт с каждой покупкой, подарок на день рождения и закрытые предложения для участников клуба." };

const LEVELS = DISCOUNT_LEVELS.filter((l) => l.percent > 0);
const MAX = LEVELS[LEVELS.length - 1].percent;

const perks = [
  ["✦", "Скидка растёт сама", `Чем больше покупок, тем больше постоянная скидка — до ${MAX}%. Ничего копить и списывать не нужно.`],
  ["🛍", "В магазинах и на сайте", "Учитываются все покупки по вашему номеру телефона. Скидка сама посчитается при оформлении заказа."],
  ["🎂", "Подарок на день рождения", "Сюрприз в заказе в течение недели до и после праздника."],
  ["🔒", "Закрытые акции", "Ранний доступ к распродажам и новинкам только для участников."],
];
export default function ClubPage() {
  return (
    <div className="container-x pt-8">
      <Breadcrumbs items={[{ name: "Клуб Katy" }]} />
      <div className="mt-8 grid items-start gap-10 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.28em] text-rose">Программа лояльности</p>
          <h1 className="h-display mt-2 text-5xl leading-none sm:text-7xl">Клуб Katy</h1>
          <p className="mt-4 max-w-lg text-lg text-ink-soft">Ваша личная скидка растёт с каждой покупкой в магазинах и на сайте. Она действует всегда и считается сама — по номеру телефона.</p>

          {/* карта клуба */}
          <div className="relative mt-8 aspect-[1.6/1] max-w-md overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-[#1c1917] to-[#3a2e2a] p-7 text-[#e8c98f] shadow-2xl">
            <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-[#e8c98f]/20 blur-2xl" />
            <p className="h-display text-3xl tracking-[.3em]">KATY</p>
            <p className="text-[10px] uppercase tracking-[.35em] opacity-70">club card</p>
            <p className="absolute bottom-7 left-7 text-sm opacity-80">Скидка {MAX}%</p>
            <p className="absolute bottom-7 right-7 text-sm tracking-widest opacity-80">+7 ··· ·· 25</p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {perks.map(([i, t, d]) => (
              <div key={t} className="rounded-3xl bg-white p-5">
                <p className="text-2xl">{i}</p>
                <p className="mt-2 font-semibold">{t}</p>
                <p className="mt-1 text-sm text-ink-soft">{d}</p>
              </div>
            ))}
          </div>

          <h2 className="h-display mt-12 text-3xl">Как растёт скидка</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {LEVELS.map((l, i) => (
              <div key={l.name} className={`rounded-3xl p-5 ${i === LEVELS.length - 1 ? "bg-ink text-[#e8c98f]" : i >= LEVELS.length - 2 ? "bg-[#e9e6e1]" : "bg-sand"}`}>
                <p className="h-display text-4xl">{l.percent}%</p>
                <p className="mt-1 text-xs opacity-70">при покупках от {rub(l.from)}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-ink-soft">Сумма покупок считается за всё время. Накопительная скидка не суммируется с промокодами — действует та, что выгоднее. Подробности — у консультантов в магазинах. Есть вопросы? <Link href="/about" className="underline">О магазине</Link></p>
        </div>
        <div className="lg:sticky lg:top-32">
          <ClubJoin />
        </div>
      </div>
    </div>
  );
}
