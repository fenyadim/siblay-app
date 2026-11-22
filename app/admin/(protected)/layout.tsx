import { redirect } from "next/navigation"
import { AdminSidebar } from "@/components/admin/AdminSidebar"
import { hasCurrentAdminSession } from "@/lib/admin-session"

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  if (!await hasCurrentAdminSession()) {
    redirect("/admin/login")
  }

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />
      <main className="flex-1 min-w-0 p-6 lg:p-8">{children}</main>
    </div>
  )
}
