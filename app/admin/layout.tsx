import { AdminShell } from "@/components/admin/admin-shell"
import { requireAdminSession } from "@/lib/admin-session"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const admin = await requireAdminSession()

  return <AdminShell admin={admin}>{children}</AdminShell>
}
