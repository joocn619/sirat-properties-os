import { requireDashboardSession } from '@/lib/dashboard'
import { redirect } from 'next/navigation'
import { AgentListingsBrowser } from '@/components/agent/AgentListingsBrowser'

export default async function AgentListingsPage() {
  const { supabase, userId } = await requireDashboardSession('agent')
  const user = { id: userId }
  // Check KYC approved
  const { data: kyc } = await supabase
    .from('kyc_documents')
    .select('status')
    .eq('user_id', user.id)
    .single()

  // Available properties (not yet applied by this agent)
  const { data: applied } = await supabase
    .from('agent_listings')
    .select('property_id')
    .eq('agent_id', user.id)

  const appliedIds = (applied ?? []).map((a: any) => a.property_id)

  let query = supabase
    .from('properties')
    .select(`
      id, title, property_type, listing_type, price, location, district,
      property_images(url, is_primary),
      users!seller_id(profiles(full_name))
    `)
    .eq('is_published', true)
    .eq('status', 'available')
    .order('created_at', { ascending: false })

  if (appliedIds.length > 0) {
    query = (query as any).not('id', 'in', `(${appliedIds.join(',')})`)
  }

  const { data: listings } = await query

  // Already applied
  const { data: applications } = await supabase
    .from('agent_listings')
    .select(`
      id, status, created_at,
      properties(id, title, location, district, price, property_images(url, is_primary))
    `)
    .eq('agent_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Available Listings</h1>
        <p className="text-gray-500 mt-1 text-sm">Property-এ apply করুন এবং commission earn করুন</p>
      </div>

      {kyc?.status !== 'approved' && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-sm text-amber-800 font-medium">KYC Approved হলে Apply করতে পারবেন</p>
          <p className="text-xs text-amber-600 mt-0.5">বর্তমান status: {kyc?.status ?? 'submitted'}</p>
        </div>
      )}

      <AgentListingsBrowser
        listings={(listings as any) ?? []}
        applications={(applications as any) ?? []}
        canApply={kyc?.status === 'approved'}
        agentId={user.id}
      />
    </div>
  )
}
