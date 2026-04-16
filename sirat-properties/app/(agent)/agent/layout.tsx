import { DashboardShell } from '@/components/layout/DashboardShell'
import { requireDashboardSession } from '@/lib/dashboard'

export default async function AgentLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await requireDashboardSession('agent')

  return (
    <DashboardShell
      avatarUrl={session.avatarUrl}
      latestNotifications={session.latestNotifications}
      role="agent"
      roleLabel="Agent"
      unreadNotifications={session.unreadNotifications}
      userEmail={session.email}
      userName={session.displayName}
    >
      {children}
    </DashboardShell>
  )
}
