'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarDays, CheckCheck, MessageCircleMore, XCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'

import { Button } from '@/components/ui/button'

const STATUS_CONFIG: Record<string, { label: string; tone: 'gold' | 'blue' | 'emerald' | 'rose' }> = {
  pending: { label: 'Pending', tone: 'gold' },
  confirmed: { label: 'Confirmed', tone: 'blue' },
  completed: { label: 'Completed', tone: 'emerald' },
  cancelled: { label: 'Cancelled', tone: 'rose' },
}

const TYPE_LABEL: Record<string, string> = {
  full_payment: 'সম্পূর্ণ পরিশোধ',
  installment: 'কিস্তি',
  rent: 'ভাড়া',
}

export function SellerBookingCard({ booking }: { booking: any }) {
  const [status, setStatus] = useState(booking.status)
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()

  const buyer = booking.buyer?.profiles
  const installments = booking.installments ?? []
  const paidCount = installments.filter((installment: any) => installment.status === 'paid').length

  async function updateStatus(newStatus: string) {
    setLoading(newStatus)
    const response = await fetch(`/api/bookings/${booking.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      toast.error(data.error ?? 'Booking status update failed')
      setLoading(null)
      return
    }

    setStatus(newStatus)
    toast.success(`Booking marked as ${newStatus}`)
    router.refresh()
    setLoading(null)
  }

  return (
    <article className="dashboard-panel rounded-[1.75rem] p-5">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          {buyer?.avatar_url ? (
            <img src={buyer.avatar_url} alt="" className="size-12 rounded-full object-cover ring-1 ring-white/10" />
          ) : (
            <div className="flex size-12 items-center justify-center rounded-full border border-white/8 bg-white/[0.03] text-sm text-[var(--text-secondary)]">
              {buyer?.full_name?.slice(0, 1) ?? 'B'}
            </div>
          )}

          <div className="min-w-0 space-y-3">
            <div className="space-y-1">
              <p className="text-base font-semibold text-[var(--text-primary)]">{buyer?.full_name ?? booking.buyer?.email}</p>
              <p className="text-sm text-[var(--text-secondary)]">{booking.properties?.title}</p>
              {booking.property_units?.unit_number ? (
                <p className="text-xs uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
                  Unit {booking.property_units.unit_number}
                </p>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="dashboard-badge" data-tone={STATUS_CONFIG[status]?.tone ?? 'gold'}>
                {STATUS_CONFIG[status]?.label ?? status}
              </span>
              <span className="dashboard-badge" data-tone="blue">
                {TYPE_LABEL[booking.booking_type]}
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <InfoPill label="Deal value" value={`৳${Number(booking.total_amount ?? 0).toLocaleString()}`} />
              <InfoPill label="Installments" value={installments.length ? `${paidCount}/${installments.length} paid` : 'One-time'} />
              <InfoPill
                label="Created"
                value={new Date(booking.created_at).toLocaleDateString('bn-BD', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start gap-3 lg:items-end">
          {buyer?.whatsapp_number ? (
            <a
              href={`https://wa.me/88${buyer.whatsapp_number}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-[rgba(16,185,129,0.2)] bg-[rgba(16,185,129,0.08)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-emerald)] transition hover:bg-[rgba(16,185,129,0.14)]"
            >
              <MessageCircleMore className="size-3.5" />
              WhatsApp
            </a>
          ) : null}

          <div className="rounded-[1.15rem] border border-white/8 bg-white/[0.03] px-4 py-3 text-right">
            <p className="dashboard-label">Booking type</p>
            <p className="mt-2 text-sm text-[var(--text-primary)]">{TYPE_LABEL[booking.booking_type]}</p>
          </div>
        </div>
      </div>

      {status === 'pending' ? (
        <div className="mt-5 flex flex-wrap gap-3 border-t border-white/8 pt-5">
          <Button
            size="sm"
            disabled={Boolean(loading)}
            onClick={() => updateStatus('confirmed')}
            className="rounded-full bg-[linear-gradient(135deg,#3B82F6_0%,#60A5FA_100%)] px-4 text-white hover:brightness-105"
          >
            <CheckCheck className="size-4" />
            {loading === 'confirmed' ? 'Confirming...' : 'Confirm booking'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={Boolean(loading)}
            onClick={() => updateStatus('cancelled')}
            className="rounded-full border-[rgba(244,63,94,0.2)] bg-[rgba(244,63,94,0.08)] px-4 text-[var(--color-rose)] hover:bg-[rgba(244,63,94,0.14)]"
          >
            <XCircle className="size-4" />
            {loading === 'cancelled' ? 'Rejecting...' : 'Reject request'}
          </Button>
        </div>
      ) : null}

      {status === 'confirmed' ? (
        <div className="mt-5 flex flex-wrap gap-3 border-t border-white/8 pt-5">
          <Button
            size="sm"
            disabled={Boolean(loading)}
            onClick={() => updateStatus('completed')}
            className="rounded-full bg-[linear-gradient(135deg,#10B981_0%,#34D399_100%)] px-4 text-[#03140f] hover:brightness-105"
          >
            <CalendarDays className="size-4" />
            {loading === 'completed' ? 'Updating...' : 'Mark as completed / sold'}
          </Button>
        </div>
      ) : null}
    </article>
  )
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.15rem] border border-white/8 bg-white/[0.03] px-4 py-3">
      <p className="dashboard-label">{label}</p>
      <p className="mt-2 text-sm text-[var(--text-primary)]">{value}</p>
    </div>
  )
}
