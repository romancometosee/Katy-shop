import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import ClubJoin from "@/components/ClubJoin";
import { BIRTHDAY_BONUS, CLUB_LEVELS, WELCOME_BONUS } from "@/lib/club";

export const metadata = { title: "Клуб Katy — баллы и подарки", description: "Баллы за каждую покупку, подарок на день рождения и закрытые предложения для участников клуба." };

const perks = [
  ["✦", "Баллы за покупки", `До ${CLUB_LEVELS[CLUB_LEVELS.length - 1].percent}% от суммы возвращается баллами. 1 балл = 1 ₽.`],
  ["🎂", "Подарок на день рождения", `${BIRTHDAY_BONUS} баллов и сюрприз в заказе в течение недели до и после праздника.`],
  ["🎁", `${WELCOME_BONUS} баллов сразу`, "Приветственный бонус сразу после вступления."],
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
          <p className="mt-4 max-w-lg text-lg text-ink-soft">Копите баллы за каждую покупку в магазинах и на сайте, получайте подарки и узнавайте о новинках первыми.</p>

          {/* карта клуба */}
          <div className="relative mt-8 aspect-[1.6/1] max-w-md overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-[#1c1917] to-[#3a2e2a] p-7 text-[#e8c98f] shadow-2xl">
            <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-[#e8c98f]/20 blur-2xl" />
            <p className="h-display text-3xl tracking-[.3em]">KATY</p>
            <p className="text-[10px] uppercase tracking-[.35em] opacity-70">club card</p>
            <p className="absolute bottom-7 left-7 text-sm opacity-80">Katy Gold</p>
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

          <h2 className="h-display mt-12 text-3xl">Уровни клуба</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {CLUB_LEVELS.map((l, i) => (
              <div key={l.name} className={`rounded-3xl p-5 ${i === 2 ? "bg-ink text-[#e8c98f]" : i === 1 ? "bg-[#e9e6e1]" : "bg-sand"}`}>
                <p className="font-semibold">{l.name}</p>
                <p className="h-display mt-2 text-4xl">{l.percent}%</p>
                <p className="mt-1 text-xs opacity-70">{l.note}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-ink-soft">Баллами можно оплатить до 30% заказа. Подробности — у консультантов в магазинах. Есть вопросы? <Link href="/about" className="underline">О магазине</Link></p>
        </div>
        <div className="lg:sticky lg:top-32">
          <ClubJoin />
        </div>
      </div>
    </div>
  );
}
