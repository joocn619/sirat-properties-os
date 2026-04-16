import { requireDashboardSession } from '@/lib/dashboard'
import { DashboardPageHeader } from '@/components/layout/DashboardPageHeader'
import { CompareGrid } from './CompareGrid'

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>
}) {
  const { supabase } = await requireDashboardSession('buyer')
  const { ids: idsParam } = await searchParams
  const ids = (idsParam ?? '').split(',').filter(Boolean).slice(0, 3)

  if (ids.length < 2) {
    return (
      <>
        <DashboardPageHeader title="Compare Properties" description="Select at least 2 properties to compare" />
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] py-20 text-center">
          <p className="text-sm text-[var(--text-tertiary)]">
            Go to Search and add 2-3 properties using the compare button, then come back here.
          </p>
        </div>
      </>
    )
  }

  const { data: properties } = await supabase
    .from('properties')
    .select(`
      id, title, property_type, listing_type, price, area_sqft,
      location, district, floor_number, total_floors, facing,
      bedrooms, bathrooms, amenities, description, address,
      property_images(url, is_primary)
    `)
    .in('id', ids)

  return (
    <>
      <DashboardPageHeader
        title="Compare Properties"
        description={`Comparing ${properties?.length ?? 0} properties side by side`}
      />
      <CompareGrid properties={properties ?? []} />
    </>
  )
}
