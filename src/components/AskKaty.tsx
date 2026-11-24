"use client";
/* eslint-disable @next/next/no-img-element */
// «Спросить Katy» — ИИ-консультант. Кнопка в углу открывает окно чата.
// Открыть окно можно и из любого места сайта: window.dispatchEvent(new CustomEvent("katy-ask", { detail: "вопрос" }))
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useCart } from "./CartProvider";
import { rub } from "@/lib/format";
import type { ProductView } from "@/lib/catalog";

type Msg = { role: "user" | "assistant"; text: string; products?: ProductView[] };

const IDEAS = [
  "Подарок девушке до 5 000 ₽",
  "Шампунь для окрашенных волос",
  "Стойкий красный гель-лак",
  "Аромат на лето, свежий и лёгкий",
  "Уход для сухой кожи зимой",
];

const SAVE_KEY = "katy-chat";

export function openAskKaty(question?: string) {
  window.dispatchEvent(new CustomEvent("katy-ask", { detail: question ?? "" }));
}

export function AskKatyButton({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <button type="button" onClick={() => openAskKaty()} className={className}>
      {children}
    </button>
  );
}

function Sparkle({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 2c.4 3.9 2.1 6.6 6 7.6v.8c-3.9 1-5.6 3.7-6 7.6h-.8c-.4-3.9-2.1-6.6-6-7.6v-.8c3.9-1 5.6-3.7 6-7.6H12z" />
      <path d="M19 15c.2 1.6.9 2.7 2.5 3.1v.4c-1.6.4-2.3 1.5-2.5 3.1h-.4c-.2-1.6-.9-2.7-2.5-3.1v-.4c1.6-.4 2.3-1.5 2.5-3.1H19z" opacity=".6" />
    </svg>
  );
}

/** Текст ответа: **жирный**, абзацы и метки [[товар]] (они превращаются в карточки ниже) */
function RichText({ text }: { text: string }) {
  const clean = text.replace(/\[\[[^\]]+\]\]/g, "").replace(/\n{3,}/g, "\n\n").trim();
  return (
    <>
      {clean.split(/\n+/).map((line, i) => (
        <p key={i} className="mt-1.5 first:mt-0">
          {line.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
            part.startsWith("**") && part.endsWith("**") ? <strong key={j}>{part.slice(2, -2)}</strong> : <span key={j}>{part}</span>,
          )}
        </p>
      ))}
    </>
  );
}

function MiniCard({ p, onGo }: { p: ProductView; onGo: () => void }) {
  const { add } = useCart();
  const v = [...p.variants].sort((a, b) => a.price - b.price)[0];
  const [added, setAdded] = useState(false);
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-line bg-white p-2.5">
      <Link href={`/product/${p.slug}`} onClick={onGo} className="h-16 w-14 shrink-0 overflow-hidden rounded-xl bg-white">
        {p.images[0] ? (
          <img src={p.images[0]} alt="" referrerPolicy="no-referrer" className="h-full w-full object-contain p-1 brightness-[1.08] contrast-[1.03]" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-center text-[9px] font-semibold uppercase tracking-wider text-ink-soft" style={{ background: p.art.bg }}>{p.brandName}</div>
        )}
      </Link>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-ink-soft">{p.brandName}</p>
        <Link href={`/product/${p.slug}`} onClick={onGo} className="line-clamp-1 text-sm font-medium hover:text-rose">{p.name}</Link>
        <p className="text-sm">
          {p.variants.length > 1 ? "от " : ""}
          <b className={p.oldPrice ? "text-rose" : ""}>{rub(p.price)}</b>
          {p.oldPrice ? <s className="ml-1.5 text-xs text-ink-soft">{rub(p.oldPrice)}</s> : null}
        </p>
      </div>
      {v && v.stock > 0 && (
        <button
          type="button"
          onClick={() => {
            add({ productId: p.id, variantId: v.id, slug: p.slug, name: p.name, brandName: p.brandName, variantLabel: v.label, price: v.price, oldPrice: v.oldPrice, image: p.images[0], art: p.art });
            setAdded(true);
          }}
          className={`shrink-0 rounded-full px-3 py-2 text-xs font-semibold transition ${added ? "bg-sand text-ink" : "bg-ink text-white hover:bg-rose"}`}
        >
          {added ? "✓ В корзине" : "В корзину"}
        </button>
      )}
    </div>
  );
}

export default function AskKaty() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // переписка сохраняется на время визита
  useEffect(() => {
    try {
      const s = sessionStorage.getItem(SAVE_KEY);
      if (s) setMsgs(JSON.parse(s));
    } catch {}
  }, []);
  useEffect(() => {
    try {
      if (!busy) sessionStorage.setItem(SAVE_KEY, JSON.stringify(msgs.slice(-20)));
    } catch {}
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, busy]);

  const send = useCallback(
    async (text: string) => {
      const q = text.trim();
      if (!q || busy) return;
      setInput("");
      const history: Msg[] = [...msgs, { role: "user", text: q }];
      setMsgs([...history, { role: "assistant", text: "" }]);
      setBusy(true);
      const setLast = (m: Partial<Msg>) => setMsgs((all) => [...all.slice(0, -1), { ...all[all.length - 1], ...m }]);
      try {
        const res = await fetch("/api/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history.map(({ role, text }) => ({ role, text })) }),
        });
        if (res.status === 503) {
          // ключ ещё не добавлен — показываем обычный поиск по словам
          const products: ProductView[] = await fetch(`/api/products?words=${encodeURIComponent(q)}`).then((r) => r.json()).catch(() => []);
          setLast({
            text: products.length
              ? "Я пока учусь и скоро начну отвечать полностью. А вот что нашлось в каталоге по вашему вопросу:"
              : "Я пока учусь и скоро начну отвечать полностью. Попробуйте поиск по сайту или позвоните нам, мы с радостью подскажем.",
            products,
          });
          return;
        }
        if (!res.ok || !res.body) throw new Error(String(res.status));
        const reader = res.body.getReader();
        const dec = new TextDecoder();
        let acc = "";
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          acc += dec.decode(value, { stream: true });
          setLast({ text: acc });
        }
        const slugs = [...new Set([...acc.matchAll(/\[\[([^\]]+)\]\]/g)].map((m) => m[1].trim()))].slice(0, 4);
        if (slugs.length) {
          const products: ProductView[] = await fetch(`/api/products?slugs=${slugs.map(encodeURIComponent).join(",")}`).then((r) => r.json()).catch(() => []);
          setLast({ text: acc, products });
        }
      } catch {
        setLast({ text: "Не получилось ответить. Проверьте интернет и попробуйте ещё раз." });
      } finally {
        setBusy(false);
      }
    },
    [busy, msgs],
  );

  // открытие из других мест сайта
  useEffect(() => {
    const h = (e: Event) => {
      setOpen(true);
      const q = (e as CustomEvent<string>).detail;
      if (q) send(q);
      else setTimeout(() => inputRef.current?.focus(), 250);
    };
    window.addEventListener("katy-ask", h);
    return () => window.removeEventListener("katy-ask", h);
  }, [send]);

  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [open]);

  return (
    <>
      {/* кнопка в углу */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Спросить Katy"
        className={`fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-full bg-ink py-3 pl-3.5 pr-5 text-sm font-semibold text-white shadow-xl transition duration-300 hover:-translate-y-0.5 hover:bg-[#2b2422] sm:bottom-6 sm:right-6 ${open ? "pointer-events-none translate-y-4 opacity-0" : ""}`}
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#f2b8c0] to-[#e8c98f] text-ink">
          <Sparkle className="h-4 w-4" />
        </span>
        Спросить Katy
      </button>

      {/* окно чата */}
      <div
        role="dialog"
        aria-label="Консультант Katy"
        className={`fixed inset-x-0 bottom-0 z-50 flex h-[85dvh] flex-col overflow-hidden rounded-t-[1.75rem] border border-line bg-[#fbf8f5] shadow-2xl transition duration-300 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:h-[min(640px,calc(100dvh-3rem))] sm:w-[400px] sm:rounded-[1.75rem] ${open ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"}`}
      >
        <div className="flex items-center gap-3 border-b border-line bg-white/80 px-5 py-4 backdrop-blur">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#f2b8c0] to-[#e8c98f]">
            <Sparkle className="h-5 w-5 text-ink" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="h-display text-xl leading-none">Katy</p>
            <p className="mt-1 text-xs text-ink-soft">Консультант по красоте · подберёт за минуту</p>
          </div>
          {msgs.length > 0 && (
            <button type="button" onClick={() => setMsgs([])} className="rounded-full px-2.5 py-1 text-xs text-ink-soft hover:bg-sand">Заново</button>
          )}
          <button type="button" onClick={() => setOpen(false)} aria-label="Закрыть" className="flex h-9 w-9 items-center justify-center rounded-full text-xl hover:bg-sand">×</button>
        </div>

        <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-5">
          {msgs.length === 0 && (
            <div className="animate-fade-up">
              <div className="rounded-2xl rounded-tl-md bg-white p-4 text-[15px] leading-relaxed shadow-sm">
                Здравствуйте! Я Katy. Подскажу аромат, уход за кожей и волосами, оттенок гель-лака или соберу подарок. Опишите, что ищете, своими словами.
              </div>
              <p className="mb-2 mt-5 text-xs font-semibold uppercase tracking-[.18em] text-ink-soft">Например</p>
              <div className="flex flex-wrap gap-2">
                {IDEAS.map((t) => (
                  <button key={t} type="button" onClick={() => send(t)} className="rounded-full border border-line bg-white px-3.5 py-2 text-left text-sm transition hover:-translate-y-0.5 hover:border-ink">
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}
          {msgs.map((m, i) =>
            m.role === "user" ? (
              <div key={i} className="ml-auto max-w-[85%] rounded-2xl rounded-tr-md bg-ink px-4 py-2.5 text-[15px] text-white">{m.text}</div>
            ) : (
              <div key={i} className="max-w-[95%] space-y-2">
                <div className="rounded-2xl rounded-tl-md bg-white px-4 py-3 text-[15px] leading-relaxed shadow-sm">
                  {m.text ? (
                    <RichText text={m.text} />
                  ) : (
                    <span className="inline-flex gap-1 py-1" aria-label="Katy печатает">
                      {[0, 1, 2].map((d) => (
                        <span key={d} className="h-2 w-2 animate-bounce rounded-full bg-ink-soft/60" style={{ animationDelay: `${d * 0.15}s` }} />
                      ))}
                    </span>
                  )}
                </div>
                {m.products?.map((p) => <MiniCard key={p.id} p={p} onGo={() => setOpen(false)} />)}
              </div>
            ),
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-end gap-2 border-t border-line bg-white px-3 py-3"
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            rows={1}
            maxLength={1000}
            placeholder="Спросите о чём угодно…"
            className="max-h-28 min-h-[44px] flex-1 resize-none rounded-2xl bg-sand px-4 py-2.5 text-[15px] outline-none"
          />
          <button disabled={busy || !input.trim()} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink text-white transition disabled:opacity-30" aria-label="Отправить">
            ↑
          </button>
        </form>
        <p className="bg-white pb-2 text-center text-[10px] text-ink-soft">Katy — ИИ-помощник и может ошибаться. Цены и наличие смотрите в карточке товара.</p>
      </div>
    </>
  );
}
