import Link from 'next/link'
import { Heart, MapPin, ArrowLeft } from 'lucide-react'

import { requireDashboardSession } from '@/lib/dashboard'
import { DashboardPageHeader } from '@/components/layout/DashboardPageHeader'
import { SavePropertyButton } from '@/components/property/SavePropertyButton'

export default async function SavedPropertiesPage() {
  const { supabase, userId } = await requireDashboardSession('buyer')

  const { data: saved } = await supabase
    .from('saved_properties')
    .select(`
      property_id,
      created_at,
      properties:property_id(
        id, title, property_type, listing_type, price, area_sqft,
        location, district, is_featured,
        property_images(url, is_primary)
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  const items = (saved ?? []).map((s: any) => s.properties).filter(Boolean)

  return (
    <>
      <DashboardPageHeader
        title="Saved Properties"
        description={`${items.length} properties in your wishlist`}
      />

      {items.length === 0 ? (
        <div className="dashboard-empty flex flex-col items-center gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] py-20 text-center">
          <Heart className="size-10 text-[var(--text-tertiary)]" />
          <div>
            <p className="text-sm font-semibold text-[var(--text-primary)]">No saved properties yet</p>
            <p className="mt-1 text-xs text-[var(--text-tertiary)]">
              Tap the heart icon on any property to save it here.
            </p>
          </div>
          <Link
            href="/buyer/search"
            className="mt-2 rounded-xl bg-[rgba(201,169,110,0.12)] px-5 py-2.5 text-xs font-semibold text-[var(--color-accent)] transition hover:bg-[rgba(201,169,110,0.18)]"
          >
            Browse properties
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((property: any) => {
            const img = property.property_images?.find((i: any) => i.is_primary)?.url
              ?? property.property_images?.[0]?.url

            return (
              <div key={property.id} className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] transition-all duration-300 hover:-translate-y-1 hover:border-[rgba(201,169,110,0.2)] hover:shadow-[0_16px_48px_rgba(0,0,0,0.3)]">
                {/* Save button */}
                <div className="absolute right-3 top-3 z-10">
                  <SavePropertyButton propertyId={property.id} initialSaved={true} size="sm" />
                </div>

                <Link href={`/properties/${property.id}`}>
                  {/* Image */}
                  <div className="aspect-[4/3] overflow-hidden bg-[#111118]">
                    {img ? (
                      <img src={img} alt={property.title} loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#111118,#16213e,#111118)]">
                        <div className="flex items-end gap-1">
                          {[20, 32, 44, 36, 24].map((h, i) => (
                            <div key={i} className="w-3 rounded-t-sm" style={{
                              height: `${h}px`,
                              background: `linear-gradient(to top, rgba(201,169,110,${0.12 + i * 0.04}), rgba(201,169,110,0.03))`,
                            }} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="line-clamp-1 text-sm font-semibold text-[var(--text-primary)]">{property.title}</h3>
                    {(property.location || property.district) && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-[var(--text-tertiary)]">
                        <MapPin className="size-3 text-[var(--color-accent)]" />
                        {[property.location, property.district].filter(Boolean).join(', ')}
                      </p>
                    )}
                    <div className="mt-2 flex items-center justify-between">
                      {property.price ? (
                        <p className="font-price text-base font-semibold text-[var(--color-accent)]">
                          ৳{Number(property.price).toLocaleString()}
                        </p>
                      ) : (
                        <p className="text-xs text-[var(--text-tertiary)]">Price on request</p>
                      )}
                      {property.area_sqft && (
                        <p className="text-xs text-[var(--text-tertiary)]">{property.area_sqft} sqft</p>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
