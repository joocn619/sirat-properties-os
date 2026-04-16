import { requireDashboardSession } from '@/lib/dashboard'
import { redirect } from 'next/navigation'
import { AgentCommissionsClient } from '@/components/agent/AgentCommissionsClient'

export default async function AgentCommissionsPage() {
  const { supabase, userId } = await requireDashboardSession('agent')
  const user = { id: userId }
  const { data: deals } = await supabase
    .from('commission_deals')
    .select(`
      id, status, commission_type, commission_value, deadline, counter_type, counter_value, created_at,
      properties(id, title, location, district, price, property_images(url, is_primary)),
      seller:users!seller_id(email, profiles(full_name))
    `)
    .eq('agent_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Commission Deals</h1>
        <p className="text-gray-500 mt-1 text-sm">Seller-এর offers দেখুন এবং সিদ্ধান্ত নিন</p>
      </div>

      <AgentCommissionsClient deals={(deals as any) ?? []} agentId={user.id} />
    </div>
  )
}
