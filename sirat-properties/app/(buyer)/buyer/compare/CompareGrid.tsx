'use client'

import Link from 'next/link'
import {
  MapPin, Ruler, Building2, Compass, Bed, Bath,
  CheckCircle2, XCircle, ArrowRight,
} from 'lucide-react'

interface Property {
  id: string
  title: string
  property_type: string
  listing_type: string
  price: number | null
  area_sqft: number | null
  location: string | null
  district: string | null
  floor_number: number | null
  total_floors: number | null
  facing: string | null
  bedrooms: number | null
  bathrooms: number | null
  amenities: string[] | null
  description: string | null
  address: string | null
  property_images: { url: string; is_primary: boolean }[]
}

const TYPE_LABEL: Record<string, string> = {
  flat: 'Flat', land_share: 'Land Share', commercial: 'Commercial', duplex: 'Duplex', plot: 'Plot',
}
const LISTING_LABEL: Record<string, string> = {
  sale: 'Sale', rent: 'Rent', installment: 'Installment',
}

function getImage(p: Property) {
  return p.property_images?.find(i => i.is_primary)?.url ?? p.property_images?.[0]?.url
}

export function CompareGrid({ properties }: { properties: Property[] }) {
  // Collect all unique amenities across all properties
  const allAmenities = [...new Set(properties.flatMap(p => p.amenities ?? []))]

  const cols = properties.length === 2 ? 'grid-cols-[180px_1fr_1fr]' : 'grid-cols-[180px_1fr_1fr_1fr]'

  return (
    <div className={`grid ${cols} gap-0 overflow-hidden rounded-2xl border border-white/[0.06]`}>

      {/* ── Header Row: Images ── */}
      <div className="border-b border-r border-white/[0.04] bg-white/[0.02] p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-tertiary)]">Property</p>
      </div>
      {properties.map(p => {
        const img = getImage(p)
        return (
          <div key={p.id} className="border-b border-r border-white/[0.04] bg-white/[0.02] p-3 last:border-r-0">
            <div className="mb-3 aspect-[4/3] overflow-hidden rounded-xl bg-[#111118]">
              {img ? (
                <img src={img} alt={p.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Building2 className="size-8 text-[#5C5866]" />
                </div>
              )}
            </div>
            <Link href={`/properties/${p.id}`} className="text-sm font-semibold text-[var(--text-primary)] hover:text-[var(--color-accent)]">
              {p.title}
            </Link>
            {(p.location || p.district) && (
              <p className="mt-1 flex items-center gap-1 text-xs text-[var(--text-tertiary)]">
                <MapPin className="size-3 text-[var(--color-accent)]" />
                {[p.location, p.district].filter(Boolean).join(', ')}
              </p>
            )}
          </div>
        )
      })}

      {/* ── Data Rows ── */}
      <Row label="Price" icon="৳">
        {properties.map(p => (
          <Cell key={p.id} highlight>
            {p.price ? `৳${Number(p.price).toLocaleString()}` : '—'}
          </Cell>
        ))}
      </Row>

      <Row label="Type">
        {properties.map(p => <Cell key={p.id}>{TYPE_LABEL[p.property_type] ?? p.property_type}</Cell>)}
      </Row>

      <Row label="Listing">
        {properties.map(p => <Cell key={p.id}>{LISTING_LABEL[p.listing_type] ?? p.listing_type}</Cell>)}
      </Row>

      <Row label="Area">
        {properties.map(p => <Cell key={p.id}>{p.area_sqft ? `${p.area_sqft} sqft` : '—'}</Cell>)}
      </Row>

      <Row label="Floor">
        {properties.map(p => (
          <Cell key={p.id}>{p.floor_number ? `${p.floor_number}/${p.total_floors ?? '?'}` : '—'}</Cell>
        ))}
      </Row>

      <Row label="Facing">
        {properties.map(p => <Cell key={p.id}>{p.facing ?? '—'}</Cell>)}
      </Row>

      <Row label="Bedrooms">
        {properties.map(p => <Cell key={p.id}>{p.bedrooms ?? '—'}</Cell>)}
      </Row>

      <Row label="Bathrooms">
        {properties.map(p => <Cell key={p.id}>{p.bathrooms ?? '—'}</Cell>)}
      </Row>

      <Row label="Address">
        {properties.map(p => <Cell key={p.id} small>{p.address ?? '—'}</Cell>)}
      </Row>

      {/* ── Amenities ── */}
      {allAmenities.length > 0 && (
        <>
          <div className="col-span-full border-b border-t border-white/[0.04] bg-[rgba(201,169,110,0.03)] px-4 py-2">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-accent)]">Amenities</p>
          </div>

          {allAmenities.map(amenity => (
            <Row key={amenity} label={amenity}>
              {properties.map(p => {
                const has = (p.amenities ?? []).includes(amenity)
                return (
                  <Cell key={p.id}>
                    {has ? (
                      <CheckCircle2 className="size-4 text-[#10b981]" />
                    ) : (
                      <XCircle className="size-4 text-[#5C5866]" />
                    )}
                  </Cell>
                )
              })}
            </Row>
          ))}
        </>
      )}

      {/* ── Action Row ── */}
      <div className="border-r border-white/[0.04] bg-white/[0.02] p-4" />
      {properties.map(p => (
        <div key={p.id} className="border-r border-white/[0.04] bg-white/[0.02] p-3 last:border-r-0">
          <Link
            href={`/buyer/bookings/new?property=${p.id}`}
            className="group flex items-center justify-center gap-1.5 rounded-xl bg-[var(--color-accent)] py-2.5 text-xs font-semibold text-[#0A0A0F] transition hover:shadow-[0_4px_16px_rgba(201,169,110,0.3)]"
          >
            Book Now
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      ))}
    </div>
  )
}

/* ── Helpers ── */

function Row({ label, icon, children }: { label: string; icon?: string; children: React.ReactNode }) {
  return (
    <>
      <div className="flex items-center gap-1.5 border-b border-r border-white/[0.04] bg-white/[0.02] px-4 py-3">
        {icon && <span className="text-xs text-[var(--color-accent)]">{icon}</span>}
        <span className="text-xs font-medium text-[var(--text-tertiary)]">{label}</span>
      </div>
      {children}
    </>
  )
}

function Cell({ children, highlight, small }: { children: React.ReactNode; highlight?: boolean; small?: boolean }) {
  return (
    <div className={`flex items-center border-b border-r border-white/[0.04] px-4 py-3 last:border-r-0 ${
      highlight ? 'font-price text-sm font-semibold text-[var(--color-accent)]' : small ? 'text-xs text-[var(--text-tertiary)]' : 'text-sm text-[var(--text-secondary)]'
    }`}>
      {children}
    </div>
  )
}
