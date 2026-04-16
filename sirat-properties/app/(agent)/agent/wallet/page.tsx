import { requireDashboardSession } from '@/lib/dashboard'
import { redirect } from 'next/navigation'
import { WalletClient } from '@/components/agent/WalletClient'

export default async function AgentWalletPage() {
  const { supabase, userId } = await requireDashboardSession('agent')
  const user = { id: userId }
  const { data: txns } = await supabase
    .from('wallet_transactions')
    .select('*')
    .eq('agent_id', user.id)
    .order('created_at', { ascending: false })

  const { data: withdrawals } = await supabase
    .from('withdraw_requests')
    .select('*')
    .eq('agent_id', user.id)
    .order('created_at', { ascending: false })

  const balance = (txns ?? []).reduce((sum: number, t: any) => {
    return t.type === 'credit' ? sum + Number(t.amount) : sum - Number(t.amount)
  }, 0)

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Wallet</h1>
        <p className="text-gray-500 mt-1 text-sm">আপনার commission earnings এবং withdrawals</p>
      </div>

      <WalletClient
        balance={balance}
        transactions={(txns as any) ?? []}
        withdrawals={(withdrawals as any) ?? []}
        agentId={user.id}
      />
    </div>
  )
}
