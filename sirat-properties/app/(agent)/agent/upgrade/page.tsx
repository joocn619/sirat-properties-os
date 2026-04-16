import { requireDashboardSession } from '@/lib/dashboard'
import { DashboardPageHeader } from '@/components/layout/DashboardPageHeader'
import { AgentPremiumClient } from './AgentPremiumClient'

export default async function AgentUpgradePage() {
  const { supabase, userId } = await requireDashboardSession('agent')

  const { data: user } = await supabase
    .from('users')
    .select('is_premium, premium_until')
    .eq('id', userId)
    .single()

  return (
    <>
      <DashboardPageHeader
        title="Premium Account"
        description="Unlock more listings, priority placement, and advanced features."
      />
      <AgentPremiumClient
        isPremium={user?.is_premium ?? false}
        premiumUntil={user?.premium_until ?? null}
      />
    </>
  )
}
