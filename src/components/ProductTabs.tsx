"use client";
import { useState } from "react";
import { StarIcon } from "./Icons";
import { dateRu } from "@/lib/format";
import type { Review } from "@/lib/types";

export default function ProductTabs({
  description,
  notes,
  reviews,
  productId,
  submitReview,
  profileKind,
}: {
  profileKind?: "skin" | "hair" | "nails" | "scent";
  description: string;
  notes?: { top: string[]; heart: string[]; base: string[] };
  reviews: Review[];
  productId: string;
  submitReview: (fd: FormData) => Promise<void>;
}) {
  const profiles = profileKind ? PROFILES[profileKind] : null;
  const tabs = [
    ["desc", "Описание"],
    ...(notes ? [["notes", "Ноты аромата"]] : []),
    ["reviews", `Отзывы (${reviews.length})`],
    ["delivery", "Доставка"],
  ];
  const [tab, setTab] = useState(tabs[0][0]);
  const [sent, setSent] = useState(false);

  return (
    <div>
      <div className="no-scrollbar flex gap-6 overflow-x-auto border-b border-line">
        {tabs.map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={`shrink-0 border-b-2 pb-3 text-sm font-semibold uppercase tracking-wider ${tab === k ? "border-ink" : "border-transparent text-ink-soft"}`}>{l}</button>
        ))}
      </div>
      <div className="py-8">
        {tab === "desc" && <p className="max-w-3xl whitespace-pre-line text-[15px] leading-relaxed">{description}</p>}
        {tab === "notes" && notes && (
          <div className="grid gap-4 sm:grid-cols-3">
            {([["Верхние ноты", notes.top, "#f6e4e4"], ["Ноты сердца", notes.heart, "#f2ebe1"], ["Базовые ноты", notes.base, "#ebe3d6"]] as const).map(([t, list, bg]) => (
              <div key={t} className="rounded-3xl p-6" style={{ background: bg }}>
                <p className="label">{t}</p>
                <p className="h-display text-2xl capitalize">{list.join(", ")}</p>
              </div>
            ))}
          </div>
        )}
        {tab === "reviews" && (
          <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
            <div className="space-y-6">
              {reviews.length === 0 && <p className="text-ink-soft">Отзывов пока нет — станьте первым!</p>}
              {reviews.map((r) => (
                <div key={r.id} className="border-b border-line pb-6">
                  <div className="flex items-center justify-between">
                    <b>{r.author}</b>
                    <span className="text-xs text-ink-soft">{dateRu(r.date)}</span>
                  </div>
                  {r.profile && <span className="mt-1 inline-block rounded-full bg-sand px-2.5 py-0.5 text-xs text-ink-soft">{r.profile}</span>}
                  <div className="mt-1 flex gap-0.5 text-gold">{Array.from({ length: 5 }, (_, i) => <StarIcon key={i} filled={i < r.rating} className="h-3.5 w-3.5" />)}</div>
                  <p className="mt-2 text-[15px]">{r.text}</p>
                </div>
              ))}
            </div>
            <form
              action={async (fd) => { await submitReview(fd); setSent(true); }}
              className="card h-fit space-y-3 p-6"
            >
              <p className="h-display text-2xl">Оставить отзыв</p>
              {sent ? (
                <p className="text-sm text-emerald-700">Спасибо! Отзыв появится после проверки.</p>
              ) : (
                <>
                  <input type="hidden" name="productId" value={productId} />
                  <input name="author" required placeholder="Ваше имя" className="input" />
                  <select name="rating" defaultValue="5" className="input">
                    {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{"★".repeat(n)} ({n})</option>)}
                  </select>
                  {profiles && (
                    <select name="profile" defaultValue="" className="input">
                      <option value="">{profiles.label} (необязательно)</option>
                      {profiles.options.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  )}
                  <textarea name="text" required rows={4} placeholder="Ваши впечатления" className="input" />
                  <button className="btn-dark w-full">Отправить</button>
                </>
              )}
            </form>
          </div>
        )}
        {tab === "delivery" && (
          <div className="max-w-3xl space-y-3 text-[15px] leading-relaxed">
            <p><b>Курьером</b> — по Москве и Санкт-Петербургу на следующий день.</p>
            <p><b>Пункты выдачи</b> — СДЭК, Boxberry и Ozon по всей России, 2–6 дней.</p>
            <p><b>Почта России</b> — в любой населённый пункт.</p>
            <p>Оплата картой онлайн, СБП или при получении. Каждый заказ упаковываем в фирменную коробку с подарком.</p>
          </div>
        )}
      </div>
    </div>
  );
}

/** Подсказка «про себя» в отзыве: покупателю важнее отзыв человека с такой же кожей или волосами, чем звёзды */
const PROFILES = {
  skin: { label: "Ваша кожа", options: ["Сухая кожа", "Жирная кожа", "Комбинированная кожа", "Нормальная кожа", "Чувствительная кожа", "Возрастная кожа"] },
  hair: { label: "Ваши волосы", options: ["Тонкие волосы", "Густые волосы", "Окрашенные волосы", "Блонд", "Кудрявые волосы", "Сухие, повреждённые", "Жирнеют у корней"] },
  nails: { label: "Как наносили", options: ["Делаю маникюр сама", "Мастер маникюра", "В салоне", "Ногти тонкие, ломкие"] },
  scent: { label: "Когда носили", options: ["На каждый день", "На работу", "На вечер", "Зимой", "Летом", "В подарок"] },
} as const;
