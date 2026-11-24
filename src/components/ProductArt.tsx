// Векторная иллюстрация товара (флакон, баночка, помада…).
// Показывается, пока к товару не загружены настоящие фотографии.
import type { ArtShape } from "@/lib/types";

type Props = {
  shape: ArtShape;
  color: string;
  accent: string;
  bg?: string;
  label?: string;
  className?: string;
  withBg?: boolean;
};

function shade(hex: string, amt: number) {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  const clamp = (v: number) => Math.max(0, Math.min(255, v));
  const r = clamp((n >> 16) + amt), g = clamp(((n >> 8) & 255) + amt), b = clamp((n & 255) + amt);
  return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}

function isDark(hex: string) {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  const r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  return r * 0.299 + g * 0.587 + b * 0.114 < 140;
}

export default function ProductArt({ shape, color, accent, bg = "#f6efe9", label, className, withBg = true }: Props) {
  const id = `a${(shape + color + accent).replace(/[^a-z0-9]/gi, "")}`;
  const light = shade(color, 45);
  const dark = shade(color, -35);
  const accDark = shade(accent, -30);
  const accLight = shade(accent, 40);
  const textColor = isDark(color) ? "rgba(255,255,255,.85)" : "rgba(28,25,23,.75)";
  const txt = label ? label.toUpperCase().slice(0, 18) : "";

  const defs = (
    <defs>
      <linearGradient id={`${id}b`} x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stopColor={dark} />
        <stop offset=".35" stopColor={light} />
        <stop offset=".65" stopColor={color} />
        <stop offset="1" stopColor={dark} />
      </linearGradient>
      <linearGradient id={`${id}c`} x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stopColor={accDark} />
        <stop offset=".4" stopColor={accLight} />
        <stop offset="1" stopColor={accDark} />
      </linearGradient>
      <radialGradient id={`${id}s`} cx=".5" cy=".5" r=".5">
        <stop offset="0" stopColor="#000" stopOpacity=".22" />
        <stop offset="1" stopColor="#000" stopOpacity="0" />
      </radialGradient>
      <radialGradient id={`${id}bg`} cx=".5" cy=".42" r=".7">
        <stop offset="0" stopColor="#fff" stopOpacity=".9" />
        <stop offset="1" stopColor={bg} stopOpacity="1" />
      </radialGradient>
    </defs>
  );

  const shadow = <ellipse cx="100" cy="214" rx="58" ry="9" fill={`url(#${id}s)`} />;
  const shine = (x: number, y: number, h: number) => (
    <rect x={x} y={y} width="7" height={h} rx="3.5" fill="#fff" opacity=".35" />
  );
  const labelText = (y: number, size = 9) =>
    txt ? (
      <text x="100" y={y} textAnchor="middle" fontFamily="Georgia, serif" fontSize={size} letterSpacing="1.5" fill={textColor}>
        {txt}
      </text>
    ) : null;

  let body: React.ReactNode;
  switch (shape) {
    case "flacon-square":
      body = (
        <>
          {shadow}
          <rect x="88" y="44" width="24" height="16" rx="2" fill={`url(#${id}c)`} />
          <rect x="74" y="20" width="52" height="28" rx="4" fill={`url(#${id}c)`} />
          <rect x="44" y="62" width="112" height="150" rx="14" fill={`url(#${id}b)`} />
          <rect x="50" y="68" width="100" height="138" rx="10" fill="#fff" opacity=".08" />
          {shine(56, 76, 110)}
          <rect x="64" y="128" width="72" height="30" rx="2" fill="#fff" opacity={isDark(color) ? 0.08 : 0.35} />
          {labelText(147)}
        </>
      );
      break;
    case "flacon-round":
      body = (
        <>
          {shadow}
          <rect x="89" y="54" width="22" height="18" rx="2" fill={`url(#${id}c)`} />
          <ellipse cx="100" cy="40" rx="24" ry="18" fill={`url(#${id}c)`} />
          <circle cx="100" cy="146" r="70" fill={`url(#${id}b)`} />
          <ellipse cx="76" cy="118" rx="12" ry="26" fill="#fff" opacity=".3" transform="rotate(25 76 118)" />
          {labelText(152)}
        </>
      );
      break;
    case "flacon-tall":
      body = (
        <>
          {shadow}
          <rect x="84" y="14" width="32" height="40" rx="5" fill={`url(#${id}c)`} />
          <rect x="91" y="52" width="18" height="10" fill={`url(#${id}c)`} />
          <rect x="62" y="60" width="76" height="152" rx="10" fill={`url(#${id}b)`} />
          {shine(70, 70, 125)}
          {labelText(140, 8)}
        </>
      );
      break;
    case "jar":
      body = (
        <>
          {shadow}
          <rect x="38" y="96" width="124" height="116" rx="18" fill={`url(#${id}b)`} />
          <rect x="34" y="76" width="132" height="34" rx="8" fill={`url(#${id}c)`} />
          {shine(48, 118, 74)}
          {labelText(168)}
        </>
      );
      break;
    case "tube":
      body = (
        <>
          {shadow}
          <path d="M58 22 h84 l-6 150 h-72 z" fill={`url(#${id}b)`} />
          <rect x="54" y="16" width="92" height="12" rx="3" fill={dark} />
          <rect x="72" y="170" width="56" height="42" rx="6" fill={`url(#${id}c)`} />
          {shine(70, 36, 110)}
          {labelText(104, 8)}
        </>
      );
      break;
    case "dropper":
      body = (
        <>
          {shadow}
          <ellipse cx="100" cy="24" rx="13" ry="14" fill={`url(#${id}c)`} />
          <rect x="86" y="32" width="28" height="40" rx="4" fill={`url(#${id}c)`} />
          <rect x="56" y="74" width="88" height="138" rx="20" fill={`url(#${id}b)`} />
          <rect x="94" y="70" width="12" height="60" rx="5" fill="#fff" opacity=".18" />
          {shine(66, 92, 96)}
          {labelText(160, 8)}
        </>
      );
      break;
    case "pump":
      body = (
        <>
          {shadow}
          <rect x="60" y="22" width="48" height="10" rx="4" fill={`url(#${id}c)`} />
          <rect x="94" y="28" width="12" height="30" fill={`url(#${id}c)`} />
          <rect x="82" y="56" width="36" height="20" rx="4" fill={`url(#${id}c)`} />
          <rect x="54" y="74" width="92" height="138" rx="16" fill={`url(#${id}b)`} />
          {shine(64, 88, 106)}
          {labelText(150, 8)}
        </>
      );
      break;
    case "lipstick":
      body = (
        <>
          {shadow}
          <path d="M80 70 L80 38 Q100 14 120 30 L120 70 z" fill={`url(#${id}b)`} />
          <rect x="74" y="68" width="52" height="26" rx="2" fill={`url(#${id}c)`} />
          <rect x="70" y="92" width="60" height="120" rx="4" fill="#1c1917" />
          <rect x="76" y="100" width="6" height="104" rx="3" fill="#fff" opacity=".15" />
          <rect x="70" y="150" width="60" height="4" fill={`url(#${id}c)`} />
        </>
      );
      break;
    case "compact":
      body = (
        <>
          {shadow}
          <rect x="32" y="70" width="136" height="142" rx="12" fill={`url(#${id}b)`} />
          <rect x="32" y="128" width="136" height="16" fill={`url(#${id}c)`} />
          <path d="M100 128 c-14 -26 -40 -18 -30 -4 c6 8 22 6 30 4 z M100 128 c14 -26 40 -18 30 -4 c-6 8 -22 6 -30 4 z" fill={`url(#${id}c)`} />
          {shine(42, 80, 120)}
          {labelText(186)}
        </>
      );
      break;
    case "palette":
      body = (
        <>
          {shadow}
          <rect x="30" y="64" width="140" height="148" rx="12" fill="#1c1917" />
          {[0, 1, 2, 3].map((i) => (
            <circle key={i} cx={68 + (i % 2) * 64} cy={110 + Math.floor(i / 2) * 60} r="24" fill={shade(color, (i - 1.5) * 22)} />
          ))}
          <rect x="30" y="64" width="140" height="10" rx="5" fill={`url(#${id}c)`} />
        </>
      );
      break;
  }

  return (
    <svg viewBox="0 0 200 240" className={className} role="img" aria-label={label || "товар"} preserveAspectRatio="xMidYMid meet">
      {defs}
      {withBg && <rect width="200" height="240" fill={`url(#${id}bg)`} />}
      {body}
    </svg>
  );
}
