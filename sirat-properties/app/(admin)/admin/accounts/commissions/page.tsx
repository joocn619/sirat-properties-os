import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CommissionQueueClient } from '@/components/admin/CommissionQueueClient'

export default async function CommissionApprovalPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: dbUser } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (!dbUser || !['admin', 'super_admin', 'accounts_admin'].includes(dbUser.role)) redirect('/admin/dashboard')

  const { data: deals } = await supabase
    .from('commission_deals')
    .select(`
      id, commission_type, commission_value, status, created_at,
      properties(title, price),
      seller:users!seller_id(profiles(full_name)),
      agent:users!agent_id(profiles(full_name))
    `)
    .in('status', ['accepted', 'released'])
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Commission Approval</h1>
        <p className="text-sm text-gray-500 mt-1">Accepted deal-গুলো approve ও release করুন</p>
      </div>
      <CommissionQueueClient initialDeals={(deals ?? []) as any} currentUserId={user.id} />
    </div>
  )
}
