'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react'

interface Installment {
  id: string
  installment_number: number
  due_date: string
  amount: number
  paid_at: string | null
  status: 'pending' | 'paid' | 'overdue'
}

interface Props {
  bookingId: string
  installments: Installment[]
  canMark: boolean
}

const STATUS_CONFIG = {
  pending: { label: 'Pending', tone: 'gold',    Icon: Clock },
  paid:    { label: 'Paid',    tone: 'emerald',  Icon: CheckCircle2 },
  overdue: { label: 'Overdue', tone: 'rose',     Icon: AlertCircle },
}

export function InstallmentSchedule({ bookingId, installments: init, canMark }: Props) {
  const [installments, setInstallments] = useState(init)
  const [marking, setMarking] = useState<string | null>(null)
  const router = useRouter()

  const paidTotal  = installments.filter((i) => i.status === 'paid').reduce((s, i) => s + i.amount, 0)
  const totalAmount = installments.reduce((s, i) => s + i.amount, 0)
  const progress   = totalAmount > 0 ? Math.round((paidTotal / totalAmount) * 100) : 0

  async function markPaid(id: string) {
    setMarking(id)
    const response = await fetch(`/api/installments/${id}/pay`, { method: 'PATCH' })
    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      toast.error(data.error ?? 'Installment could not be updated')
      setMarking(null)
      return
    }

    if (data.installment) {
      setInstallments((prev) =>
        prev.map((i) =>
          i.id === id ? { ...i, status: 'paid', paid_at: data.installment.paid_at } : i
        )
      )
    }

    toast.success('Installment marked as paid')
    router.refresh()
    setMarking(null)
  }

  if (!installments.length) return null

  return (
    <div className="space-y-5">
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[var(--text-tertiary)]">Payment progress</span>
          <span className="font-semibold text-[var(--color-accent)]">{progress}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full bg-[var(--color-accent)] transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-[var(--text-tertiary)]">
          <span>Paid: ৳{paidTotal.toLocaleString()}</span>
          <span>Total: ৳{totalAmount.toLocaleString()}</span>
        </div>
      </div>

      {/* Installment rows */}
      <div className="overflow-hidden rounded-2xl border border-white/8">
        {/* Header */}
        <div className="grid grid-cols-[2rem_1fr_auto_auto_auto] items-center gap-3 border-b border-white/8 bg-white/[0.025] px-4 py-3 text-xs font-medium text-[var(--text-tertiary)]">
          <span>#</span>
          <span>Due Date</span>
          <span className="text-right">Amount</span>
          <span className="text-center">Status</span>
          <span />
        </div>

        {/* Rows */}
        <div className="divide-y divide-white/[0.04]">
          {installments.map((inst) => {
            const cfg = STATUS_CONFIG[inst.status] ?? STATUS_CONFIG.pending
            const Icon = cfg.Icon
            const isOverdue = inst.status === 'overdue'

            return (
              <div
                key={inst.id}
                className={`grid grid-cols-[2rem_1fr_auto_auto_auto] items-center gap-3 px-4 py-3.5 text-sm transition-colors ${
                  isOverdue ? 'bg-[rgba(244,63,94,0.04)]' : 'hover:bg-white/[0.02]'
                }`}
              >
                {/* # */}
                <span className="text-xs font-medium text-[var(--text-tertiary)]">
                  {inst.installment_number}
                </span>

                {/* Due date */}
                <div>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {new Date(inst.due_date).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </p>
                  {inst.paid_at && (
                    <p className="mt-0.5 text-xs text-[var(--text-tertiary)]">
                      Paid {new Date(inst.paid_at).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </p>
                  )}
                </div>

                {/* Amount */}
                <p className="font-price text-sm font-medium text-[var(--text-primary)]">
                  ৳{Number(inst.amount).toLocaleString()}
                </p>

                {/* Status badge */}
                <span className="dashboard-badge flex items-center gap-1" data-tone={cfg.tone}>
                  <Icon className="size-3" />
                  {cfg.label}
                </span>

                {/* Action */}
                <div className="flex justify-end">
                  {inst.status === 'paid' ? (
                    <span className="text-xs text-[var(--text-tertiary)]">—</span>
                  ) : canMark ? (
                    <button
                      type="button"
                      onClick={() => markPaid(inst.id)}
                      disabled={marking === inst.id}
                      className="rounded-lg border border-[rgba(16,185,129,0.3)] bg-[rgba(16,185,129,0.08)] px-3 py-1 text-xs font-medium text-[var(--color-emerald,#10b981)] transition hover:bg-[rgba(16,185,129,0.14)] disabled:opacity-50"
                    >
                      {marking === inst.id ? '…' : 'Mark paid'}
                    </button>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
