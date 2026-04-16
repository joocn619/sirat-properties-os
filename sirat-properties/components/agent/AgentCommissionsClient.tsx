'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const STATUS_STYLE: Record<string, string> = {
  pending:   'bg-amber-100 text-amber-700',
  accepted:  'bg-green-100 text-green-700',
  rejected:  'bg-red-100 text-red-600',
  countered: 'bg-purple-100 text-purple-700',
}

export function AgentCommissionsClient({ deals, agentId }: { deals: any[]; agentId: string }) {
  const [loading, setLoading] = useState<string | null>(null)
  const [counterForm, setCounterForm] = useState<{ id: string; type: string; value: number } | null>(null)
  const supabase = createClient()
  const router = useRouter()

  async function respond(dealId: string, action: 'accepted' | 'rejected', counter?: { type: string; value: number }) {
    setLoading(dealId)
    const update: Record<string, unknown> = { status: action }
    if (counter && action === 'rejected') {
      update.counter_type = counter.type
      update.counter_value = counter.value
      update.status = 'countered'
    }
    await supabase.from('commission_deals').update(update).eq('id', dealId)
    setLoading(null)
    setCounterForm(null)
    router.refresh()
  }

  const pending = deals.filter(d => d.status === 'pending')
  const others = deals.filter(d => d.status !== 'pending')

  return (
    <div className="space-y-6">
      {!deals.length && (
        <div className="text-center py-16 border-2 border-dashed rounded-xl text-gray-400">
          <p className="text-4xl mb-3">🤝</p>
          <p>এখনো কোনো commission deal নেই</p>
          <p className="text-sm mt-1">Seller approved করলে deal offer করবে</p>
        </div>
      )}

      {pending.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-amber-700 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse inline-block" />
            New Offers ({pending.length})
          </h2>
          <div className="space-y-4">
            {pending.map((deal: any) => (
              <DealCard
                key={deal.id}
                deal={deal}
                loading={loading}
                counterForm={counterForm}
                onAccept={() => respond(deal.id, 'accepted')}
                onReject={() => respond(deal.id, 'rejected')}
                onCounter={() => setCounterForm({ id: deal.id, type: 'percentage', value: 3 })}
                onSubmitCounter={() => counterForm && respond(deal.id, 'rejected', { type: counterForm.type, value: counterForm.value })}
                onCounterChange={setCounterForm}
                onCancelCounter={() => setCounterForm(null)}
              />
            ))}
          </div>
        </div>
      )}

      {others.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-600 mb-3">Previous Deals</h2>
          <div className="space-y-3">
            {others.map((deal: any) => (
              <DealCard key={deal.id} deal={deal} loading={loading} counterForm={null}
                onAccept={() => {}} onReject={() => {}} onCounter={() => {}}
                onSubmitCounter={() => {}} onCounterChange={() => {}} onCancelCounter={() => {}} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function DealCard({ deal, loading, counterForm, onAccept, onReject, onCounter, onSubmitCounter, onCounterChange, onCancelCounter }: any) {
  const prop = deal.properties
  const img = prop?.property_images?.find((i: any) => i.is_primary)?.url ?? prop?.property_images?.[0]?.url
  const isPending = deal.status === 'pending'

  const commissionDisplay = (type: string, value: number) =>
    type === 'percentage' ? `${value}%` : `৳${Number(value).toLocaleString()}`

  return (
    <div className="bg-white border rounded-xl overflow-hidden">
      <div className="flex">
        <div className="w-28 bg-gray-100 shrink-0">
          {img
            ? <img src={img} alt="" className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-3xl">🏠</div>
          }
        </div>
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold text-gray-900">{prop?.title}</p>
              <p className="text-xs text-gray-500">{[prop?.location, prop?.district].filter(Boolean).join(', ')}</p>
              <p className="text-sm font-bold text-gray-900 mt-1">
                Commission: {commissionDisplay(deal.commission_type, deal.commission_value)}
              </p>
              <p className="text-xs text-gray-400">Deadline: {deal.deadline}</p>
              {deal.status === 'countered' && (
                <p className="text-xs text-purple-600 mt-0.5">
                  আপনার counter: {commissionDisplay(deal.counter_type, deal.counter_value)}
                </p>
              )}
            </div>
            <span className={`text-xs px-3 py-1 rounded-full font-medium shrink-0 ${STATUS_STYLE[deal.status]}`}>
              {deal.status === 'pending' ? 'New Offer' : deal.status}
            </span>
          </div>

          {isPending && !counterForm && (
            <div className="flex gap-2 mt-3">
              <button onClick={onReject} disabled={loading === deal.id}
                className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                Reject
              </button>
              <button onClick={onCounter} className="px-3 py-1.5 text-xs bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200">
                Counter Offer
              </button>
              <button onClick={onAccept} disabled={loading === deal.id}
                className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700">
                {loading === deal.id ? '...' : 'Accept ✓'}
              </button>
            </div>
          )}
        </div>
      </div>

      {isPending && counterForm?.id === deal.id && (
        <div className="p-4 bg-purple-50 border-t border-purple-100 space-y-3">
          <p className="text-sm font-semibold text-purple-900">Counter Offer</p>
          <div className="flex gap-3">
            <select
              value={counterForm.type}
              onChange={e => onCounterChange({ ...counterForm, type: e.target.value })}
              className="dashboard-select flex-1 px-4 py-2.5 text-sm"
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount (৳)</option>
            </select>
            <input
              type="number"
              value={counterForm.value}
              onChange={e => onCounterChange({ ...counterForm, value: Number(e.target.value) })}
              className="flex-1 text-sm border rounded-lg px-3 py-2"
              min={0}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={onCancelCounter} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
            <button onClick={onSubmitCounter} disabled={loading === deal.id}
              className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700">
              {loading === deal.id ? '...' : 'Submit Counter'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
