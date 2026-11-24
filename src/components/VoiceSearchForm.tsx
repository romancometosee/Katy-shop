"use client";
// Строка поиска с микрофоном (главная и страница поиска)
import { useRouter } from "next/navigation";
import { useState } from "react";
import MicButton from "./MicButton";
import { SearchIcon } from "./Icons";

export default function VoiceSearchForm({
  defaultValue = "",
  placeholder,
  variant = "hero",
  autoFocus,
}: {
  defaultValue?: string;
  placeholder: string;
  variant?: "hero" | "page";
  autoFocus?: boolean;
}) {
  const [q, setQ] = useState(defaultValue);
  const router = useRouter();
  const go = (text: string) => {
    const t = text.trim();
    if (t) router.push(`/search?q=${encodeURIComponent(t)}`);
  };
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        go(q);
      }}
      className={`flex items-center gap-1.5 rounded-full border border-line bg-white p-1.5 pl-5 shadow-sm focus-within:border-ink ${variant === "hero" ? "mt-8 max-w-lg" : ""}`}
    >
      <SearchIcon className="h-5 w-5 shrink-0 text-ink-soft" />
      <input
        name="q"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={`min-w-0 flex-1 bg-transparent outline-none ${variant === "hero" ? "py-2 text-[15px]" : "py-2.5 text-base"}`}
      />
      <MicButton onText={setQ} onFinal={go} size="h-10 w-10" />
      <button className="btn-dark shrink-0 px-6 py-2.5">Найти</button>
    </form>
  );
}
