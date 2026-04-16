import Link from 'next/link'
import { ArrowUpRight, MapPin } from 'lucide-react'

import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'

interface PropertyCardProps {
  badge?: string
  className?: string
  href: string
  imageUrl?: string | null
  location?: string | null
  price?: number | null
  status?: 'active' | 'pending' | 'sold'
  subtitle?: string
  title: string
  type?: string | null
}

const statusTone: Record<NonNullable<PropertyCardProps['status']>, 'blue' | 'emerald' | 'gold' | 'rose'> = {
  active: 'emerald',
  pending: 'gold',
  sold: 'rose',
}

export function PropertyCard({
  badge,
  className,
  href,
  imageUrl,
  location,
  price,
  status = 'active',
  subtitle,
  title,
  type,
}: PropertyCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        'group dashboard-panel block overflow-hidden rounded-[1.75rem] border border-white/6 transition duration-300 hover:-translate-y-1 hover:border-[rgba(201,169,110,0.2)] hover:shadow-[0_28px_80px_rgba(0,0,0,0.32)]',
        className,
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden border-b border-white/6 bg-[radial-gradient(circle_at_top_left,rgba(201,169,110,0.18),transparent_42%),linear-gradient(180deg,rgba(28,28,40,0.98),rgba(16,16,24,0.98))]">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105 group-hover:opacity-85"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_center,rgba(201,169,110,0.12),transparent_55%)]">
            <div className="flex h-24 w-24 items-center justify-center rounded-full border border-white/8 bg-white/[0.04] text-xs uppercase tracking-[0.3em] text-[var(--text-tertiary)]">
              View
            </div>
          </div>
        )}

        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4">
          {badge ? (
            <span className="dashboard-badge" data-tone="gold">
              {badge}
            </span>
          ) : (
            <span />
          )}
          <span className="dashboard-badge" data-tone={statusTone[status]}>
            {status}
          </span>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            {type ? <p className="dashboard-label">{type}</p> : null}
            <h3 className="font-display text-2xl font-medium tracking-[-0.03em] text-[var(--text-primary)]">
              {title}
            </h3>
          </div>
          <ArrowUpRight className="mt-1 size-5 shrink-0 text-[var(--text-tertiary)] transition group-hover:text-[var(--color-accent)]" />
        </div>

        {location ? (
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <MapPin className="size-4 text-[var(--text-tertiary)]" />
            <span>{location}</span>
          </div>
        ) : null}

        {subtitle ? <p className="text-sm leading-6 text-[var(--text-secondary)]">{subtitle}</p> : null}

        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="dashboard-label">Price</p>
            <p className="font-price mt-2 text-lg text-[var(--color-accent)]">{formatCurrency(price)}</p>
          </div>
        </div>
      </div>
    </Link>
  )
}
