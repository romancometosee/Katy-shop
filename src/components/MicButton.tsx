"use client";
// Голосовой ввод: нажал на микрофон — сказал — текст появился в поле.
// Работает в Chrome, Edge, Safari и на телефонах; где браузер не умеет, кнопка не показывается.
import { useEffect, useRef, useState } from "react";

type Rec = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};

function getRecognition(): (new () => Rec) | undefined {
  if (typeof window === "undefined") return undefined;
  const w = window as unknown as { SpeechRecognition?: new () => Rec; webkitSpeechRecognition?: new () => Rec };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

export function MicIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="9" y="3" width="6" height="12" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
    </svg>
  );
}

export default function MicButton({
  onText,
  onFinal,
  className = "",
  size = "h-9 w-9",
}: {
  /** текст, пока человек говорит */
  onText?: (t: string) => void;
  /** итоговая фраза, когда человек замолчал */
  onFinal: (t: string) => void;
  className?: string;
  size?: string;
}) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [hint, setHint] = useState("");
  const rec = useRef<Rec | null>(null);

  useEffect(() => setSupported(Boolean(getRecognition())), []);
  useEffect(() => () => rec.current?.abort(), []);

  if (!supported) return null;

  const toggle = () => {
    if (listening) {
      rec.current?.stop();
      return;
    }
    const R = getRecognition();
    if (!R) return;
    const r = new R();
    r.lang = "ru-RU";
    r.interimResults = true;
    r.continuous = false;
    let final = "";
    r.onresult = (e) => {
      let text = "";
      for (let i = 0; i < e.results.length; i++) text += e.results[i][0].transcript;
      text = text.trim();
      onText?.(text);
      if (e.results[e.results.length - 1].isFinal) final = text;
    };
    r.onerror = (e) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") setHint("Разрешите доступ к микрофону в браузере");
      else if (e.error === "no-speech") setHint("Не расслышала, попробуйте ещё раз");
      else setHint("");
    };
    r.onend = () => {
      setListening(false);
      rec.current = null;
      if (final) onFinal(final);
    };
    setHint("");
    try {
      r.start();
      rec.current = r;
      setListening(true);
    } catch {
      setListening(false);
    }
  };

  return (
    <span className="relative inline-flex shrink-0">
      <button
        type="button"
        onClick={toggle}
        aria-label={listening ? "Остановить запись" : "Сказать голосом"}
        title={listening ? "Говорите… нажмите, чтобы остановить" : "Сказать голосом"}
        className={`relative flex ${size} items-center justify-center rounded-full transition ${listening ? "bg-rose text-white" : "text-ink-soft hover:bg-sand hover:text-ink"} ${className}`}
      >
        {listening && <span className="absolute inset-0 animate-ping rounded-full bg-rose/40" />}
        <MicIcon className="relative h-[18px] w-[18px]" />
      </button>
      {(listening || hint) && (
        <span className="pointer-events-none absolute bottom-full right-0 z-50 mb-2 whitespace-nowrap rounded-full bg-ink px-3 py-1.5 text-xs font-medium text-white shadow-lg">
          {listening ? "Говорите, я слушаю…" : hint}
        </span>
      )}
    </span>
  );
}
