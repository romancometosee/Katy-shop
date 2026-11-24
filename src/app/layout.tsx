import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({ subsets: ["latin", "cyrillic"], weight: ["400", "500", "600"], variable: "--font-cormorant" });
const manrope = Manrope({ subsets: ["latin", "cyrillic"], variable: "--font-manrope" });

export const metadata: Metadata = {
  title: { default: "Katy — парфюмерия и косметика", template: "%s · Katy" },
  description: "Оригинальная парфюмерия и косметика: более 5000 ароматов, подбор аромата и подарок в каждом заказе.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${cormorant.variable} ${manrope.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
