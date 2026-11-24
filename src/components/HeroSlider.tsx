"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import ProductArt from "./ProductArt";
import { ChevronLeft, ChevronRight } from "./Icons";
import type { Banner } from "@/lib/types";
import { bannerThemes } from "@/lib/bannerThemes";
import { bannerImages } from "@/lib/productImages";


export default function HeroSlider({ banners }: { banners: Banner[] }) {
  const [i, setI] = useState(0);
  const n = banners.length;
  useEffect(() => {
    if (n < 2) return;
    const t = setInterval(() => setI((x) => (x + 1) % n), 6000);
    return () => clearInterval(t);
  }, [n]);
  if (!n) return null;

  return (
    <div className="relative overflow-hidden rounded-[2rem]">
      <div className="flex transition-transform duration-700 ease-out" style={{ transform: `translateX(-${i * 100}%)` }}>
        {banners.map((b) => {
          const t = bannerThemes[b.theme];
          return (
            <div key={b.id} className="relative flex min-h-[420px] w-full shrink-0 items-center lg:min-h-[520px]" style={{ background: t.bg }}>
              {b.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={b.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-90" />
              )}
              <div className="relative z-10 max-w-2xl px-8 py-12 sm:px-14 md:px-24">
                <h2 className={`h-display text-5xl leading-[1.05] sm:text-6xl lg:text-7xl ${t.text}`}>{b.title}</h2>
                <p className={`mt-5 max-w-md text-base sm:text-lg ${t.sub}`}>{b.subtitle}</p>
                <Link href={b.link} className={`btn mt-8 ${t.btn}`}>{b.buttonText}</Link>
              </div>
              {!b.image && (
                bannerImages[b.theme]?.length ? (
                <div className="pointer-events-none absolute bottom-0 right-0 top-0 hidden w-[46%] items-center justify-end gap-5 pr-12 lg:flex">
                  {bannerImages[b.theme].slice(0, 2).map((src, k) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <div key={src} className={`katy-float flex aspect-[3/4] w-[40%] max-w-[230px] items-center justify-center rounded-[1.75rem] bg-white p-5 shadow-2xl ${k ? "mt-24 [animation-delay:-3s]" : "-mt-10"}`}>
                      <img src={src} alt="" referrerPolicy="no-referrer" className="h-full w-full object-contain mix-blend-multiply brightness-[1.08] contrast-[1.03]" />
                    </div>
                  ))}
                </div>
                ) : (
                <div className="pointer-events-none absolute bottom-0 right-0 top-0 hidden w-1/2 items-end justify-center md:flex">
                  <ProductArt shape={b.artShape} color={t.art[0]} accent={t.art[1]} withBg={false} className="absolute bottom-6 right-[30%] h-[78%] drop-shadow-2xl" />
                  <ProductArt shape="flacon-tall" color={t.art[1]} accent={t.art[0]} withBg={false} className="absolute bottom-6 right-[8%] h-[58%] opacity-90 drop-shadow-xl" />
                  <div className="absolute right-[18%] top-[14%] h-40 w-40 rounded-full bg-white/20 blur-2xl" />
                </div>
                )
              )}
            </div>
          );
        })}
      </div>
      {n > 1 && (
        <>
          <button onClick={() => setI((i - 1 + n) % n)} className="absolute left-4 top-1/2 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/80 shadow md:grid" aria-label="Назад"><ChevronLeft /></button>
          <button onClick={() => setI((i + 1) % n)} className="absolute right-4 top-1/2 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/80 shadow md:grid" aria-label="Вперёд"><ChevronRight /></button>
          <div className="absolute bottom-5 left-8 flex gap-2 sm:left-14 md:left-24">
            {banners.map((b, k) => (
              <button key={b.id} onClick={() => setI(k)} aria-label={`Слайд ${k + 1}`} className={`h-1.5 rounded-full transition-all ${k === i ? "w-8 bg-current" : "w-3 bg-current/30"} ${bannerThemes[banners[i].theme].text}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
