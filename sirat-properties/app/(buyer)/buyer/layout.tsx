import { DashboardShell } from '@/components/layout/DashboardShell'
import { requireDashboardSession } from '@/lib/dashboard'
import { CompareProvider } from '@/components/property/CompareContext'
import { CompareBar } from '@/components/property/CompareBar'

export default async function BuyerLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await requireDashboardSession('buyer')

  return (
    <CompareProvider>
      <DashboardShell
        avatarUrl={session.avatarUrl}
        latestNotifications={session.latestNotifications}
        role="buyer"
        roleLabel="Buyer"
        unreadNotifications={session.unreadNotifications}
        userEmail={session.email}
        userName={session.displayName}
      >
        {children}
      </DashboardShell>
      <CompareBar />
    </CompareProvider>
  )
}
