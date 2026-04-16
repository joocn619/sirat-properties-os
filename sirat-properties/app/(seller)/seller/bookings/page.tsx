import { ClipboardList } from 'lucide-react'

import { SellerBookingCard } from '@/components/booking/SellerBookingCard'
import { DashboardPageHeader } from '@/components/layout/DashboardPageHeader'
import { DashboardPanel } from '@/components/ui/DashboardPanel'
import { requireDashboardSession } from '@/lib/dashboard'

export default async function SellerBookingsPage() {
  const { supabase, userId } = await requireDashboardSession('seller')

  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      *,
      properties!inner(id, title, seller_id),
      property_units(unit_number),
      buyer:users!buyer_id(id, email, profiles(full_name, whatsapp_number, avatar_url)),
      installments(status)
    `)
    .eq('properties.seller_id', userId)
    .order('created_at', { ascending: false })

  const pending = bookings?.filter((booking: any) => booking.status === 'pending') ?? []
  const others = bookings?.filter((booking: any) => booking.status !== 'pending') ?? []

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <DashboardPageHeader
        eyebrow="Booking operations"
        title="Manage requests, approvals, and conversions"
        description="Respond quickly to pending buyers, keep installment progress visible, and move confirmed deals through to completion without leaving the seller workspace."
      />

      {pending.length ? (
        <DashboardPanel className="space-y-5">
          <div className="space-y-2">
            <p className="dashboard-label text-[var(--color-accent)]">Priority queue</p>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--text-primary)]">
              Pending requests ({pending.length})
            </h2>
            <p className="text-sm leading-7 text-[var(--text-secondary)]">
              These buyers are waiting for confirmation. Approve or reject directly from the card actions below.
            </p>
          </div>

          <div className="space-y-4">
            {pending.map((booking: any) => (
              <SellerBookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        </DashboardPanel>
      ) : null}

      {others.length ? (
        <DashboardPanel className="space-y-5">
          <div className="space-y-2">
            <p className="dashboard-label">Booking history</p>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--text-primary)]">Confirmed and archived deals</h2>
            <p className="text-sm leading-7 text-[var(--text-secondary)]">
              Review the full pipeline after approval, including completed and cancelled activity.
            </p>
          </div>

          <div className="space-y-4">
            {others.map((booking: any) => (
              <SellerBookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        </DashboardPanel>
      ) : null}

      {!bookings?.length ? (
        <div className="dashboard-empty flex flex-col items-center rounded-[2rem] px-6 py-16 text-center">
          <div className="flex size-18 items-center justify-center rounded-full border border-white/8 bg-white/[0.03] text-[var(--color-accent)]">
            <ClipboardList className="size-7" />
          </div>
          <h3 className="mt-6 text-2xl font-semibold text-[var(--text-primary)]">No bookings yet</h3>
          <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--text-secondary)]">
            Once buyers start submitting requests, they will appear here with payment type, unit details, and action controls.
          </p>
        </div>
      ) : null}
    </div>
  )
}
