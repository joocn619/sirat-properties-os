import Link from 'next/link'
import { Building2, Plus } from 'lucide-react'

import { DashboardPageHeader } from '@/components/layout/DashboardPageHeader'
import { SellerListingsTable } from '@/components/property/SellerListingsTable'
import { DashboardPanel } from '@/components/ui/DashboardPanel'
import { Button } from '@/components/ui/button'
import { requireDashboardSession } from '@/lib/dashboard'

export default async function SellerListingsPage() {
  const { supabase, userId } = await requireDashboardSession('seller')

  const { data: properties } = await supabase
    .from('properties')
    .select('id, title, location, district, price, area_sqft, status, is_published, created_at, property_images(url, is_primary), property_units(status)')
    .eq('seller_id', userId)
    .order('created_at', { ascending: false })

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <DashboardPageHeader
        eyebrow="Listings manager"
        title="Your portfolio, organized for action"
        description="Track every listing from one sortable command center. Desktop gets a structured dark table, while mobile switches to rich cards so edit and inventory actions stay easy everywhere."
        action={(
          <Link href="/seller/listings/new">
            <Button className="h-11 rounded-full bg-[linear-gradient(135deg,#C9A96E_0%,#E2C99A_48%,#A87B3F_100%)] px-5 text-[var(--text-inverse)] shadow-[0_18px_45px_rgba(201,169,110,0.22)] hover:brightness-105">
              <Plus className="size-4" />
              Add property
            </Button>
          </Link>
        )}
      />

      <DashboardPanel className="space-y-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <p className="dashboard-label">My listings</p>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--text-primary)]">
              {properties?.length ?? 0} properties in your pipeline
            </h2>
            <p className="max-w-3xl text-sm leading-7 text-[var(--text-secondary)]">
              Sort by title, price, status, or added date to spot what needs edits, publishing, or inventory follow-up.
            </p>
          </div>
        </div>

        {properties?.length ? (
          <SellerListingsTable listings={properties as any} />
        ) : (
          <div className="dashboard-empty flex flex-col items-center rounded-[2rem] px-6 py-16 text-center">
            <div className="flex size-18 items-center justify-center rounded-full border border-white/8 bg-white/[0.03] text-[var(--color-accent)]">
              <Building2 className="size-7" />
            </div>
            <h3 className="mt-6 text-2xl font-semibold text-[var(--text-primary)]">No listings yet</h3>
            <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--text-secondary)]">
              Launch your first property to start tracking availability, unit movement, and publishing status from this workspace.
            </p>
            <Link href="/seller/listings/new" className="mt-6">
              <Button
                variant="outline"
                className="rounded-full border-[rgba(201,169,110,0.22)] bg-white/[0.03] px-5 text-[var(--text-primary)] hover:border-[rgba(201,169,110,0.3)] hover:bg-white/[0.05] hover:text-[var(--color-accent)]"
              >
                <Plus className="size-4" />
                Create your first listing
              </Button>
            </Link>
          </div>
        )}
      </DashboardPanel>
    </div>
  )
}
