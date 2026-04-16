'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Deal {
  id: string
  commission_type: string
  commission_value: number
  status: string
  created_at: string
  properties: { title: string; price: number } | null
  seller: { profiles: { full_name: string | null } | null } | null
  agent: { profiles: { full_name: string | null } | null } | null
}

export function CommissionQueueClient({
  initialDeals,
  currentUserId,
}: {
  initialDeals: Deal[]
  currentUserId: string
}) {
  const [deals, setDeals] = useState<Deal[]>(initialDeals)
  const [releasing, setReleasing] = useState<string | null>(null)
  const supabase = createClient()

  const pending = deals.filter(d => d.status === 'accepted')
  const released = deals.filter(d => d.status === 'released')

  function calcAmount(d: Deal) {
    if (d.commission_type === 'percentage') {
      return (Number(d.properties?.price ?? 0) * d.commission_value) / 100
    }
    return d.commission_value
  }

  async function release(deal: Deal) {
    setReleasing(deal.id)
    const amount = calcAmount(deal)

    // Credit wallet
    await supabase.from('wallet_transactions').insert({
      agent_id: (deals.find(d => d.id === deal.id) as any)?.agent_user_id,
      type: 'credit',
      amount,
      description: 'Commission payment',
      reference_id: deal.id,
    })

    // Update deal status
    await supabase.from('commission_deals').update({ status: 'released' }).eq('id', deal.id)

    // Ledger entry
    await supabase.from('ledger').insert({
      type: 'expense',
      amount,
      description: 'Agent commission released',
      reference_id: deal.id,
      recorded_by: currentUserId,
      transaction_date: new Date().toISOString().split('T')[0],
    })

    setDeals(prev => prev.map(d => d.id === deal.id ? { ...d, status: 'released' } : d))
    setReleasing(null)
  }

  return (
    <div>
      {pending.length > 0 && (
        <div className="mb-8">
          <h2 className="font-semibold text-gray-900 mb-3">Pending Release ({pending.length})</h2>
          <div className="space-y-3">
            {pending.map(d => {
              const amount = calcAmount(d)
              return (
                <div key={d.id} className="bg-white border rounded-xl p-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{d.properties?.title ?? '—'}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Seller: {d.seller?.profiles?.full_name ?? '—'} →
                      Agent: {d.agent?.profiles?.full_name ?? '—'}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-gray-900">
                      {d.commission_type === 'percentage'
                        ? `${d.commission_value}% (≈৳${amount.toLocaleString()})`
                        : `৳${amount.toLocaleString()}`}
                    </p>
                    <p className="text-xs text-gray-400">{d.commission_type}</p>
                  </div>
                  <button
                    onClick={() => release(d)}
                    disabled={releasing === d.id}
                    className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 shrink-0"
                  >
                    {releasing === d.id ? '...' : 'Release ৳'}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {released.length > 0 && (
        <div>
          <h2 className="font-semibold text-gray-900 mb-3">Released ({released.length})</h2>
          <div className="space-y-2">
            {released.map(d => (
              <div key={d.id} className="bg-gray-50 border rounded-xl p-4 flex items-center gap-4 opacity-70">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 text-sm">{d.properties?.title ?? '—'}</p>
                  <p className="text-xs text-gray-400">Agent: {d.agent?.profiles?.full_name ?? '—'}</p>
                </div>
                <p className="font-medium text-gray-700">
                  {d.commission_type === 'percentage' ? `${d.commission_value}%` : `৳${Number(d.commission_value).toLocaleString()}`}
                </p>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">✓ Released</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!deals.length && (
        <div className="text-center py-16 border-2 border-dashed rounded-xl text-gray-400">
          <p className="text-4xl mb-3">💰</p>
          <p>কোনো commission deal নেই</p>
        </div>
      )}
    </div>
  )
}
