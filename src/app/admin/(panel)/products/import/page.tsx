import { PageHead } from "@/components/admin/ui";
import ExcelImport, { ExportButton } from "@/components/admin/ExcelImport";

export const metadata = { title: "Загрузка из Excel" };

export default function ImportPage() {
  return (
    <div>
      <PageHead title="Загрузка из Excel" desc="Добавляйте сразу много товаров и обновляйте цены и остатки одной таблицей. Товар сайт узнаёт по артикулу: если артикул уже есть — обновит, если нет — добавит новый." />
      <div className="-mt-4 mb-6"><ExportButton /></div>
      <ExcelImport />
    </div>
  );
}
