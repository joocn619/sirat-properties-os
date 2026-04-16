import { SellerAgentManager } from '@/components/agent/SellerAgentManager'
import { DashboardPageHeader } from '@/components/layout/DashboardPageHeader'
import { DashboardPanel } from '@/components/ui/DashboardPanel'
import { requireDashboardSession } from '@/lib/dashboard'

export default async function SellerAgentsPage() {
  const { supabase, userId } = await requireDashboardSession('seller')

  const { data: applications } = await supabase
    .from('agent_listings')
    .select(`
      id, status, created_at,
      properties!inner(id, title, seller_id),
      agents:users!agent_id(
        id, email,
        profiles(full_name, avatar_url, whatsapp_number),
        kyc_documents(status)
      )
    `)
    .eq('properties.seller_id', userId)
    .order('created_at', { ascending: false })

  const { data: deals } = await supabase
    .from('commission_deals')
    .select(`
      id, status, commission_type, commission_value, deadline, counter_type, counter_value, created_at,
      properties(id, title),
      agent:users!agent_id(email, profiles(full_name, avatar_url))
    `)
    .eq('seller_id', userId)
    .order('created_at', { ascending: false })

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <DashboardPageHeader
        eyebrow="Agent management"
        title="Review partners and structure commission deals"
        description="Approve trusted agents, reject weak matches, and move approved relationships into a polished commercial negotiation flow."
      />

      <DashboardPanel>
        <SellerAgentManager
          applications={(applications as any) ?? []}
          deals={(deals as any) ?? []}
          sellerId={userId}
        />
      </DashboardPanel>
    </div>
  )
}
