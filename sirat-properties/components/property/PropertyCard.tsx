import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Sparkles } from 'lucide-react'

interface PropertyCardProps {
  id: string
  title: string
  property_type: string
  listing_type: string
  price?: number
  area_sqft?: number
  location?: string
  district?: string
  is_featured?: boolean
  primary_image?: string
  agent?: { full_name: string; avatar_url?: string } | null
}

const LISTING_LABEL: Record<string, string> = {
  sale: 'Sale',
  rent: 'Rent',
  installment: 'Installment',
}

const TYPE_LABEL: Record<string, string> = {
  flat: 'Flat',
  land_share: 'Land Share',
  commercial: 'Commercial',
  duplex: 'Duplex',
  plot: 'Plot',
}

export function PropertyCard({
  id, title, property_type, listing_type, price,
  area_sqft, location, district, is_featured, primary_image, agent,
}: PropertyCardProps) {
  return (
    <Link href={`/properties/${id}`} className="group block">
      <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] transition-all duration-300 hover:-translate-y-1 hover:border-[rgba(201,169,110,0.2)] hover:shadow-[0_16px_48px_rgba(0,0,0,0.3)]">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-[#111118]">
          {primary_image ? (
            <Image
              src={primary_image}
              alt={title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#111118,#16213e,#111118)]">
              <div className="flex items-end gap-1">
                {[20, 32, 44, 36, 24].map((h, i) => (
                  <div key={i} className="w-3 rounded-t-sm" style={{
                    height: `${h}px`,
                    background: `linear-gradient(to top, rgba(201,169,110,${0.12 + i * 0.04}), rgba(201,169,110,0.03))`,
                  }} />
                ))}
              </div>
            </div>
          )}

          {/* Featured badge */}
          {is_featured && (
            <span className="absolute left-2.5 top-2.5 flex items-center gap-1 rounded-full bg-[rgba(201,169,110,0.2)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#C9A96E] ring-1 ring-[rgba(201,169,110,0.3)] backdrop-blur-sm">
              <Sparkles className="size-3" />
              Featured
            </span>
          )}

          {/* Listing type badge */}
          <span className="absolute right-2.5 top-2.5 rounded-full bg-[#0A0A0F]/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#F0EDE8] backdrop-blur-sm">
            {LISTING_LABEL[listing_type] ?? listing_type}
          </span>
        </div>

        {/* Info */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-[var(--text-primary)]">{title}</h3>
            <span className="shrink-0 rounded-md bg-white/[0.04] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
              {TYPE_LABEL[property_type] ?? property_type}
            </span>
          </div>

          {(location || district) && (
            <p className="mt-1.5 flex items-center gap-1 text-xs text-[var(--text-tertiary)]">
              <MapPin className="size-3 text-[var(--color-accent)]" />
              {[location, district].filter(Boolean).join(', ')}
            </p>
          )}

          <div className="mt-3 flex items-center justify-between">
            <div>
              {price ? (
                <p className="font-price text-base font-semibold text-[var(--color-accent)]">
                  ৳{Number(price).toLocaleString()}
                </p>
              ) : (
                <p className="text-xs text-[var(--text-tertiary)]">Price on request</p>
              )}
              {area_sqft && (
                <p className="mt-0.5 text-xs text-[var(--text-tertiary)]">{area_sqft} sqft</p>
              )}
            </div>

            {agent && (
              <div className="flex items-center gap-1.5">
                {agent.avatar_url ? (
                  <img src={agent.avatar_url} alt={agent.full_name} className="size-6 rounded-full object-cover ring-1 ring-white/[0.08]" />
                ) : (
                  <div className="flex size-6 items-center justify-center rounded-full bg-[rgba(201,169,110,0.12)] text-[10px] font-semibold text-[var(--color-accent)]">
                    {agent.full_name?.[0]}
                  </div>
                )}
                <span className="max-w-[80px] truncate text-xs text-[var(--text-tertiary)]">{agent.full_name}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
