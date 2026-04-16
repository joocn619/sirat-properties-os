'use client'

import { useState, type ReactNode } from 'react'
import { LayoutGrid, Map } from 'lucide-react'
import dynamic from 'next/dynamic'

const PropertyMap = dynamic(() => import('./PropertyMap').then(m => ({ default: m.PropertyMap })), {
  ssr: false,
  loading: () => (
    <div className="flex h-[600px] items-center justify-center rounded-2xl border border-white/[0.06] bg-[#0A0A0F]">
      <span className="text-sm text-[var(--text-tertiary)]">Loading map…</span>
    </div>
  ),
})

interface MapProperty {
  id: string
  title: string
  price: number | null
  latitude: number
  longitude: number
  location: string | null
  district: string | null
  property_type: string
  listing_type: string
  image?: string
}

export function SearchViewToggle({
  gridView,
  mapProperties,
}: {
  gridView: ReactNode
  mapProperties: MapProperty[]
}) {
  const [view, setView] = useState<'grid' | 'map'>('grid')

  return (
    <div>
      {/* Toggle buttons */}
      <div className="mb-4 flex items-center gap-1 rounded-xl bg-white/[0.03] p-1 w-fit">
        <button
          type="button"
          onClick={() => setView('grid')}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
            view === 'grid'
              ? 'bg-[rgba(201,169,110,0.12)] text-[var(--color-accent)]'
              : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
          }`}
        >
          <LayoutGrid className="size-3.5" /> Grid
        </button>
        <button
          type="button"
          onClick={() => setView('map')}
          disabled={mapProperties.length === 0}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition disabled:opacity-30 ${
            view === 'map'
              ? 'bg-[rgba(201,169,110,0.12)] text-[var(--color-accent)]'
              : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
          }`}
        >
          <Map className="size-3.5" /> Map
          {mapProperties.length > 0 && (
            <span className="rounded-full bg-white/[0.06] px-1.5 py-0.5 text-[10px]">{mapProperties.length}</span>
          )}
        </button>
      </div>

      {/* View */}
      {view === 'grid' ? gridView : <PropertyMap properties={mapProperties} />}
    </div>
  )
}
