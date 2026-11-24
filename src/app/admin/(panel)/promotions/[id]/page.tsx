import Link from "next/link";
import { notFound } from "next/navigation";
import PromotionForm from "@/components/admin/PromotionForm";
import { PageHead } from "@/components/admin/ui";
import { getDb } from "@/lib/db";
import { subcategoriesOf, topCategories } from "@/lib/catalog";
import { PROMO_TEMPLATES, templateDates } from "@/lib/promo-templates";
import { KIND_NAMES, promoHeadline } from "@/lib/promo";
import type { Promotion } from "@/lib/types";

export default async function EditPromotion({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ t?: string }> }) {
  const { id } = await params;
  const { t } = await searchParams;
  const db = await getDb();
  const promo = id === "new" ? undefined : db.promotions.find((p) => p.id === id);
  if (id !== "new" && !promo) notFound();

  // новая акция: сначала выбираем шаблон
  if (id === "new" && !t) {
    return (
      <div>
        <Link href="/admin/promotions" className="text-sm text-ink-soft hover:underline">← Все акции</Link>
        <PageHead title="Новая акция" desc="Выберите готовый шаблон: название, механика, цвет и даты заполнятся сами. Останется выбрать товары и сохранить." />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {PROMO_TEMPLATES.map((tp) => (
            <Link key={tp.id} href={`/admin/promotions/new?t=${tp.id}`} className="group flex flex-col overflow-hidden rounded-3xl border border-line bg-white transition hover:-translate-y-0.5 hover:shadow-lg">
              <div className="flex items-end justify-between p-5 text-white" style={{ background: tp.preset.color }}>
                <p className="h-display text-4xl">{promoHeadline(tp.preset as Promotion)}</p>
                <span className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold">{KIND_NAMES[tp.preset.kind ?? "percent"]}</span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <p className="text-lg font-semibold">{tp.name}</p>
                <p className="mt-1 flex-1 text-sm text-ink-soft">{tp.hint}</p>
                <p className="mt-3 text-xs text-ink-soft">Когда: {tp.when}</p>
              </div>
            </Link>
          ))}
          <Link href="/admin/promotions/new?t=blank" className="grid min-h-48 place-items-center rounded-3xl border-2 border-dashed border-line p-6 text-center text-ink-soft transition hover:border-ink/30 hover:text-ink">
            <span><b className="block text-lg">Пустая акция</b>Заполнить всё самому</span>
          </Link>
        </div>
      </div>
    );
  }

  const tpl = PROMO_TEMPLATES.find((x) => x.id === t);
  const preset: Partial<Promotion> | undefined = tpl ? { ...tpl.preset, ...templateDates(tpl) } : undefined;
  const brandName = (bid: string) => db.brands.find((b) => b.id === bid)?.name ?? "";
  return (
    <div>
      <Link href={promo ? "/admin/promotions" : "/admin/promotions/new"} className="text-sm text-ink-soft hover:underline">← {promo ? "Все акции" : "Шаблоны"}</Link>
      <PageHead title={promo ? promo.title : tpl ? `Новая акция: ${tpl.name}` : "Новая акция"} />
      <PromotionForm
        promo={promo}
        preset={preset}
        categories={topCategories(db).flatMap((c) => [c, ...subcategoriesOf(db, c.id)])}
        brands={[...db.brands].sort((a, b) => a.name.localeCompare(b.name))}
        products={db.products.map((p) => ({ ...p, brandName: brandName(p.brandId) }))}
      />
    </div>
  );
}
