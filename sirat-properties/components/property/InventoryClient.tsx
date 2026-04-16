'use client'

import { useState } from 'react'
import { ArrowRight, Plus } from 'lucide-react'
import { toast } from 'react-hot-toast'

import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/format'
import { createClient } from '@/lib/supabase/client'

interface Unit {
  area_sqft: number | null
  floor: number | null
  id: string
  price: number | null
  status: 'available' | 'booked' | 'sold'
  unit_number: string
}

const STATUS_CONFIG = {
  available: {
    label: 'Available',
    next: ['booked', 'sold'] as const,
    tone: 'emerald' as const,
  },
  booked: {
    label: 'Booked',
    next: ['available', 'sold'] as const,
    tone: 'gold' as const,
  },
  sold: {
    label: 'Sold',
    next: ['available'] as const,
    tone: 'rose' as const,
  },
}

export function InventoryClient({
  propertyId,
  initialUnits,
}: {
  initialUnits: Unit[]
  propertyId: string
}) {
  const [units, setUnits] = useState<Unit[]>(initialUnits)
  const [updating, setUpdating] = useState<string | null>(null)
  const [addForm, setAddForm] = useState({ unit_number: '', floor: '', area_sqft: '', price: '' })
  const [adding, setAdding] = useState(false)
  const supabase = createClient()

  async function updateStatus(unitId: string, status: string) {
    setUpdating(unitId)

    const { data, error } = await supabase
      .from('property_units')
      .update({ status })
      .eq('id', unitId)
      .select()
      .single()

    if (error) {
      toast.error('Status update failed')
      setUpdating(null)
      return
    }

    if (data) {
      setUnits((previous) => previous.map((unit) => (unit.id === unitId ? { ...unit, status: data.status } : unit)))
      toast.success(`Unit moved to ${data.status}`)
    }

    setUpdating(null)
  }

  async function addUnit() {
    if (!addForm.unit_number.trim()) {
      toast.error('Unit number required')
      return
    }

    setAdding(true)

    const { data, error } = await supabase
      .from('property_units')
      .insert({
        property_id: propertyId,
        unit_number: addForm.unit_number,
        floor: addForm.floor ? Number(addForm.floor) : null,
        area_sqft: addForm.area_sqft ? Number(addForm.area_sqft) : null,
        price: addForm.price ? Number(addForm.price) : null,
        status: 'available',
      })
      .select()
      .single()

    if (error) {
      toast.error('Could not add unit')
      setAdding(false)
      return
    }

    if (data) {
      setUnits((previous) => [...previous, data])
      setAddForm({ unit_number: '', floor: '', area_sqft: '', price: '' })
      toast.success('Unit added successfully')
    }

    setAdding(false)
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[1.75rem] border border-white/8 bg-white/[0.03] p-4 sm:p-5">
        <div className="mb-4 space-y-2">
          <p className="dashboard-label">Add inventory</p>
          <p className="text-sm leading-7 text-[var(--text-secondary)]">
            Add fresh units directly from the inventory workspace to keep live availability aligned with sales activity.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <input
            placeholder="Unit no."
            value={addForm.unit_number}
            onChange={(event) => setAddForm({ ...addForm, unit_number: event.target.value })}
            className="dashboard-input px-4 py-3 text-sm"
          />
          <input
            type="number"
            placeholder="Floor"
            value={addForm.floor}
            onChange={(event) => setAddForm({ ...addForm, floor: event.target.value })}
            className="dashboard-input px-4 py-3 text-sm"
          />
          <input
            type="number"
            placeholder="Area (sqft)"
            value={addForm.area_sqft}
            onChange={(event) => setAddForm({ ...addForm, area_sqft: event.target.value })}
            className="dashboard-input px-4 py-3 text-sm"
          />
          <input
            type="number"
            placeholder="Price (BDT)"
            value={addForm.price}
            onChange={(event) => setAddForm({ ...addForm, price: event.target.value })}
            className="dashboard-input px-4 py-3 text-sm"
          />
        </div>

        <Button
          size="sm"
          variant="outline"
          className="mt-4 border-white/10 bg-white/[0.03] text-[var(--text-primary)] hover:border-[rgba(201,169,110,0.22)] hover:bg-white/[0.05] hover:text-[var(--color-accent)]"
          onClick={addUnit}
          disabled={adding}
        >
          <Plus className="size-4" />
          {adding ? 'Adding...' : 'Add unit'}
        </Button>
      </div>

      {units.length === 0 ? (
        <div className="dashboard-empty rounded-[1.75rem] px-5 py-12 text-center">
          <p className="text-sm leading-7 text-[var(--text-secondary)]">
            No units have been tracked yet. Add inventory to monitor sold, booked, and available stock from one place.
          </p>
        </div>
      ) : (
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
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-right">Move to</th>
                  </tr>
                </thead>
                <tbody>
                  {units.map((unit) => (
                    <tr key={unit.id}>
                      <td className="px-4 py-3 text-sm font-semibold text-[var(--text-primary)]">{unit.unit_number}</td>
                      <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">{unit.floor ?? '-'}</td>
                      <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">
                        {unit.area_sqft ? `${unit.area_sqft} sqft` : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-price text-sm font-medium text-[var(--color-accent)]">
                          {formatCurrency(unit.price)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="dashboard-badge" data-tone={STATUS_CONFIG[unit.status].tone}>
                          {STATUS_CONFIG[unit.status].label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {STATUS_CONFIG[unit.status].next.map((status) => (
                            <button
                              key={status}
                              onClick={() => updateStatus(unit.id, status)}
                              disabled={updating === unit.id}
                              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)] transition hover:border-[rgba(59,130,246,0.22)] hover:text-[var(--color-blue)] disabled:opacity-50"
                            >
                              <ArrowRight className="size-3.5" />
                              {status}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-3 md:hidden">
            {units.map((unit) => (
              <div key={unit.id} className="dashboard-panel rounded-[1.5rem] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-[var(--text-primary)]">{unit.unit_number}</p>
                    <p className="mt-1 text-xs text-[var(--text-secondary)]">
                      Floor {unit.floor ?? '-'} · {unit.area_sqft ? `${unit.area_sqft} sqft` : 'Area pending'}
                    </p>
                  </div>
                  <span className="dashboard-badge" data-tone={STATUS_CONFIG[unit.status].tone}>
                    {STATUS_CONFIG[unit.status].label}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between gap-4">
                  <p className="font-price text-sm font-medium text-[var(--color-accent)]">
                    {formatCurrency(unit.price)}
                  </p>
                  <div className="flex flex-wrap justify-end gap-2">
                    {STATUS_CONFIG[unit.status].next.map((status) => (
                      <button
                        key={status}
                        onClick={() => updateStatus(unit.id, status)}
                        disabled={updating === unit.id}
                        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)] transition hover:border-[rgba(59,130,246,0.22)] hover:text-[var(--color-blue)] disabled:opacity-50"
                      >
                        <ArrowRight className="size-3.5" />
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
