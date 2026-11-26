import AdminNav from "@/components/admin/AdminNav";
import { getDb } from "@/lib/db";
import { logout } from "@/lib/admin-actions";
import { isAdmin, passwordKind } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = { title: "Управление магазином", robots: { index: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdmin())) redirect("/admin/login");
  const db = await getDb();
  const weak = (await passwordKind()) === "default";
  return (
    <div className="min-h-screen bg-[#f5f3ef] lg:flex">
      <AdminNav newOrders={db.orders.filter((o) => o.status === "new").length} arrived={(db.stockAlerts ?? []).filter((a) => a.notifiedAt && !a.smsSent).length} proRequests={(db.pros ?? []).filter((p) => p.status === "pending").length} />
      <div className="min-w-0 flex-1">
        <div className="flex justify-end px-6 pt-4">
          <form action={logout}><button className="text-xs text-ink-soft underline">Выйти</button></form>
        </div>
        {weak && (
          <div className="mx-4 mb-4 rounded-2xl bg-rose/10 px-5 py-3 text-sm text-rose sm:mx-8">
            <b>Поменяйте пароль админки.</b> Сейчас стоит пароль по умолчанию — его может знать кто угодно. <Link href="/admin/settings#password" className="font-semibold underline">Поменять пароль</Link>
          </div>
        )}
        <div className="px-4 pb-16 sm:px-8">{children}</div>
      </div>
    </div>
  );
}
