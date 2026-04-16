import Link from 'next/link'
import { ArrowLeft, Boxes, CheckCircle2, Clock3, Home } from 'lucide-react'
import { redirect } from 'next/navigation'

import { DashboardPageHeader } from '@/components/layout/DashboardPageHeader'
import { InventoryClient } from '@/components/property/InventoryClient'
import { StatCard } from '@/components/ui/StatCard'
import { Button } from '@/components/ui/button'
import { requireDashboardSession } from '@/lib/dashboard'

export default async function InventoryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { supabase, userId } = await requireDashboardSession('seller')

  const { data: property } = await supabase
    .from('properties')
    .select('id, title, seller_id, property_units(*)')
    .eq('id', id)
    .single()

  if (!property || property.seller_id !== userId) {
    redirect('/seller/listings')
  }

  const units = property.property_units ?? []
  const stats = {
    total: units.length,
    available: units.filter((unit: any) => unit.status === 'available').length,
    booked: units.filter((unit: any) => unit.status === 'booked').length,
    sold: units.filter((unit: any) => unit.status === 'sold').length,
  }

  const soldPercent = stats.total ? Math.round((stats.sold / stats.total) * 100) : 0
  const bookedPercent = stats.total ? Math.round((stats.booked / stats.total) * 100) : 0

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <DashboardPageHeader
        eyebrow="Inventory manager"
        title={property.title}
        description="Update live unit availability, add new inventory, and keep sold versus booked stock visible in one responsive workspace."
        action={(
          <Link href="/seller/listings">
            <Button
              variant="outline"
              className="rounded-full border-white/10 bg-white/[0.03] px-5 text-[var(--text-primary)] hover:border-white/16 hover:bg-white/[0.05]"
            >
              <ArrowLeft className="size-4" />
              Back to listings
            </Button>
          </Link>
        )}
      />

      <div className="grid gap-4 lg:grid-cols-4">
        <StatCard label="Total Units" value={stats.total} accent="gold" icon={<Boxes className="size-5" />} />
        <StatCard label="Available" value={stats.available} accent="emerald" icon={<Home className="size-5" />} />
        <StatCard label="Booked" value={stats.booked} accent="blue" icon={<Clock3 className="size-5" />} />
        <StatCard label="Sold" value={stats.sold} accent="rose" icon={<CheckCircle2 className="size-5" />} />
      </div>

      <div className="dashboard-panel rounded-[2rem] p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="dashboard-label">Sell-through overview</p>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--text-primary)]">Inventory momentum at a glance</h2>
            <p className="max-w-3xl text-sm leading-7 text-[var(--text-secondary)]">
              Keep the pipeline healthy by monitoring how much stock is sold, booked, or still available for agents and buyers.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="dashboard-badge" data-tone="rose">{soldPercent}% sold</span>
            <span className="dashboard-badge" data-tone="blue">{bookedPercent}% booked</span>
            <span className="dashboard-badge" data-tone="emerald">
              {stats.total ? 100 - soldPercent - bookedPercent : 0}% available
            </span>
          </div>
        </div>

        {stats.total ? (
          <div className="mt-6 space-y-4">
            <div className="flex h-4 overflow-hidden rounded-full bg-white/[0.06]">
              <div style={{ width: `${soldPercent}%`, background: 'rgba(244, 63, 94, 0.82)' }} />
              <div style={{ width: `${bookedPercent}%`, background: 'rgba(59, 130, 246, 0.82)' }} />
              <div className="flex-1" style={{ background: 'rgba(16, 185, 129, 0.3)' }} />
            </div>
            <div className="flex flex-wrap gap-4 text-xs uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
              <span>Sold {stats.sold}</span>
              <span>Booked {stats.booked}</span>
              <span>Available {stats.available}</span>
            </div>
          </div>
        ) : null}
      </div>

      <InventoryClient propertyId={id} initialUnits={units as any} />
    </div>
  )
}
