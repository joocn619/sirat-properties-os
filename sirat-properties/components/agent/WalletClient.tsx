'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function WalletClient({ balance, transactions, withdrawals, agentId }: {
  balance: number
  transactions: any[]
  withdrawals: any[]
  agentId: string
}) {
  const [tab, setTab] = useState<'txns' | 'withdraw'>('txns')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ amount: '', bank_name: '', account_number: '', account_name: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()
  const router = useRouter()

  async function requestWithdraw(e: React.FormEvent) {
    e.preventDefault()
    const amt = Number(form.amount)
    if (!amt || amt <= 0) return setError('Valid amount দিন')
    if (amt > balance) return setError('Balance এর বেশি withdraw করা যাবে না')
    if (!form.bank_name || !form.account_number || !form.account_name)
      return setError('সব তথ্য দিন')

    setLoading(true)
    setError('')
    const { error: err } = await supabase.from('withdraw_requests').insert({
      agent_id: agentId,
      amount: amt,
      bank_name: form.bank_name,
      account_number: form.account_number,
      account_name: form.account_name,
      status: 'pending',
    })

    if (err) setError(err.message)
    else {
      setShowForm(false)
      setForm({ amount: '', bank_name: '', account_number: '', account_name: '' })
      router.refresh()
    }
    setLoading(false)
  }

  const STATUS_STYLE: Record<string, string> = {
    pending:  'bg-amber-100 text-amber-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-600',
  }

  return (
    <div>
      {/* Balance card */}
      <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-6 text-white mb-6">
        <p className="text-sm text-green-200">Available Balance</p>
        <p className="text-4xl font-bold mt-1">৳{balance.toLocaleString()}</p>
        <button
          onClick={() => setShowForm(!showForm)}
          disabled={balance <= 0}
          className="mt-4 px-5 py-2 bg-white text-green-700 rounded-xl text-sm font-semibold hover:bg-green-50 disabled:opacity-50"
        >
          Withdraw Request
        </button>
      </div>

      {/* Withdraw form */}
      {showForm && (
        <form onSubmit={requestWithdraw} className="bg-white border rounded-xl p-5 mb-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Withdraw Request</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-600">Amount (৳)</label>
              <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
                className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" placeholder="0" max={balance} />
            </div>
            <div>
              <label className="text-xs text-gray-600">Bank Name</label>
              <input value={form.bank_name} onChange={e => setForm({ ...form, bank_name: e.target.value })}
                className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" placeholder="e.g. bKash, DBBL" />
            </div>
            <div>
              <label className="text-xs text-gray-600">Account Number</label>
              <input value={form.account_number} onChange={e => setForm({ ...form, account_number: e.target.value })}
                className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-600">Account Name</label>
              <input value={form.account_name} onChange={e => setForm({ ...form, account_name: e.target.value })}
                className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          {error && <p className="text-xs text-red-600 bg-red-50 p-2 rounded-lg">{error}</p>}
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
            <button type="submit" disabled={loading}
              className="px-5 py-2 text-sm bg-green-600 text-white rounded-xl font-medium hover:bg-green-700">
              {loading ? '...' : 'Submit করুন'}
            </button>
          </div>
        </form>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-xl w-fit">
        {(['txns', 'withdraw'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
            }`}>
            {t === 'txns' ? `Transactions (${transactions.length})` : `Withdrawals (${withdrawals.length})`}
          </button>
        ))}
      </div>

      {/* Transactions */}
      {tab === 'txns' && (
        <div className="bg-white border rounded-xl divide-y">
          {!transactions.length && (
            <div className="text-center py-12 text-gray-400">
              <p className="text-3xl mb-2">💰</p>
              <p className="text-sm">এখনো কোনো transaction নেই</p>
            </div>
          )}
          {transactions.map((t: any) => (
            <div key={t.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium text-gray-900">{t.description}</p>
                <p className="text-xs text-gray-400">{new Date(t.created_at).toLocaleDateString('bn-BD')}</p>
              </div>
              <span className={`font-semibold ${t.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                {t.type === 'credit' ? '+' : '-'}৳{Number(t.amount).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Withdrawals */}
      {tab === 'withdraw' && (
        <div className="space-y-3">
          {!withdrawals.length && (
            <div className="text-center py-12 text-gray-400 border-2 border-dashed rounded-xl">
              <p className="text-3xl mb-2">🏦</p>
              <p className="text-sm">এখনো কোনো withdrawal request নেই</p>
            </div>
          )}
          {withdrawals.map((w: any) => (
            <div key={w.id} className="bg-white border rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">৳{Number(w.amount).toLocaleString()}</p>
                <p className="text-xs text-gray-500">{w.bank_name} — {w.account_number}</p>
                <p className="text-xs text-gray-400">{new Date(w.created_at).toLocaleDateString('bn-BD')}</p>
              </div>
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${STATUS_STYLE[w.status]}`}>
                {w.status === 'pending' ? 'Pending' : w.status === 'approved' ? 'Approved ✓' : 'Rejected'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
