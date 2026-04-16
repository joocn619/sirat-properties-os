import { DashboardShell } from '@/components/layout/DashboardShell'
import { requireDashboardSession } from '@/lib/dashboard'

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await requireDashboardSession('admin')

  return (
    <DashboardShell
      avatarUrl={session.avatarUrl}
      latestNotifications={session.latestNotifications}
      role="admin"
      roleLabel="Admin"
      unreadNotifications={session.unreadNotifications}
      userEmail={session.email}
      userName={session.displayName}
    >
      {children}
    </DashboardShell>
  )
}
