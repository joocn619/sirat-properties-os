'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const TYPE_LABEL: Record<string, string> = {
  apartment: 'Apartment', house: 'House', commercial: 'Commercial',
  land: 'Land', villa: 'Villa',
}

const STATUS_STYLE: Record<string, string> = {
  pending:  'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-600',
}

export function AgentListingsBrowser({ listings, applications, canApply, agentId }: {
  listings: any[]
  applications: any[]
  canApply: boolean
  agentId: string
}) {
  const [applying, setApplying] = useState<string | null>(null)
  const [applied, setApplied] = useState<Set<string>>(new Set())
  const [tab, setTab] = useState<'browse' | 'applied'>('browse')
  const supabase = createClient()

  async function handleApply(propertyId: string) {
    if (!canApply) return
    setApplying(propertyId)
    const { error } = await supabase
      .from('agent_listings')
      .insert({ agent_id: agentId, property_id: propertyId, status: 'pending' })
    if (!error) setApplied(prev => new Set([...prev, propertyId]))
    setApplying(null)
  }

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {(['browse', 'applied'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'browse' ? `Browse (${listings.length})` : `Applied (${applications.length})`}
          </button>
        ))}
      </div>

      {/* Browse tab */}
      {tab === 'browse' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {!listings.length && (
            <div className="col-span-2 text-center py-16 text-gray-400 border-2 border-dashed rounded-xl">
              <p className="text-4xl mb-3">🏠</p>
              <p>সব listing-এ apply করা হয়েছে</p>
            </div>
          )}
          {listings.map((p: any) => {
            const img = p.property_images?.find((i: any) => i.is_primary)?.url ?? p.property_images?.[0]?.url
            const isApplied = applied.has(p.id)

            return (
              <div key={p.id} className="bg-white border rounded-xl overflow-hidden">
                <div className="h-36 bg-gray-100 relative">
                  {img
                    ? <img src={img} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-4xl">🏠</div>
                  }
                </div>
                <div className="p-4">
                  <p className="font-semibold text-gray-900 line-clamp-1">{p.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{[p.location, p.district].filter(Boolean).join(', ')}</p>
                  <div className="flex items-center justify-between mt-3">
                    <div>
                      <p className="font-bold text-gray-900">৳{Number(p.price).toLocaleString()}</p>
                      <p className="text-xs text-gray-400">{TYPE_LABEL[p.property_type] ?? p.property_type}</p>
                    </div>
                    <button
                      disabled={!canApply || isApplied || applying === p.id}
                      onClick={() => handleApply(p.id)}
                      className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        isApplied
                          ? 'bg-green-100 text-green-700 cursor-default'
                          : !canApply
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {isApplied ? '✓ Applied' : applying === p.id ? '...' : 'Apply'}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Applied tab */}
      {tab === 'applied' && (
        <div className="space-y-3">
          {!applications.length && (
            <div className="text-center py-16 text-gray-400 border-2 border-dashed rounded-xl">
              <p className="text-4xl mb-3">📋</p>
              <p>এখনো কোনো application নেই</p>
            </div>
          )}
          {applications.map((app: any) => {
            const prop = app.properties
            const img = prop?.property_images?.find((i: any) => i.is_primary)?.url ?? prop?.property_images?.[0]?.url

            return (
              <div key={app.id} className="bg-white border rounded-xl flex overflow-hidden">
                <div className="w-24 bg-gray-100 shrink-0">
                  {img
                    ? <img src={img} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-3xl">🏠</div>
                  }
                </div>
                <div className="flex-1 p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{prop?.title}</p>
                    <p className="text-xs text-gray-500">{[prop?.location, prop?.district].filter(Boolean).join(', ')}</p>
                    <p className="text-xs text-gray-400 mt-1">৳{Number(prop?.price ?? 0).toLocaleString()}</p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${STATUS_STYLE[app.status]}`}>
                    {app.status === 'pending' ? 'Pending' : app.status === 'approved' ? 'Approved ✓' : 'Rejected'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
