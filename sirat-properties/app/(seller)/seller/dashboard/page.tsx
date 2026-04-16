import Link from 'next/link'
import { Activity, BadgeDollarSign, Building2, ClipboardList, Eye, Plus, Users } from 'lucide-react'

import { DashboardPageHeader } from '@/components/layout/DashboardPageHeader'
import { DashboardPanel } from '@/components/ui/DashboardPanel'
import { AreaTrendChart, BarTrendChart } from '@/components/ui/DashboardCharts'
import { StatCard } from '@/components/ui/StatCard'
import { buildMonthlyCountSeries, requireDashboardSession } from '@/lib/dashboard'

export default async function SellerDashboard() {
  const session = await requireDashboardSession('seller')
  const { supabase, userId } = session

  const [
    { data: propertyIdRows },
    { count: totalListings },
    { count: liveListings },
    { count: draftListings },
    { data: listingHistory },
    { data: recentListings },
  ] = await Promise.all([
    supabase.from('properties').select('id').eq('seller_id', userId),
    supabase.from('properties').select('id', { count: 'exact', head: true }).eq('seller_id', userId),
    supabase
      .from('properties')
      .select('id', { count: 'exact', head: true })
      .eq('seller_id', userId)
      .eq('is_published', true)
      .eq('status', 'available'),
    supabase.from('properties').select('id', { count: 'exact', head: true }).eq('seller_id', userId).eq('is_published', false),
    supabase.from('properties').select('created_at').eq('seller_id', userId),
    supabase
      .from('properties')
      .select('id, title, location, district, price, status, is_published, created_at')
      .eq('seller_id', userId)
      .order('created_at', { ascending: false })
      .limit(6),
  ])

  const propertyIds = (propertyIdRows ?? []).map((property: { id: string }) => property.id)

  const [{ count: pendingBookings }, { data: recentBookings }, { count: activeAgents }, { data: bookingHistory }] = await Promise.all([
    propertyIds.length > 0
      ? supabase.from('bookings').select('id', { count: 'exact', head: true }).in('property_id', propertyIds).eq('status', 'pending')
      : Promise.resolve({ count: 0, data: null, error: null }),
    propertyIds.length > 0
      ? supabase
          .from('bookings')
          .select('id, status, total_amount, created_at, properties(id, title, location)')
          .in('property_id', propertyIds)
          .order('created_at', { ascending: false })
          .limit(5)
      : Promise.resolve({ count: null, data: [], error: null }),
    propertyIds.length > 0
      ? supabase.from('agent_listings').select('id', { count: 'exact', head: true }).in('property_id', propertyIds).eq('status', 'approved')
      : Promise.resolve({ count: 0, data: null, error: null }),
    propertyIds.length > 0
      ? supabase.from('bookings').select('created_at').in('property_id', propertyIds)
      : Promise.resolve({ count: null, data: [], error: null }),
  ])

  const listingTrend = buildMonthlyCountSeries(listingHistory ?? [], (listing: { created_at: string }) => listing.created_at)
  const bookingTrend = buildMonthlyCountSeries(bookingHistory ?? [], (booking: { created_at: string }) => booking.created_at)

  return (
    <>
      <DashboardPageHeader
        eyebrow="Seller command center"
        title="Portfolio performance at a glance"
        description="The seller workspace now opens with stronger hierarchy: inventory stats first, active bookings next, and direct actions for publishing, agents, and projects."
        action={
          <>
            <Link
              href="/seller/listings/new"
              className="dashboard-primary-button px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em]"
            >
              <Plus className="size-4" />
              Add property
            </Link>
            <Link
              href="/seller/listings"
              className="dashboard-secondary-button px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em]"
            >
              Open listings
            </Link>
          </>
        }
      />

      <DashboardPanel className="overflow-hidden">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-4">
            <p className="dashboard-label text-[var(--color-accent)]">Launch faster</p>
            <h2 className="font-display text-3xl font-medium tracking-[-0.03em] text-[var(--text-primary)] sm:text-4xl">
              Publish listings, respond to demand, and keep the pipeline visible.
            </h2>
            <p className="max-w-2xl text-sm leading-7 text-[var(--text-secondary)]">
              This dashboard redesign focuses on quick publishing actions, booking visibility, and a darker surface system
              that matches the new premium design language.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <FeatureNote
              icon={ClipboardList}
              title="Listings table"
              description="Review portfolio status, price, and action links in one dark table."
            />
            <FeatureNote
              icon={Users}
              title="Agent coordination"
              description="Jump straight into approvals and commission conversations."
            />
            <FeatureNote
              icon={Activity}
              title="Booking pipeline"
              description="See pending demand without leaving the main workspace."
            />
          </div>
        </div>
      </DashboardPanel>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total listings"
          value={totalListings ?? 0}
          hint="Properties tied to your seller account."
          accent="gold"
          icon={<Building2 className="size-5" />}
        />
        <StatCard
          label="Live inventory"
          value={liveListings ?? 0}
          hint="Published properties currently available to buyers."
          accent="emerald"
          icon={<Eye className="size-5" />}
        />
        <StatCard
          label="Draft or review"
          value={draftListings ?? 0}
          hint="Inventory still being prepared before launch."
          accent="blue"
          icon={<ClipboardList className="size-5" />}
        />
        <StatCard
          label="Pending bookings"
          value={pendingBookings ?? 0}
          hint="Requests waiting for your next action."
          accent="rose"
          icon={<BadgeDollarSign className="size-5" />}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <DashboardPanel className="space-y-5 xl:col-span-2">
          <div className="grid gap-6 xl:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="dashboard-label">Portfolio trend</p>
                  <h2 className="mt-2 font-display text-3xl font-medium tracking-[-0.03em] text-[var(--text-primary)]">
                    Listing releases
                  </h2>
                </div>
                <span className="dashboard-badge" data-tone="gold">
                  6 months
                </span>
              </div>
              <BarTrendChart
                data={listingTrend}
                emptyLabel="Listing releases will appear here once properties are created."
                label="Listings created"
                tone="accent"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="dashboard-label">Demand trend</p>
                  <h2 className="mt-2 font-display text-3xl font-medium tracking-[-0.03em] text-[var(--text-primary)]">
                    Buyer requests
                  </h2>
                </div>
                <span className="dashboard-badge" data-tone="blue">
                  Pipeline
                </span>
              </div>
              <AreaTrendChart
                data={bookingTrend}
                emptyLabel="Booking demand will plot here once buyers start submitting requests."
                label="Requests received"
              />
            </div>
          </div>
        </DashboardPanel>

        <DashboardPanel className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="dashboard-label">Listings table</p>
              <h2 className="mt-2 font-display text-3xl font-medium tracking-[-0.03em] text-[var(--text-primary)]">
                Latest portfolio entries
              </h2>
            </div>
            <Link href="/seller/listings" className="text-sm font-medium text-[var(--color-accent)]">
              Manage all
            </Link>
          </div>

          {(recentListings?.length ?? 0) > 0 ? (
            <div className="overflow-hidden rounded-[1.75rem] border border-white/8 bg-white/[0.03]">
              <div className="overflow-x-auto">
                <table className="dashboard-table min-w-full">
                  <thead>
                    <tr>
                      <th className="px-5 py-4 text-left">Property</th>
                      <th className="px-5 py-4 text-left">Status</th>
                      <th className="px-5 py-4 text-left">Price</th>
                      <th className="px-5 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentListings?.map((listing: any) => (
                      <tr key={listing.id} className="group border-t border-white/6">
                        <td className="px-5 py-4 align-top">
                          <div className="space-y-1">
                            <p className="text-sm font-semibold text-[var(--text-primary)]">{listing.title}</p>
                            <p className="text-sm text-[var(--text-secondary)]">
                              {[listing.location, listing.district].filter(Boolean).join(', ') || 'Location pending'}
                            </p>
                          </div>
                        </td>
                        <td className="px-5 py-4 align-top">
                          <span className="dashboard-badge" data-tone={badgeTone(listing.status, listing.is_published)}>
                            {listing.is_published ? listing.status : 'draft'}
                          </span>
                        </td>
                        <td className="px-5 py-4 align-top font-price text-sm text-[var(--color-accent)]">
                          {listing.price ? `BDT ${Number(listing.price).toLocaleString('en-US')}` : 'Negotiable'}
                        </td>
                        <td className="px-5 py-4 align-top">
                          <div className="flex justify-end gap-2 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
                            <Link
                              href={`/seller/inventory/${listing.id}`}
                              className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)] transition hover:border-[rgba(201,169,110,0.22)] hover:text-[var(--color-accent)]"
                            >
                              View
                            </Link>
                            <Link
                              href="/seller/listings"
                              className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)] transition hover:border-[rgba(201,169,110,0.22)] hover:text-[var(--color-accent)]"
                            >
                              Edit
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="dashboard-empty rounded-[1.75rem] px-5 py-10 text-sm">
              No listings yet. Use the gold action button above to publish your first property.
            </div>
          )}
        </DashboardPanel>

        <div className="grid gap-6">
          <DashboardPanel className="space-y-5">
            <div>
              <p className="dashboard-label">Booking demand</p>
              <h2 className="mt-2 font-display text-3xl font-medium tracking-[-0.03em] text-[var(--text-primary)]">
                Recent requests
              </h2>
            </div>

            {(recentBookings?.length ?? 0) > 0 ? (
              <div className="space-y-3">
                {recentBookings?.map((booking: any) => (
                  <Link
                    key={booking.id}
                    href="/seller/bookings"
                    className="block rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-4 transition hover:border-[rgba(201,169,110,0.22)] hover:bg-white/[0.05]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-[var(--text-primary)]">{booking.properties?.title ?? 'Property booking'}</p>
                        <p className="text-sm text-[var(--text-secondary)]">{booking.properties?.location ?? 'Location pending'}</p>
                      </div>
                      <span className="dashboard-badge" data-tone={booking.status === 'confirmed' ? 'emerald' : 'gold'}>
                        {booking.status}
                      </span>
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-4 text-xs text-[var(--text-tertiary)]">
                      <span>{new Date(booking.created_at).toLocaleDateString('en-US')}</span>
                      <span>{booking.total_amount ? `BDT ${Number(booking.total_amount).toLocaleString('en-US')}` : 'Amount pending'}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="dashboard-empty rounded-[1.75rem] px-5 py-10 text-sm">
                Booking requests will appear here once buyers start submitting interest.
              </div>
            )}
          </DashboardPanel>

          <DashboardPanel className="space-y-4">
            <p className="dashboard-label">Partner network</p>
            <h2 className="font-display text-3xl font-medium tracking-[-0.03em] text-[var(--text-primary)]">Approved agents</h2>
            <div className="rounded-[1.75rem] border border-white/8 bg-white/[0.03] p-5">
              <p className="font-price text-4xl text-[var(--color-accent)]">{activeAgents ?? 0}</p>
              <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">
                Active agent relationships across your current listings and commission workflows.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Shortcut href="/seller/agents" label="Agent approvals" />
              <Shortcut href="/seller/projects" label="Project updates" />
            </div>
          </DashboardPanel>
        </div>
      </div>
    </>
  )
}

function badgeTone(status: string, isPublished: boolean) {
  if (!isPublished) {
    return 'blue'
  }
  if (status === 'sold') {
    return 'rose'
  }
  if (status === 'booked') {
    return 'gold'
  }
  return 'emerald'
}

function FeatureNote({
  description,
  icon: Icon,
  title,
}: {
  description: string
  icon: typeof ClipboardList
  title: string
}) {
  return (
    <div className="rounded-[1.75rem] border border-white/8 bg-white/[0.03] p-5">
      <div className="flex size-11 items-center justify-center rounded-2xl bg-[rgba(201,169,110,0.14)] text-[var(--color-accent)]">
        <Icon className="size-5" />
      </div>
      <p className="mt-4 text-sm font-semibold text-[var(--text-primary)]">{title}</p>
      <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{description}</p>
    </div>
  )
}

function Shortcut({
  href,
  label,
}: {
  href: string
  label: string
}) {
  return (
    <Link
      href={href}
      className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] px-4 py-4 text-sm font-semibold text-[var(--text-primary)] transition hover:border-[rgba(201,169,110,0.22)] hover:text-[var(--color-accent)]"
    >
      {label}
    </Link>
  )
}
