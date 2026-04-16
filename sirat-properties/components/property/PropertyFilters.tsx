'use client'

import { useCallback, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { Button } from '@/components/ui/button'

const PROPERTY_TYPES = [
  { value: '', label: 'All types' },
  { value: 'flat', label: 'Flat' },
  { value: 'land_share', label: 'Land Share' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'duplex', label: 'Duplex' },
  { value: 'plot', label: 'Plot' },
]

const LISTING_TYPES = [
  { value: '', label: 'All listings' },
  { value: 'sale', label: 'Sale' },
  { value: 'rent', label: 'Rent' },
  { value: 'installment', label: 'Installment' },
]

const DISTRICTS = [
  '',
  'Dhaka',
  'Chattogram',
  'Sylhet',
  'Rajshahi',
  'Khulna',
  'Barishal',
  'Mymensingh',
  'Rangpur',
  'Gazipur',
  'Narayanganj',
]

export function PropertyFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [filters, setFilters] = useState({
    location: searchParams.get('location') ?? '',
    district: searchParams.get('district') ?? '',
    property_type: searchParams.get('property_type') ?? '',
    listing_type: searchParams.get('listing_type') ?? '',
    min_price: searchParams.get('min_price') ?? '',
    max_price: searchParams.get('max_price') ?? '',
  })

  const applyFilters = useCallback(() => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      }
    })
    router.push(`/buyer/search?${params.toString()}`)
  }, [filters, router])

  const reset = useCallback(() => {
    setFilters({
      location: '',
      district: '',
      property_type: '',
      listing_type: '',
      min_price: '',
      max_price: '',
    })
    router.push('/buyer/search')
  }, [router])

  return (
    <div className="dashboard-panel sticky top-4 space-y-5 rounded-[1.75rem] p-5">
      <h3 className="dashboard-label text-[var(--color-accent)]">Filter</h3>

      <div>
        <label className="dashboard-label mb-2 block">Area / Location</label>
        <input
          value={filters.location}
          onChange={(event) => setFilters({ ...filters, location: event.target.value })}
          placeholder="e.g. Gulshan, Bashundhara"
          className="dashboard-input px-4 py-3 text-sm"
        />
      </div>

      <div>
        <label className="dashboard-label mb-2 block">District</label>
        <select
          value={filters.district}
          onChange={(event) => setFilters({ ...filters, district: event.target.value })}
          className="dashboard-select px-4 py-3 text-sm"
        >
          {DISTRICTS.map((district) => (
            <option key={district} value={district}>
              {district || 'All districts'}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="dashboard-label mb-2 block">Property Type</label>
        <div className="flex flex-wrap gap-2">
          {PROPERTY_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setFilters({ ...filters, property_type: type.value })}
              className={`rounded-full border px-3 py-2 text-xs font-medium transition ${
                filters.property_type === type.value
                  ? 'border-[rgba(201,169,110,0.3)] bg-[var(--color-accent-glow)] text-[var(--color-accent)]'
                  : 'border-white/10 bg-white/[0.03] text-[var(--text-secondary)] hover:border-[rgba(201,169,110,0.18)] hover:text-[var(--text-primary)]'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="dashboard-label mb-2 block">Listing Type</label>
        <div className="flex flex-wrap gap-2">
          {LISTING_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setFilters({ ...filters, listing_type: type.value })}
              className={`rounded-full border px-3 py-2 text-xs font-medium transition ${
                filters.listing_type === type.value
                  ? 'border-[rgba(201,169,110,0.3)] bg-[var(--color-accent-glow)] text-[var(--color-accent)]'
                  : 'border-white/10 bg-white/[0.03] text-[var(--text-secondary)] hover:border-[rgba(201,169,110,0.18)] hover:text-[var(--text-primary)]'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="dashboard-label mb-2 block">Budget (BDT)</label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.min_price}
            onChange={(event) => setFilters({ ...filters, min_price: event.target.value })}
            className="dashboard-input px-4 py-3 text-sm"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.max_price}
            onChange={(event) => setFilters({ ...filters, max_price: event.target.value })}
            className="dashboard-input px-4 py-3 text-sm"
          />
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <Button
          onClick={applyFilters}
          className="dashboard-primary-button h-11 flex-1 px-4 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-inverse)]"
        >
          Apply
        </Button>
        <Button
          onClick={reset}
          variant="outline"
          className="dashboard-secondary-button h-11 px-4 text-xs font-semibold uppercase tracking-[0.16em]"
        >
          Reset
        </Button>
      </div>
    </div>
  )
}
