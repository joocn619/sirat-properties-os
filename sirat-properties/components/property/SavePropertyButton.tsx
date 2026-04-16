'use client'

import { Heart } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

export function SavePropertyButton({
  propertyId,
  initialSaved = false,
  size = 'md',
}: {
  propertyId: string
  initialSaved?: boolean
  size?: 'sm' | 'md'
}) {
  const [saved, setSaved] = useState(initialSaved)
  const [loading, setLoading] = useState(false)

  async function toggle() {
    setLoading(true)
    const res = await fetch('/api/saved-properties', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ propertyId }),
    })
    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      toast.error(data.error ?? 'Failed to save')
      setLoading(false)
      return
    }

    setSaved(data.saved)
    toast.success(data.saved ? 'Saved to wishlist' : 'Removed from wishlist')
    setLoading(false)
  }

  const s = size === 'sm' ? 'size-8' : 'size-10'
  const iconSize = size === 'sm' ? 'size-3.5' : 'size-4'

  return (
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle() }}
      disabled={loading}
      className={`${s} flex items-center justify-center rounded-xl border transition-all duration-200 disabled:opacity-50 ${
        saved
          ? 'border-[rgba(244,63,94,0.3)] bg-[rgba(244,63,94,0.12)] text-[#f43f5e]'
          : 'border-white/[0.08] bg-[#0A0A0F]/60 text-[var(--text-tertiary)] backdrop-blur-sm hover:border-white/[0.15] hover:text-[var(--text-secondary)]'
      }`}
      title={saved ? 'Remove from wishlist' : 'Save to wishlist'}
    >
      <Heart className={`${iconSize} transition-all ${saved ? 'fill-current' : ''}`} />
    </button>
  )
}
