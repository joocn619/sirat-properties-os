'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface Unit {
  id: string
  unit_number: string
  floor: number | null
  price: number | null
}

interface Props {
  propertyId: string
  propertyTitle: string
  propertyPrice?: number
  units: Unit[]
}

type BookingType = 'full_payment' | 'installment' | 'rent'

const BOOKING_TYPES: Array<{ value: BookingType; label: string; desc: string }> = [
  { value: 'full_payment', label: 'Full payment', desc: 'Pay the full amount in one request.' },
  { value: 'installment', label: 'Installment plan', desc: 'Split the amount into scheduled payments.' },
  { value: 'rent', label: 'Rental request', desc: 'Start the booking as a rental agreement.' },
]

export function BookingForm({ propertyId, propertyTitle, propertyPrice, units }: Props) {
  const router = useRouter()

  const [type, setType] = useState<BookingType>('full_payment')
  const [selectedUnit, setSelectedUnit] = useState<string>(units[0]?.id ?? '')
  const [totalAmount, setTotalAmount] = useState(String(propertyPrice ?? units[0]?.price ?? ''))
  const [advanceAmount, setAdvanceAmount] = useState('')
  const [installmentCount, setInstallmentCount] = useState('12')
  const [intervalDays, setIntervalDays] = useState('30')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleUnitSelect(unitId: string) {
    setSelectedUnit(unitId)
    const unit = units.find((entry) => entry.id === unitId)
    if (unit?.price) {
      setTotalAmount(unit.price.toString())
    }
  }

  const perInstallment =
    type === 'installment' && totalAmount && advanceAmount && installmentCount
      ? Math.ceil((Number(totalAmount) - Number(advanceAmount)) / Number(installmentCount))
      : null

  async function handleSubmit() {
    if (!totalAmount) {
      setError('Enter the total amount.')
      return
    }

    if (units.length > 0 && !selectedUnit) {
      setError('Select a unit before submitting the booking.')
      return
    }

    if (type === 'installment' && !advanceAmount) {
      setError('Installment bookings need an advance amount.')
      return
    }

    setLoading(true)
    setError('')

    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        propertyId,
        unitId: selectedUnit || null,
        bookingType: type,
        totalAmount: Number(totalAmount),
        advanceAmount: advanceAmount ? Number(advanceAmount) : null,
        installmentCount: type === 'installment' ? Number(installmentCount) : null,
        intervalDays: type === 'installment' ? Number(intervalDays) : null,
        notes,
      }),
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      const message = data.error ?? 'Booking could not be created.'
      setError(message)
      toast.error(message)
      setLoading(false)
      return
    }

    toast.success('Booking request sent')
    router.push(data.redirectTo ?? `/buyer/bookings/${data.bookingId}`)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-xl border border-[rgba(244,63,94,0.2)] bg-[rgba(244,63,94,0.06)] px-4 py-3 text-sm text-[var(--color-rose,#f43f5e)]">
          {error}
        </div>
      ) : null}

      {/* Property summary */}
      <div className="rounded-xl border border-[rgba(201,169,110,0.2)] bg-[rgba(201,169,110,0.06)] px-4 py-3">
        <p className="dashboard-label mb-1">Property</p>
        <p className="text-sm font-semibold text-[var(--text-primary)]">{propertyTitle}</p>
        {propertyPrice ? (
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            Base price: ৳{propertyPrice.toLocaleString()}
          </p>
        ) : null}
      </div>

      {/* Unit selector */}
      {units.length > 0 ? (
        <div>
          <label className="dashboard-label mb-2 block">Choose a unit</label>
          <div className="grid grid-cols-2 gap-2">
            {units.map((unit) => (
              <button
                key={unit.id}
                type="button"
                onClick={() => handleUnitSelect(unit.id)}
                className={`rounded-xl border px-3 py-3 text-left text-sm transition-colors ${
                  selectedUnit === unit.id
                    ? 'border-[var(--color-accent)] bg-[rgba(201,169,110,0.08)] text-[var(--text-primary)]'
                    : 'border-white/8 bg-white/[0.025] text-[var(--text-secondary)] hover:border-white/[0.12] hover:bg-white/[0.04]'
                }`}
              >
                <p className="font-medium text-[var(--text-primary)]">{unit.unit_number}</p>
                <p className="mt-0.5 text-xs text-[var(--text-tertiary)]">
                  {[unit.floor ? `Floor ${unit.floor}` : null, unit.price ? `৳${unit.price.toLocaleString()}` : null]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {/* Payment type */}
      <div>
        <label className="dashboard-label mb-2 block">Payment type</label>
        <div className="space-y-2">
          {BOOKING_TYPES.map((bookingType) => (
            <button
              key={bookingType.value}
              type="button"
              onClick={() => setType(bookingType.value)}
              className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${
                type === bookingType.value
                  ? 'border-[var(--color-accent)] bg-[rgba(201,169,110,0.08)]'
                  : 'border-white/8 bg-white/[0.025] hover:border-white/[0.12] hover:bg-white/[0.04]'
              }`}
            >
              <p className="text-sm font-medium text-[var(--text-primary)]">{bookingType.label}</p>
              <p className="mt-0.5 text-xs text-[var(--text-tertiary)]">{bookingType.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Amount fields */}
      <div className="space-y-4">
        <div>
          <label className="dashboard-label mb-1.5 block">
            Total amount (৳) <span className="text-[var(--color-rose,#f43f5e)]">*</span>
          </label>
          <input
            type="number"
            value={totalAmount}
            onChange={(event) => setTotalAmount(event.target.value)}
            placeholder="e.g. 8500000"
            className="dashboard-input w-full px-4 py-3 text-sm"
          />
        </div>

        {type === 'installment' || type === 'rent' ? (
          <div>
            <label className="dashboard-label mb-1.5 block">
              Advance amount (৳) <span className="text-[var(--color-rose,#f43f5e)]">*</span>
            </label>
            <input
              type="number"
              value={advanceAmount}
              onChange={(event) => setAdvanceAmount(event.target.value)}
              placeholder="e.g. 500000"
              className="dashboard-input w-full px-4 py-3 text-sm"
            />
          </div>
        ) : null}

        {type === 'installment' ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="dashboard-label mb-1.5 block">Installment count</label>
              <input
                type="number"
                value={installmentCount}
                onChange={(event) => setInstallmentCount(event.target.value)}
                min={2}
                max={120}
                className="dashboard-input w-full px-4 py-3 text-sm"
              />
            </div>
            <div>
              <label className="dashboard-label mb-1.5 block">Payment interval</label>
              <select
                value={intervalDays}
                onChange={(event) => setIntervalDays(event.target.value)}
                className="dashboard-select w-full px-4 py-3 text-sm"
              >
                <option value="30">Monthly (30 days)</option>
                <option value="60">Every 60 days</option>
                <option value="90">Quarterly (90 days)</option>
              </select>
            </div>
          </div>
        ) : null}

        {perInstallment ? (
          <div className="rounded-xl border border-[rgba(16,185,129,0.2)] bg-[rgba(16,185,129,0.06)] px-4 py-3">
            <p className="text-sm text-[var(--text-primary)]">
              Estimated installment:{' '}
              <span className="font-semibold text-[var(--color-emerald,#10b981)]">
                ৳{perInstallment.toLocaleString()}
              </span>
            </p>
            <p className="mt-0.5 text-xs text-[var(--text-tertiary)]">
              Advance ৳{Number(advanceAmount || 0).toLocaleString()} + {installmentCount} scheduled payments
            </p>
          </div>
        ) : null}
      </div>

      {/* Notes */}
      <div>
        <label className="dashboard-label mb-1.5 block">Notes</label>
        <textarea
          rows={3}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Add any requirement or message for the seller..."
          className="dashboard-textarea w-full resize-none px-4 py-3 text-sm"
        />
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading}
        className="dashboard-primary-button h-12 w-full text-sm font-semibold disabled:opacity-60"
      >
        {loading ? 'Submitting…' : 'Send booking request'}
      </button>
    </div>
  )
}
