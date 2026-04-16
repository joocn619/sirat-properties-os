import { requireDashboardSession } from '@/lib/dashboard'
import { DashboardPageHeader } from '@/components/layout/DashboardPageHeader'
import { BillingClient } from './BillingClient'

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>
}) {
  const { supabase, userId } = await requireDashboardSession('seller')
  const params = await searchParams

  // Fetch plans
  const { data: plans } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')

  // Fetch current subscription
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*, subscription_plans(*)')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  // Fetch payment history
  const { data: payments } = await supabase
    .from('payments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20)

  return (
    <>
      <DashboardPageHeader
        title="Billing & Subscription"
        description="Manage your plan, view payment history, and upgrade your workspace."
      />

      {params.success && (
        <div className="mb-6 rounded-2xl border border-[rgba(16,185,129,0.2)] bg-[rgba(16,185,129,0.06)] px-4 py-3 text-sm text-[#10b981]">
          Payment successful! Your plan has been activated.
        </div>
      )}
      {params.error && (
        <div className="mb-6 rounded-2xl border border-[rgba(244,63,94,0.2)] bg-[rgba(244,63,94,0.06)] px-4 py-3 text-sm text-[#f43f5e]">
          Payment {params.error === 'cancel' ? 'was cancelled' : 'failed'}. Please try again.
        </div>
      )}

      <BillingClient
        plans={plans ?? []}
        currentSubscription={subscription as any}
        payments={payments ?? []}
      />
    </>
  )
}
