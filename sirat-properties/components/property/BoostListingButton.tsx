'use client'

import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'

export function BoostListingButton({
  propertyId,
  isFeatured,
  featuredUntil,
}: {
  propertyId: string
  isFeatured: boolean
  featuredUntil: string | null
}) {
  const [loading, setLoading] = useState(false)

  const isActive = isFeatured && featuredUntil && new Date(featuredUntil) > new Date()

  async function handleBoost() {
    setLoading(true)
    try {
      const res = await fetch('/api/payments/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'featured_listing',
          propertyId,
          amount: 500,
          days: 30,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? 'Failed')
        setLoading(false)
        return
      }
      window.location.href = data.url
    } catch {
      toast.error('Something went wrong')
      setLoading(false)
    }
  }

  if (isActive) {
    return (
      <span className="flex items-center gap-1 text-[10px] font-semibold text-[var(--color-accent)]">
        <Sparkles className="size-3" />
        Featured until {new Date(featuredUntil!).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
      </span>
    )
  }

  return (
    <button
      type="button"
      onClick={handleBoost}
      disabled={loading}
      className="flex items-center gap-1 rounded-lg bg-[rgba(201,169,110,0.08)] px-2.5 py-1 text-[10px] font-semibold text-[var(--color-accent)] ring-1 ring-[rgba(201,169,110,0.15)] transition hover:bg-[rgba(201,169,110,0.14)] disabled:opacity-50"
    >
      <Sparkles className="size-3" />
      {loading ? '…' : 'Boost ৳500'}
    </button>
  )
}
