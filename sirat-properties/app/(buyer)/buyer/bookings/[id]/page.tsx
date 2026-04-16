import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin, Hash } from 'lucide-react'

import { BookingStatusActions } from '@/components/booking/BookingStatusActions'
import { DashboardPanel } from '@/components/ui/DashboardPanel'
import { InstallmentSchedule } from '@/components/booking/InstallmentSchedule'
import { requireDashboardSession } from '@/lib/dashboard'

const STATUS: Record<string, { label: string; tone: string }> = {
  pending:   { label: 'Pending',   tone: 'gold' },
  confirmed: { label: 'Confirmed', tone: 'blue' },
  completed: { label: 'Completed', tone: 'emerald' },
  cancelled: { label: 'Cancelled', tone: 'rose' },
}

const TYPE_LABEL: Record<string, string> = {
  full_payment: 'Full Payment',
  installment:  'Installment Plan',
  rent:         'Rental Agreement',
}

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { supabase, userId } = await requireDashboardSession('buyer')

  const { data: booking } = await supabase
    .from('bookings')
    .select(`
      *,
      properties(id, title, location, district, address),
      property_units(unit_number, floor),
      installments(*)
    `)
    .eq('id', id)
    .single()

  if (!booking) notFound()
  if (booking.buyer_id !== userId) redirect('/buyer/bookings')

  const prop = booking.properties as any
  const installments = (booking.installments ?? []).sort(
    (a: any, b: any) => a.installment_number - b.installment_number
  )
  const cfg = STATUS[booking.status] ?? STATUS.pending
  const paidCount = installments.filter((i: any) => i.status === 'paid').length

  const infoItems = [
    { label: 'Payment type',  value: TYPE_LABEL[booking.booking_type] },
    { label: 'Total amount',  value: `৳${Number(booking.total_amount ?? 0).toLocaleString()}` },
    booking.advance_amount
      ? { label: 'Advance paid', value: `৳${Number(booking.advance_amount).toLocaleString()}` }
      : null,
    booking.property_units?.unit_number
      ? { label: 'Unit', value: `Unit ${booking.property_units.unit_number}${booking.property_units.floor ? ` · Floor ${booking.property_units.floor}` : ''}` }
      : null,
    installments.length > 0
      ? { label: 'Installments', value: `${paidCount} / ${installments.length} paid` }
      : null,
    { label: 'Booking date', value: new Date(booking.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) },
  ].filter(Boolean) as { label: string; value: string }[]

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
      {/* Back */}
      <div className="flex items-center gap-3">
        <Link
          href="/buyer/bookings"
          className="flex size-9 items-center justify-center rounded-xl border border-white/8 bg-white/[0.03] text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <span className="text-sm text-[var(--text-tertiary)]">All bookings</span>
      </div>

      {/* Header card */}
      <div className="relative overflow-hidden rounded-[2rem] border border-white/8 bg-[linear-gradient(135deg,rgba(25,27,37,0.98)_0%,rgba(16,18,27,0.99)_48%,rgba(17,23,34,0.98)_100%)] px-7 py-6 shadow-[0_28px_80px_rgba(0,0,0,0.28)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(201,169,110,0.12),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.08),transparent_30%)]" />
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="dashboard-badge" data-tone={cfg.tone}>{cfg.label}</span>
              <span className="dashboard-badge" data-tone="blue">{TYPE_LABEL[booking.booking_type]}</span>
            </div>
            <h1 className="font-display text-3xl font-medium tracking-tight text-[var(--text-primary)]">
              {prop?.title ?? 'Booking Detail'}
            </h1>
            {prop?.location && (
              <p className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)]">
                <MapPin className="size-3.5" />
                {[prop.location, prop.district].filter(Boolean).join(', ')}
              </p>
            )}
          </div>
          {booking.total_amount && (
            <div className="shrink-0 sm:text-right">
              <p className="dashboard-label mb-1">Total amount</p>
              <p className="font-price text-3xl font-medium text-[var(--color-accent)]">
                ৳{Number(booking.total_amount).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Info pills */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {infoItems.map((item, i) => (
          <div key={i} className="rounded-[1.25rem] border border-white/8 bg-white/[0.03] px-4 py-3">
            <p className="dashboard-label mb-2">{item.label}</p>
            <p className="text-sm font-medium text-[var(--text-primary)]">{item.value}</p>
          </div>
        ))}
      </div>

      {/* ID */}
      <div className="flex items-center gap-2 px-1">
        <Hash className="size-3 text-[var(--text-tertiary)]" />
        <p className="font-price text-xs text-[var(--text-tertiary)] select-all">{booking.id}</p>
      </div>

      {/* Notes */}
      {booking.notes && (
        <DashboardPanel>
          <p className="dashboard-label mb-3">Notes from buyer</p>
          <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{booking.notes}</p>
        </DashboardPanel>
      )}

      {/* Cancel action */}
      {booking.status === 'pending' && (
        <BookingStatusActions bookingId={booking.id} role="buyer" />
      )}

      {/* Installment schedule */}
      {installments.length > 0 && (
        <DashboardPanel className="space-y-5">
          <div className="space-y-1">
            <p className="dashboard-label text-[var(--color-accent)]">Payment schedule</p>
            <h2 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">
              Installment tracker
            </h2>
          </div>
          <InstallmentSchedule
            bookingId={booking.id}
            installments={installments}
            canMark={true}
          />
        </DashboardPanel>
      )}
    </div>
  )
}
