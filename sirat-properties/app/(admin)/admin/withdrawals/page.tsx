import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { WithdrawalQueueClient } from '@/components/admin/WithdrawalQueueClient'

export default async function AdminWithdrawalsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: dbUser } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (!dbUser || !['admin', 'super_admin', 'accounts_admin'].includes(dbUser.role)) {
    redirect('/auth/login')
  }

  const { data: requests } = await supabase
    .from('withdraw_requests')
    .select(`
      *,
      agent:users!agent_id(
        id, email,
        profiles(full_name, avatar_url, whatsapp_number)
      )
    `)
    .order('created_at', { ascending: true })

  const pending = (requests ?? []).filter((r: any) => r.status === 'pending')
  const processed = (requests ?? []).filter((r: any) => r.status !== 'pending')

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Withdrawal Requests</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Pending: <span className="font-semibold text-amber-600">{pending.length}</span>
        </p>
      </div>

      <WithdrawalQueueClient
        pending={(pending as any)}
        processed={(processed as any)}
        reviewerId={user.id}
      />
    </div>
  )
}
