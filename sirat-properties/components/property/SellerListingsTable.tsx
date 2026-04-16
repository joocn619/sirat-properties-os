'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown, Building2, LayoutGrid, MapPin, PencilLine } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/format'

type SortKey = 'created_at' | 'price' | 'status' | 'title'
type SortDirection = 'asc' | 'desc'

interface ListingImage {
  is_primary: boolean
  url: string
}

interface ListingUnit {
  status: string | null
}

export interface SellerListingRow {
  area_sqft: number | null
  created_at: string
  district: string | null
  id: string
  is_published: boolean | null
  location: string | null
  price: number | null
  property_images: ListingImage[] | null
  property_units: ListingUnit[] | null
  status: string | null
  title: string
}

const STATUS_META: Record<string, { label: string; tone: 'emerald' | 'gold' | 'rose' }> = {
  available: { label: 'Available', tone: 'emerald' },
  booked: { label: 'Booked', tone: 'gold' },
  sold: { label: 'Sold', tone: 'rose' },
}

function getSortValue(listing: SellerListingRow, key: SortKey) {
  switch (key) {
    case 'created_at':
      return new Date(listing.created_at).getTime()
    case 'price':
      return listing.price ?? 0
    case 'status':
      return listing.status ?? ''
    case 'title':
      return listing.title.toLowerCase()
    default:
      return ''
  }
}

function SortIcon({ active, direction }: { active: boolean; direction: SortDirection }) {
  if (!active) {
    return <ArrowUpDown className="size-3.5" />
  }

  return direction === 'asc' ? <ArrowUp className="size-3.5" /> : <ArrowDown className="size-3.5" />
}

function inventorySummary(units: ListingUnit[] | null) {
  const safeUnits = units ?? []
  const booked = safeUnits.filter((unit) => unit.status === 'booked').length
  const sold = safeUnits.filter((unit) => unit.status === 'sold').length

  return {
    booked,
    sold,
    total: safeUnits.length,
  }
}

export function SellerListingsTable({ listings }: { listings: SellerListingRow[] }) {
  const [sortKey, setSortKey] = useState<SortKey>('created_at')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const sortedListings = useMemo(() => {
    const cloned = [...listings]

    cloned.sort((left, right) => {
      const leftValue = getSortValue(left, sortKey)
      const rightValue = getSortValue(right, sortKey)

      if (leftValue === rightValue) {
        return 0
      }

      if (sortDirection === 'asc') {
        return leftValue > rightValue ? 1 : -1
      }

      return leftValue < rightValue ? 1 : -1
    })

    return cloned
  }, [listings, sortDirection, sortKey])

  function toggleSort(nextKey: SortKey) {
    if (sortKey === nextKey) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'))
      return
    }

    setSortKey(nextKey)
    setSortDirection(nextKey === 'title' || nextKey === 'status' ? 'asc' : 'desc')
  }

  return (
    <div className="space-y-4">
      <div className="hidden overflow-hidden rounded-[1.75rem] border border-white/8 bg-white/[0.03] md:block">
        <div className="overflow-x-auto">
          <table className="dashboard-table min-w-full">
            <thead>
              <tr>
                <th className="px-5 py-4 text-left">
                  <button
                    type="button"
                    onClick={() => toggleSort('title')}
                    className="inline-flex items-center gap-2 transition hover:text-[var(--text-primary)]"
                  >
                    Listing
                    <SortIcon active={sortKey === 'title'} direction={sortDirection} />
                  </button>
                </th>
                <th className="px-5 py-4 text-left">
                  <button
                    type="button"
                    onClick={() => toggleSort('status')}
                    className="inline-flex items-center gap-2 transition hover:text-[var(--text-primary)]"
                  >
                    Status
                    <SortIcon active={sortKey === 'status'} direction={sortDirection} />
                  </button>
                </th>
                <th className="px-5 py-4 text-left">
                  <button
                    type="button"
                    onClick={() => toggleSort('price')}
                    className="inline-flex items-center gap-2 transition hover:text-[var(--text-primary)]"
                  >
                    Price
                    <SortIcon active={sortKey === 'price'} direction={sortDirection} />
                  </button>
                </th>
                <th className="px-5 py-4 text-left">Inventory</th>
                <th className="px-5 py-4 text-left">
                  <button
                    type="button"
                    onClick={() => toggleSort('created_at')}
                    className="inline-flex items-center gap-2 transition hover:text-[var(--text-primary)]"
                  >
                    Added
                    <SortIcon active={sortKey === 'created_at'} direction={sortDirection} />
                  </button>
                </th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedListings.map((listing) => {
                const meta = STATUS_META[listing.status ?? ''] ?? { label: listing.status ?? 'Draft', tone: 'gold' as const }
                const summary = inventorySummary(listing.property_units)
                const primaryImage = listing.property_images?.find((image) => image.is_primary) ?? listing.property_images?.[0]

                return (
                  <tr key={listing.id} className="group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-18 w-24 shrink-0 items-center justify-center overflow-hidden rounded-[1.1rem] border border-white/8 bg-white/[0.04]">
                          {primaryImage ? (
                            <img src={primaryImage.url} alt={listing.title} className="h-full w-full object-cover" />
                          ) : (
                            <Building2 className="size-5 text-[var(--text-tertiary)]" />
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-[var(--text-primary)]">{listing.title}</p>
                          <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                            <MapPin className="size-3.5 text-[var(--color-accent)]" />
                            <span>{[listing.location, listing.district].filter(Boolean).join(', ') || 'Location pending'}</span>
                          </div>
                          <p className="text-xs text-[var(--text-tertiary)]">
                            {listing.area_sqft ? `${listing.area_sqft.toLocaleString()} sqft` : 'Area pending'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        <span className="dashboard-badge" data-tone={meta.tone}>
                          {meta.label}
                        </span>
                        <span className="dashboard-badge" data-tone={listing.is_published ? 'blue' : 'gold'}>
                          {listing.is_published ? 'Published' : 'Draft'}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-price text-base font-medium text-[var(--color-accent)]">
                        {formatCurrency(listing.price)}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="space-y-1 text-xs text-[var(--text-secondary)]">
                        <p>{summary.total} units tracked</p>
                        <p>{summary.booked} booked / {summary.sold} sold</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-[var(--text-secondary)]">
                      {new Date(listing.created_at).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2 opacity-100 transition md:opacity-0 md:group-hover:opacity-100">
                        <Link href={`/seller/listings/${listing.id}/edit`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-white/10 bg-white/[0.03] text-[var(--text-primary)] hover:border-[rgba(201,169,110,0.22)] hover:bg-white/[0.05] hover:text-[var(--color-accent)]"
                          >
                            <PencilLine className="size-3.5" />
                            Edit
                          </Button>
                        </Link>
                        <Link href={`/seller/inventory/${listing.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-white/10 bg-white/[0.03] text-[var(--text-primary)] hover:border-[rgba(59,130,246,0.22)] hover:bg-white/[0.05] hover:text-[var(--color-blue)]"
                          >
                            <LayoutGrid className="size-3.5" />
                            Inventory
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-4 md:hidden">
        {sortedListings.map((listing) => {
          const meta = STATUS_META[listing.status ?? ''] ?? { label: listing.status ?? 'Draft', tone: 'gold' as const }
          const summary = inventorySummary(listing.property_units)
          const primaryImage = listing.property_images?.find((image) => image.is_primary) ?? listing.property_images?.[0]

          return (
            <article key={listing.id} className="dashboard-panel rounded-[1.75rem] p-4">
              <div className="flex items-start gap-4">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[1.1rem] border border-white/8 bg-white/[0.04]">
                  {primaryImage ? (
                    <img src={primaryImage.url} alt={listing.title} className="h-full w-full object-cover" />
                  ) : (
                    <Building2 className="size-5 text-[var(--text-tertiary)]" />
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-3">
                  <div className="space-y-1">
                    <p className="text-base font-semibold text-[var(--text-primary)]">{listing.title}</p>
                    <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                      <MapPin className="size-3.5 text-[var(--color-accent)]" />
                      <span>{[listing.location, listing.district].filter(Boolean).join(', ') || 'Location pending'}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="dashboard-badge" data-tone={meta.tone}>
                      {meta.label}
                    </span>
                    <span className="dashboard-badge" data-tone={listing.is_published ? 'blue' : 'gold'}>
                      {listing.is_published ? 'Published' : 'Draft'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-[1.15rem] border border-white/8 bg-white/[0.03] px-3 py-3">
                      <p className="dashboard-label">Price</p>
                      <p className="mt-2 font-price text-sm font-medium text-[var(--color-accent)]">
                        {formatCurrency(listing.price)}
                      </p>
                    </div>
                    <div className="rounded-[1.15rem] border border-white/8 bg-white/[0.03] px-3 py-3">
                      <p className="dashboard-label">Inventory</p>
                      <p className="mt-2 text-sm text-[var(--text-secondary)]">{summary.total} units</p>
                      <p className="text-xs text-[var(--text-tertiary)]">{summary.booked} booked / {summary.sold} sold</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-1">
                    <Link href={`/seller/listings/${listing.id}/edit`} className="flex-1 min-w-[9rem]">
                      <Button
                        variant="outline"
                        className="w-full border-white/10 bg-white/[0.03] text-[var(--text-primary)] hover:border-[rgba(201,169,110,0.22)] hover:bg-white/[0.05] hover:text-[var(--color-accent)]"
                      >
                        <PencilLine className="size-4" />
                        Edit Listing
                      </Button>
                    </Link>
                    <Link href={`/seller/inventory/${listing.id}`} className="flex-1 min-w-[9rem]">
                      <Button
                        variant="outline"
                        className="w-full border-white/10 bg-white/[0.03] text-[var(--text-primary)] hover:border-[rgba(59,130,246,0.22)] hover:bg-white/[0.05] hover:text-[var(--color-blue)]"
                      >
                        <LayoutGrid className="size-4" />
                        View Inventory
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
