'use client'

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'react-hot-toast'

import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/format'

export interface Unit {
  area_sqft: number | ''
  floor: number | ''
  price: number | ''
  unit_number: string
}

interface Props {
  onChange: (units: Unit[]) => void
}

export function UnitManager({ onChange }: Props) {
  const [units, setUnits] = useState<Unit[]>([])
  const [form, setForm] = useState<Unit>({
    unit_number: '',
    floor: '',
    area_sqft: '',
    price: '',
  })

  function addUnit() {
    if (!form.unit_number.trim()) {
      toast.error('Unit number required')
      return
    }

    const updated = [...units, { ...form }]
    setUnits(updated)
    onChange(updated)
    setForm({ unit_number: '', floor: '', area_sqft: '', price: '' })
    toast.success('Unit added to inventory draft')
  }

  function removeUnit(index: number) {
    const updated = units.filter((_, unitIndex) => unitIndex !== index)
    setUnits(updated)
    onChange(updated)
    toast.success('Unit removed')
  }

  return (
    <div className="space-y-4">
      <div className="rounded-[1.75rem] border border-white/8 bg-white/[0.03] p-4 sm:p-5">
        <div className="mb-4 space-y-2">
          <p className="dashboard-label">Unit composer</p>
          <p className="text-sm leading-7 text-[var(--text-secondary)]">
            Track every flat, floor, and price point before publishing. This becomes your inventory command panel after launch.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <input
            placeholder="Unit No. e.g. A-101"
            value={form.unit_number}
            onChange={(event) => setForm({ ...form, unit_number: event.target.value })}
            className="dashboard-input px-4 py-3 text-sm"
          />
          <input
            type="number"
            placeholder="Floor"
            value={form.floor}
            onChange={(event) => setForm({ ...form, floor: event.target.value ? Number(event.target.value) : '' })}
            className="dashboard-input px-4 py-3 text-sm"
          />
          <input
            type="number"
            placeholder="Area (sqft)"
            value={form.area_sqft}
            onChange={(event) => setForm({ ...form, area_sqft: event.target.value ? Number(event.target.value) : '' })}
            className="dashboard-input px-4 py-3 text-sm"
          />
          <input
            type="number"
            placeholder="Price (BDT)"
            value={form.price}
            onChange={(event) => setForm({ ...form, price: event.target.value ? Number(event.target.value) : '' })}
            className="dashboard-input px-4 py-3 text-sm"
          />
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={addUnit}
          className="mt-4 border-white/10 bg-white/[0.03] text-[var(--text-primary)] hover:border-[rgba(201,169,110,0.22)] hover:bg-white/[0.05] hover:text-[var(--color-accent)]"
        >
          <Plus className="size-4" />
          Add unit
        </Button>
      </div>

      {units.length ? (
        <>
          <div className="hidden overflow-hidden rounded-[1.75rem] border border-white/8 bg-white/[0.03] md:block">
            <div className="overflow-x-auto">
              <table className="dashboard-table min-w-full">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left">Unit</th>
                    <th className="px-4 py-3 text-left">Floor</th>
                    <th className="px-4 py-3 text-left">Area</th>
                    <th className="px-4 py-3 text-left">Price</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {units.map((unit, index) => (
                    <tr key={`${unit.unit_number}-${index}`} className="group">
                      <td className="px-4 py-3 text-sm font-semibold text-[var(--text-primary)]">{unit.unit_number}</td>
                      <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">{unit.floor || '-'}</td>
                      <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">
                        {unit.area_sqft ? `${unit.area_sqft} sqft` : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-price text-sm font-medium text-[var(--color-accent)]">
                          {formatCurrency(typeof unit.price === 'number' ? unit.price : null)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => removeUnit(index)}
                          className="inline-flex items-center gap-2 rounded-full border border-[rgba(244,63,94,0.2)] bg-[rgba(244,63,94,0.08)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-rose)] transition hover:bg-[rgba(244,63,94,0.14)]"
                        >
                          <Trash2 className="size-3.5" />
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-3 md:hidden">
            {units.map((unit, index) => (
              <div key={`${unit.unit_number}-${index}`} className="dashboard-panel rounded-[1.5rem] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-[var(--text-primary)]">{unit.unit_number}</p>
                    <p className="mt-1 text-xs text-[var(--text-secondary)]">
                      Floor {unit.floor || '-'} · {unit.area_sqft ? `${unit.area_sqft} sqft` : 'Area pending'}
                    </p>
                  </div>
                  <span className="dashboard-badge" data-tone="blue">Draft</span>
                </div>
                <div className="mt-4 flex items-center justify-between gap-4">
                  <p className="font-price text-sm font-medium text-[var(--color-accent)]">
                    {formatCurrency(typeof unit.price === 'number' ? unit.price : null)}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeUnit(index)}
                    className="inline-flex items-center gap-2 rounded-full border border-[rgba(244,63,94,0.2)] bg-[rgba(244,63,94,0.08)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-rose)] transition hover:bg-[rgba(244,63,94,0.14)]"
                  >
                    <Trash2 className="size-3.5" />
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="dashboard-empty rounded-[1.75rem] px-5 py-12 text-center">
          <p className="text-sm leading-7 text-[var(--text-secondary)]">
            No units added yet. Keep this blank for single-inventory properties, or add multiple units for towers and projects.
          </p>
        </div>
      )}
    </div>
  )
}
