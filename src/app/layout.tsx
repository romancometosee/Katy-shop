import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";
import { SITE_URL } from "@/lib/site";

const cormorant = Cormorant_Garamond({ subsets: ["latin", "cyrillic"], weight: ["400", "500", "600"], variable: "--font-cormorant" });
const manrope = Manrope({ subsets: ["latin", "cyrillic"], variable: "--font-manrope" });

export const metadata: Metadata = {
  title: { default: "Katy — парфюмерия и косметика", template: "%s · Katy" },
  description: "Оригинальная парфюмерия и косметика: уход, макияж, волосы, ногти, подбор аромата и подарок в каждом заказе.",
  metadataBase: new URL(SITE_URL),
  // как ссылка на сайт выглядит в WhatsApp, Telegram, ВКонтакте
  openGraph: { type: "website", locale: "ru_RU", siteName: "Katy", title: "Katy — парфюмерия и косметика", description: "Оригинальная парфюмерия и косметика любимых брендов. Подарок в каждом заказе." },
  appleWebApp: { title: "Katy", capable: true, statusBarStyle: "default" },
};

export const viewport = { themeColor: "#f9f6f1" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${cormorant.variable} ${manrope.variable}`}>
      <head>
        {/* если картинка не загрузилась (сайт бренда недоступен) — прячем значок «сломанной картинки» */}
        <script dangerouslySetInnerHTML={{ __html: `document.addEventListener("error",function(e){var t=e.target;if(t&&t.tagName==="IMG"&&!t.dataset.keep)t.style.visibility="hidden"},true)` }} />
      </head>
      <body className="font-sans">{children}</body>
    </html>
  );
}
