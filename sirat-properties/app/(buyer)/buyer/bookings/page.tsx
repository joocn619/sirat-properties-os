import Link from 'next/link'
import { ClipboardList, MapPin, CalendarClock, ArrowRight } from 'lucide-react'

import { DashboardPageHeader } from '@/components/layout/DashboardPageHeader'
import { DashboardPanel } from '@/components/ui/DashboardPanel'
import { requireDashboardSession } from '@/lib/dashboard'

const STATUS: Record<string, { label: string; tone: string }> = {
  pending:   { label: 'Pending',   tone: 'gold' },
  confirmed: { label: 'Confirmed', tone: 'blue' },
  completed: { label: 'Completed', tone: 'emerald' },
  cancelled: { label: 'Cancelled', tone: 'rose' },
}

const TYPE_LABEL: Record<string, string> = {
  full_payment: 'Full Payment',
  installment:  'Installment',
  rent:         'Rental',
}

export default async function BuyerBookingsPage() {
  const { supabase, userId } = await requireDashboardSession('buyer')

  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      *,
      properties(id, title, location, district),
      property_units(unit_number),
      installments(id, status, due_date, amount)
    `)
    .eq('buyer_id', userId)
    .order('created_at', { ascending: false })

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <DashboardPageHeader
        eyebrow="Booking activity"
        title="Your bookings"
        description="Track all your property booking requests, installment schedules, and deal statuses in one place."
        action={
          <Link
            href="/buyer/search"
            className="dashboard-primary-button gap-2 px-5 py-2.5 text-sm font-semibold tracking-wide"
          >
            Browse Properties
            <ArrowRight className="size-4" />
          </Link>
        }
      />

      {!bookings?.length ? (
        <div className="dashboard-empty flex flex-col items-center rounded-[2rem] px-6 py-20 text-center">
          <div className="flex size-18 items-center justify-center rounded-full border border-white/8 bg-white/[0.03] text-[var(--color-accent)]">
            <ClipboardList className="size-7" />
          </div>
          <h3 className="mt-6 text-2xl font-semibold text-[var(--text-primary)]">No bookings yet</h3>
          <p className="mt-3 max-w-md text-sm leading-7 text-[var(--text-secondary)]">
            Find a property you love and submit a booking request — it only takes a minute.
          </p>
          <Link
            href="/buyer/search"
            className="dashboard-primary-button mt-8 gap-2 px-6 py-3 text-sm font-semibold tracking-wide"
          >
            Search Properties
            <ArrowRight className="size-4" />
          </Link>
        </div>
      ) : (
        <DashboardPanel className="space-y-4">
          <div className="space-y-2">
            <p className="dashboard-label text-[var(--color-accent)]">All bookings</p>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--text-primary)]">
              {bookings.length} booking{bookings.length !== 1 ? 's' : ''}
            </h2>
          </div>

          <div className="space-y-3">
            {bookings.map((b: any) => {
              const prop = b.properties
              const installments = b.installments ?? []
              const paid = installments.filter((i: any) => i.status === 'paid').length
              const nextDue = installments
                .filter((i: any) => i.status === 'pending')
                .sort((a: any, c: any) => a.due_date.localeCompare(c.due_date))[0]
              const cfg = STATUS[b.status] ?? STATUS.pending

              return (
                <Link key={b.id} href={`/buyer/bookings/${b.id}`}>
                  <article className="group flex items-center justify-between gap-4 rounded-[1.5rem] border border-white/8 bg-white/[0.025] px-5 py-4 transition hover:border-[rgba(201,169,110,0.2)] hover:bg-white/[0.04]">
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.03] text-[var(--color-accent)]">
                        <ClipboardList className="size-5" />
                      </div>

                      <div className="min-w-0 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                            {prop?.title ?? 'Property'}
                          </p>
                          <span className="dashboard-badge" data-tone={cfg.tone}>{cfg.label}</span>
                          <span className="dashboard-badge" data-tone="blue">{TYPE_LABEL[b.booking_type]}</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-secondary)]">
                          {prop?.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="size-3" />
                              {[prop.location, prop.district].filter(Boolean).join(', ')}
                            </span>
                          )}
                          {b.property_units?.unit_number && (
                            <span>Unit {b.property_units.unit_number}</span>
                          )}
                          {installments.length > 0 && (
                            <span>{paid}/{installments.length} installments paid</span>
                          )}
                        </div>

                        {nextDue && (
                          <p className="flex items-center gap-1 text-xs text-[var(--color-accent)]">
                            <CalendarClock className="size-3" />
                            Next due: ৳{Number(nextDue.amount).toLocaleString()} —{' '}
                            {new Date(nextDue.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-1">
                      {b.total_amount && (
                        <p className="font-price text-base font-medium text-[var(--text-primary)]">
                          ৳{Number(b.total_amount).toLocaleString()}
                        </p>
                      )}
                      <ArrowRight className="size-4 text-[var(--text-tertiary)] transition group-hover:translate-x-0.5 group-hover:text-[var(--color-accent)]" />
                    </div>
                  </article>
                </Link>
              )
            })}
          </div>
        </DashboardPanel>
      )}
    </div>
  )
}
