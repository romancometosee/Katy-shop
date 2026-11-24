/* eslint-disable @next/next/no-img-element */
// «Веер» из фото товаров: средний флакон спереди, два по бокам.
// При наведении на родительский блок (класс group) веер плавно раскрывается.
// Белый фон снимков растворяется в цвете плитки (mix-blend-multiply).

export default function PhotoFan({ images, className = "" }: { images: string[]; className?: string }) {
  const [a, b, c] = images;
  if (!a) return null;
  const img = "absolute bottom-0 h-full w-[46%] object-contain mix-blend-multiply transition duration-700 ease-out";
  return (
    <div className={`pointer-events-none relative ${className}`}>
      {b && (
        <img src={b} alt="" loading="lazy" referrerPolicy="no-referrer"
          className={`${img} left-[4%] origin-bottom -rotate-[8deg] scale-[.82] opacity-90 group-hover:-translate-x-[6%] group-hover:-rotate-[13deg]`} />
      )}
      {c && (
        <img src={c} alt="" loading="lazy" referrerPolicy="no-referrer"
          className={`${img} right-[4%] origin-bottom rotate-[8deg] scale-[.82] opacity-90 group-hover:translate-x-[6%] group-hover:rotate-[13deg]`} />
      )}
      <img src={a} alt="" loading="lazy" referrerPolicy="no-referrer"
        className={`${img} left-1/2 z-10 -translate-x-1/2 group-hover:-translate-y-[4%] group-hover:scale-105`} />
    </div>
  );
}
