import { Suspense } from 'react'

import { PropertyCard } from '@/components/property/PropertyCard'
import { PropertyFilters } from '@/components/property/PropertyFilters'
import { SearchViewToggle } from '@/components/property/SearchViewToggle'
import { requireDashboardSession } from '@/lib/dashboard'

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const params = await searchParams
  const { supabase } = await requireDashboardSession('buyer')

  let query = supabase
    .from('properties')
    .select(
      'id, title, property_type, listing_type, price, area_sqft, location, district, is_featured, latitude, longitude, property_images(url, is_primary), agent_listings(agents(profiles(full_name, avatar_url)))',
    )
    .eq('is_published', true)
    .eq('status', 'available')
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(30)

  if (params.location) query = query.ilike('location', `%${params.location}%`)
  if (params.district) query = query.eq('district', params.district)
  if (params.property_type) query = query.eq('property_type', params.property_type)
  if (params.listing_type) query = query.eq('listing_type', params.listing_type)
  if (params.min_price) query = query.gte('price', Number(params.min_price))
  if (params.max_price) query = query.lte('price', Number(params.max_price))

  const { data: properties } = await query

  // Properties with coordinates for map view
  const mapProperties = (properties ?? [])
    .filter((p: any) => p.latitude && p.longitude)
    .map((p: any) => ({
      id: p.id,
      title: p.title,
      price: p.price,
      latitude: p.latitude,
      longitude: p.longitude,
      location: p.location,
      district: p.district,
      property_type: p.property_type,
      listing_type: p.listing_type,
      image: p.property_images?.find((i: any) => i.is_primary)?.url ?? p.property_images?.[0]?.url,
    }))

  const gridView = (
    <>
      {!properties?.length ? (
        <div className="dashboard-empty rounded-[1.75rem] px-5 py-16 text-center">
          <p className="text-lg font-semibold text-[var(--text-primary)]">No matching properties found</p>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Adjust the filters and try another search.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {properties.map((property: any) => {
            const primaryImg =
              property.property_images?.find((image: any) => image.is_primary)?.url ??
              property.property_images?.[0]?.url
            const agent =
              property.agent_listings?.find((entry: any) => entry.agents)?.agents?.profiles ?? null

            return (
              <PropertyCard
                key={property.id}
                id={property.id}
                title={property.title}
                property_type={property.property_type}
                listing_type={property.listing_type}
                price={property.price}
                area_sqft={property.area_sqft}
                location={property.location}
                district={property.district}
                is_featured={property.is_featured}
                primary_image={primaryImg}
                agent={agent}
              />
            )
          })}
        </div>
      )}
    </>
  )

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-medium tracking-[-0.03em] text-[var(--text-primary)] sm:text-4xl">
          Property Search
        </h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          {properties?.length ?? 0} matching properties found
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <div className="hidden xl:block">
          <Suspense
            fallback={
              <div className="space-y-3 animate-pulse">
                <div className="h-10 rounded-2xl bg-white/[0.05]" />
                <div className="h-10 rounded-2xl bg-white/[0.05]" />
                <div className="h-10 rounded-2xl bg-white/[0.05]" />
              </div>
            }
          >
            <PropertyFilters />
          </Suspense>
        </div>

        <div className="flex-1">
          <SearchViewToggle gridView={gridView} mapProperties={mapProperties} />
        </div>
      </div>
    </div>
  )
}
