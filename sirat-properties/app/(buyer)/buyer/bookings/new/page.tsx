import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { BookingForm } from '@/components/booking/BookingForm'
import { DashboardPageHeader } from '@/components/layout/DashboardPageHeader'
import { DashboardPanel } from '@/components/ui/DashboardPanel'
import { requireDashboardSession } from '@/lib/dashboard'

export default async function NewBookingPage({
  searchParams,
}: {
  searchParams: Promise<{ property?: string }>
}) {
  const { property: propertyId } = await searchParams
  if (!propertyId) redirect('/buyer/search')

  const { supabase } = await requireDashboardSession('buyer')

  const { data: property } = await supabase
    .from('properties')
    .select('id, title, price, property_units(id, unit_number, floor, price, status)')
    .eq('id', propertyId)
    .eq('is_published', true)
    .single()

  if (!property) redirect('/buyer/search')

  const availableUnits = (property.property_units ?? []).filter((u: any) => u.status === 'available')
  const hasUnitInventory = (property.property_units?.length ?? 0) > 0

  if (hasUnitInventory && !availableUnits.length) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <DashboardPageHeader
          eyebrow="Booking"
          title="Property unavailable"
          description="All units for this property are currently reserved or sold."
        />
        <DashboardPanel>
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            Please choose another listing from our available properties.
          </p>
          <Link href="/buyer/search" className="dashboard-primary-button px-5 py-2.5 text-sm font-semibold">
            Browse other properties
          </Link>
        </DashboardPanel>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link
          href="/buyer/search"
          className="flex size-9 items-center justify-center rounded-xl border border-white/8 bg-white/[0.03] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <span className="text-sm text-[var(--text-tertiary)]">Back to search</span>
      </div>

      <DashboardPageHeader
        eyebrow="New booking"
        title="Submit a request"
        description={`Fill in the payment details for ${property.title}. The seller will review and confirm.`}
      />

      <DashboardPanel>
        <BookingForm
          propertyId={property.id}
          propertyTitle={property.title}
          propertyPrice={property.price}
          units={availableUnits}
        />
      </DashboardPanel>
    </div>
  )
}
