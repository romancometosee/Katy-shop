import AdminNav from "@/components/admin/AdminNav";
import { getDb } from "@/lib/db";
import { logout } from "@/lib/admin-actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Управление магазином", robots: { index: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const db = await getDb();
  return (
    <div className="min-h-screen bg-[#f5f3ef] lg:flex">
      <AdminNav newOrders={db.orders.filter((o) => o.status === "new").length} arrived={(db.stockAlerts ?? []).filter((a) => a.notifiedAt && !a.smsSent).length} />
      <div className="min-w-0 flex-1">
        <div className="flex justify-end px-6 pt-4">
          <form action={logout}><button className="text-xs text-ink-soft underline">Выйти</button></form>
        </div>
        <div className="px-4 pb-16 sm:px-8">{children}</div>
      </div>
    </div>
  );
}
