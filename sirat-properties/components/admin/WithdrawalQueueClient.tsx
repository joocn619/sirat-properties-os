'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function WithdrawalQueueClient({ pending, processed, reviewerId }: {
  pending: any[]
  processed: any[]
  reviewerId: string
}) {
  const [loading, setLoading] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  async function review(requestId: string, action: 'approved' | 'rejected') {
    setLoading(requestId)

    await supabase
      .from('withdraw_requests')
      .update({ status: action, reviewed_by: reviewerId })
      .eq('id', requestId)

    if (action === 'approved') {
      const req = pending.find(r => r.id === requestId)
      if (req) {
        await supabase.from('wallet_transactions').insert({
          agent_id: req.agent_id,
          type: 'debit',
          amount: req.amount,
          description: 'Withdrawal approved',
          reference_id: requestId,
        })
      }
    }

    setLoading(null)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      {/* Pending */}
      {pending.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-amber-700 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse inline-block" />
            Pending Requests ({pending.length})
          </h2>
          <div className="space-y-3">
            {pending.map((req: any) => (
              <WithdrawalCard key={req.id} req={req} loading={loading} onReview={review} showActions />
            ))}
          </div>
        </div>
      )}

      {!pending.length && (
        <div className="text-center py-12 border-2 border-dashed rounded-xl text-gray-400">
          <p className="text-3xl mb-2">✅</p>
          <p className="text-sm">কোনো pending withdrawal নেই</p>
        </div>
      )}

      {/* Processed */}
      {processed.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-600 mb-3">Processed Requests</h2>
          <div className="space-y-3">
            {processed.map((req: any) => (
              <WithdrawalCard key={req.id} req={req} loading={null} onReview={() => {}} showActions={false} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function WithdrawalCard({ req, loading, onReview, showActions }: {
  req: any
  loading: string | null
  onReview: (id: string, action: 'approved' | 'rejected') => void
  showActions: boolean
}) {
  const profile = req.agent?.profiles
  const STATUS_STYLE: Record<string, string> = {
    pending:  'bg-amber-100 text-amber-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-600',
  }

  return (
    <div className="bg-white border rounded-xl p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {profile?.avatar_url
            ? <img src={profile.avatar_url} className="w-10 h-10 rounded-full object-cover" alt="" />
            : <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-lg">👤</div>
          }
          <div>
            <p className="font-semibold text-gray-900">{profile?.full_name ?? req.agent?.email}</p>
            <p className="text-xs text-gray-500">{req.agent?.email}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-gray-900">৳{Number(req.amount).toLocaleString()}</p>
          {!showActions && (
            <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLE[req.status]}`}>
              {req.status}
            </span>
          )}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3 text-sm bg-gray-50 rounded-lg p-3">
        <div>
          <p className="text-xs text-gray-400">Bank</p>
          <p className="font-medium text-gray-800">{req.bank_name}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Account #</p>
          <p className="font-medium text-gray-800">{req.account_number}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Account Name</p>
          <p className="font-medium text-gray-800">{req.account_name}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3">
        <p className="text-xs text-gray-400">{new Date(req.created_at).toLocaleString('bn-BD')}</p>
        {showActions && (
          <div className="flex gap-2">
            <button
              disabled={loading === req.id}
              onClick={() => onReview(req.id, 'rejected')}
              className="px-4 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
            >
              Reject
            </button>
            <button
              disabled={loading === req.id}
              onClick={() => onReview(req.id, 'approved')}
              className="px-4 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              {loading === req.id ? '...' : 'Approve ✓'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
