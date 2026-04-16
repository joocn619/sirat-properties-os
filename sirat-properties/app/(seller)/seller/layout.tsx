import { DashboardShell } from '@/components/layout/DashboardShell'
import { requireDashboardSession } from '@/lib/dashboard'

export default async function SellerLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await requireDashboardSession('seller')

  return (
    <DashboardShell
      avatarUrl={session.avatarUrl}
      latestNotifications={session.latestNotifications}
      role="seller"
      roleLabel="Seller"
      unreadNotifications={session.unreadNotifications}
      userEmail={session.email}
      userName={session.displayName}
    >
      {children}
    </DashboardShell>
  )
}
