import Link from 'next/link'
import { Bell, Building2, CalendarRange, Compass, FolderKanban, Search } from 'lucide-react'

import { DashboardPageHeader } from '@/components/layout/DashboardPageHeader'
import { DashboardPanel } from '@/components/ui/DashboardPanel'
import { AreaTrendChart } from '@/components/ui/DashboardCharts'
import { PropertyCard } from '@/components/ui/PropertyCard'
import { StatCard } from '@/components/ui/StatCard'
import { buildMonthlyCountSeries, requireDashboardSession } from '@/lib/dashboard'

export default async function BuyerDashboard() {
  const session = await requireDashboardSession('buyer')
  const { supabase, userId } = session

  const [{ data: profile }, { count: activeBookings }, { count: liveListings }, { count: featuredListings }, { data: recentBookings }, { data: recommendedProperties }, { data: bookingActivity }] =
    await Promise.all([
      supabase.from('profiles').select('full_name, whatsapp_number, address').eq('user_id', userId).maybeSingle(),
      supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('buyer_id', userId).in('status', ['pending', 'confirmed']),
      supabase.from('properties').select('id', { count: 'exact', head: true }).eq('is_published', true).eq('status', 'available'),
      supabase.from('properties').select('id', { count: 'exact', head: true }).eq('is_published', true).eq('is_featured', true),
      supabase
        .from('bookings')
        .select('id, status, total_amount, created_at, properties(id, title, location, district)')
        .eq('buyer_id', userId)
        .order('created_at', { ascending: false })
        .limit(4),
      supabase
        .from('properties')
        .select('id, title, property_type, price, location, district, is_featured, property_images(url, is_primary)')
        .eq('is_published', true)
        .eq('status', 'available')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(6),
      supabase.from('bookings').select('created_at').eq('buyer_id', userId),
    ])

  const profileScore = [profile?.full_name, profile?.whatsapp_number, profile?.address, session.avatarUrl].filter(Boolean).length
  const bookingTrend = buildMonthlyCountSeries(bookingActivity ?? [], (booking: { created_at: string }) => booking.created_at)

  return (
    <>
      <DashboardPageHeader
        eyebrow="Buyer command center"
        title={`Welcome back, ${session.displayName.split(' ')[0]}`}
        description="Use the redesigned buyer workspace to search faster, keep bookings in view, and move between chats, projects, and alerts without friction."
        action={
          <>
            <Link
              href="/buyer/search"
              className="dashboard-primary-button px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em]"
            >
              Search properties
            </Link>
            <Link
              href="/buyer/bookings"
              className="dashboard-secondary-button px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em]"
            >
              Review bookings
            </Link>
          </>
        }
      />

      <DashboardPanel className="overflow-hidden">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-5">
            <div className="space-y-3">
              <p className="dashboard-label text-[var(--color-accent)]">Search first</p>
              <h2 className="font-display text-3xl font-medium tracking-[-0.03em] text-[var(--text-primary)] sm:text-4xl">
                Start with a focused search, then follow the strongest opportunities.
              </h2>
              <p className="max-w-2xl text-sm leading-7 text-[var(--text-secondary)]">
                The dashboard now gives search priority, surfaces featured inventory, and keeps your active bookings
                one click away.
              </p>
            </div>

            <form action="/buyer/search" className="grid gap-3 rounded-[1.75rem] border border-white/8 bg-white/[0.03] p-4 md:grid-cols-[1.4fr_1fr_1fr_auto]">
              <input
                type="text"
                name="location"
                placeholder="Search by area or district"
                className="dashboard-input px-4 py-3 text-sm"
              />
              <select name="listing_type" className="dashboard-select px-4 py-3 text-sm">
                <option value="">Listing type</option>
                <option value="sale">Sale</option>
                <option value="rent">Rent</option>
                <option value="installment">Installment</option>
              </select>
              <input
                type="number"
                name="min_price"
                placeholder="Minimum budget"
                className="dashboard-input px-4 py-3 text-sm"
              />
              <button
                type="submit"
                className="dashboard-primary-button px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em]"
              >
                Find now
              </button>
            </form>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {[
              {
                title: 'Featured inventory',
                body: `${featuredListings ?? 0} curated listings`,
                icon: Search,
              },
              {
                title: 'Project tracking',
                body: 'Monitor update feeds and delivery milestones',
                icon: FolderKanban,
              },
              {
                title: 'Direct support',
                body: 'Chat with agents and developers without leaving the workspace',
                icon: Bell,
              },
            ].map((item) => {
              const PanelIcon = item.icon
              return (
                <div key={item.title} className="rounded-[1.75rem] border border-white/8 bg-white/[0.03] p-5">
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-[rgba(201,169,110,0.14)] text-[var(--color-accent)]">
                    <PanelIcon className="size-5" />
                  </div>
                  <p className="mt-4 text-sm font-semibold text-[var(--text-primary)]">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{item.body}</p>
                </div>
              )
            })}
          </div>
        </div>
      </DashboardPanel>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Live listings"
          value={liveListings ?? 0}
          hint="Fresh supply currently available to browse."
          accent="gold"
          icon={<Building2 className="size-5" />}
          trend={{ direction: 'up', label: 'Always-on market feed' }}
        />
        <StatCard
          label="Active bookings"
          value={activeBookings ?? 0}
          hint="Pending or confirmed booking activity tied to your account."
          accent="blue"
          icon={<CalendarRange className="size-5" />}
        />
        <StatCard
          label="Unread alerts"
          value={session.unreadNotifications}
          hint="Messages, booking updates, and operational reminders."
          accent="rose"
          icon={<Bell className="size-5" />}
        />
        <StatCard
          label="Profile readiness"
          value={`${profileScore} / 4`}
          hint="Complete contact details for smoother agent follow-up."
          accent="emerald"
          icon={<Compass className="size-5" />}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <DashboardPanel className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="dashboard-label">Buyer activity</p>
              <h2 className="mt-2 font-display text-3xl font-medium tracking-[-0.03em] text-[var(--text-primary)]">
                Booking momentum
              </h2>
            </div>
            <span className="dashboard-badge" data-tone="blue">
              Last 6 months
            </span>
          </div>
          <AreaTrendChart
            data={bookingTrend}
            emptyLabel="Booking activity will start plotting here once you begin sending requests."
            label="Booking requests"
          />
        </DashboardPanel>

        <DashboardPanel className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="dashboard-label">Recommended</p>
              <h2 className="mt-2 font-display text-3xl font-medium tracking-[-0.03em] text-[var(--text-primary)]">
                Featured properties
              </h2>
            </div>
            <Link
              href="/buyer/search"
              className="text-sm font-medium text-[var(--color-accent)] transition hover:text-[var(--color-accent-light)]"
            >
              View all
            </Link>
          </div>

          {(recommendedProperties?.length ?? 0) > 0 ? (
            <div className="-mx-1 overflow-x-auto pb-2">
              <div className="flex min-w-full gap-4 px-1">
              {recommendedProperties?.map((property: any) => {
                const primaryImage = property.property_images?.find((image: any) => image.is_primary)?.url ?? property.property_images?.[0]?.url ?? null

                return (
                  <PropertyCard
                    key={property.id}
                    className="min-w-[290px] flex-1 md:min-w-[320px]"
                    href={`/properties/${property.id}`}
                    title={property.title}
                    type={property.property_type}
                    location={[property.location, property.district].filter(Boolean).join(', ')}
                    price={property.price}
                    imageUrl={primaryImage}
                    badge={property.is_featured ? 'Featured' : 'Ready to explore'}
                    subtitle="Premium dark-card treatment for dashboard recommendations."
                  />
                )
              })}
              </div>
            </div>
          ) : (
            <div className="dashboard-empty rounded-[1.75rem] px-5 py-10 text-sm">
              No published properties are available yet. New inventory will surface here automatically.
            </div>
          )}
        </DashboardPanel>

        <DashboardPanel className="space-y-5">
          <div>
            <p className="dashboard-label">Recent bookings</p>
            <h2 className="mt-2 font-display text-3xl font-medium tracking-[-0.03em] text-[var(--text-primary)]">
              Keep deals moving
            </h2>
          </div>

          {(recentBookings?.length ?? 0) > 0 ? (
            <div className="space-y-3">
              {recentBookings?.map((booking: any) => (
                <Link
                  key={booking.id}
                  href={`/buyer/bookings/${booking.id}`}
                  className="group block rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-4 transition hover:border-[rgba(201,169,110,0.2)] hover:bg-white/[0.05]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-[var(--text-primary)]">{booking.properties?.title ?? 'Property booking'}</p>
                      <p className="text-sm text-[var(--text-secondary)]">
                        {[booking.properties?.location, booking.properties?.district].filter(Boolean).join(', ') || 'Location pending'}
                      </p>
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
              You do not have any bookings yet. Start with the search panel above and create your first request.
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <QuickLink href="/buyer/projects" icon={FolderKanban} label="Project updates" description="Follow construction progress and milestones." />
            <QuickLink href="/buyer/notifications" icon={Bell} label="Alerts" description="Catch booking, chat, and verification notifications." />
          </div>
        </DashboardPanel>
      </div>
    </>
  )
}

function QuickLink({
  description,
  href,
  icon: Icon,
  label,
}: {
  description: string
  href: string
  icon: typeof Search
  label: string
}) {
  return (
    <Link
      href={href}
      className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-4 transition hover:border-[rgba(201,169,110,0.22)] hover:bg-white/[0.05]"
    >
      <div className="flex size-10 items-center justify-center rounded-2xl bg-[rgba(201,169,110,0.14)] text-[var(--color-accent)]">
        <Icon className="size-5" />
      </div>
      <p className="mt-4 text-sm font-semibold text-[var(--text-primary)]">{label}</p>
      <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{description}</p>
    </Link>
  )
}
