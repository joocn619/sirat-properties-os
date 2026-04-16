'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { MapPin, X, ArrowRight } from 'lucide-react'

interface MapProperty {
  id: string
  title: string
  price: number | null
  latitude: number
  longitude: number
  location: string | null
  district: string | null
  property_type: string
  listing_type: string
  image?: string
}

// Dhaka center default
const DEFAULT_CENTER: [number, number] = [23.8103, 90.4125]
const DEFAULT_ZOOM = 12

export function PropertyMap({ properties }: { properties: MapProperty[] }) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<any>(null)
  const [selected, setSelected] = useState<MapProperty | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return

    // Dynamic import to avoid SSR issues
    Promise.all([
      import('leaflet'),
      import('leaflet/dist/leaflet.css'),
    ]).then(([L]) => {
      const map = L.map(mapRef.current!, {
        zoomControl: false,
      }).setView(
        properties.length > 0
          ? [properties[0].latitude, properties[0].longitude]
          : DEFAULT_CENTER,
        DEFAULT_ZOOM,
      )

      // Dark-themed map tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
        maxZoom: 19,
      }).addTo(map)

      L.control.zoom({ position: 'topright' }).addTo(map)

      // Custom gold marker icon
      const goldIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="
          width:32px;height:32px;
          background:linear-gradient(135deg,#C9A96E,#B8954F);
          border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);
          box-shadow:0 4px 12px rgba(0,0,0,0.4);
          display:flex;align-items:center;justify-content:center;
        "><div style="
          transform:rotate(45deg);
          width:8px;height:8px;
          background:#0A0A0F;
          border-radius:50%;
        "></div></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      })

      // Add markers
      properties.forEach((p) => {
        const marker = L.marker([p.latitude, p.longitude], { icon: goldIcon })
        marker.addTo(map)
        marker.on('click', () => {
          setSelected(p)
          map.flyTo([p.latitude, p.longitude], 15, { duration: 0.5 })
        })
      })

      // Fit bounds if multiple markers
      if (properties.length > 1) {
        const bounds = L.latLngBounds(properties.map(p => [p.latitude, p.longitude]))
        map.fitBounds(bounds, { padding: [50, 50] })
      }

      mapInstance.current = map
      setLoaded(true)
    })

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove()
        mapInstance.current = null
      }
    }
  }, [properties])

  return (
    <div className="relative h-[600px] overflow-hidden rounded-2xl border border-white/[0.06]">
      {/* Map container */}
      <div ref={mapRef} className="h-full w-full" />

      {/* Loading overlay */}
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0A0A0F]">
          <div className="flex items-center gap-2 text-sm text-[var(--text-tertiary)]">
            <MapPin className="size-4 animate-pulse text-[var(--color-accent)]" />
            Loading map…
          </div>
        </div>
      )}

      {/* Property count badge */}
      <div className="absolute left-4 top-4 z-[999] rounded-xl bg-[#0E0E14]/90 px-3 py-2 backdrop-blur-md">
        <span className="text-xs font-semibold text-[var(--text-primary)]">
          {properties.length} {properties.length === 1 ? 'property' : 'properties'}
        </span>
      </div>

      {/* Selected property popup */}
      {selected && (
        <div className="absolute bottom-4 left-4 right-4 z-[999] mx-auto max-w-sm animate-[fade-up_0.3s_ease-out] rounded-2xl border border-white/[0.08] bg-[#0E0E14]/95 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl">
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="absolute right-3 top-3 rounded-lg p-1 text-[var(--text-tertiary)] transition hover:bg-white/[0.06]"
          >
            <X className="size-4" />
          </button>

          <div className="flex gap-3">
            {selected.image ? (
              <div className="size-16 shrink-0 overflow-hidden rounded-xl bg-[#111118]">
                <img src={selected.image} alt="" className="h-full w-full object-cover" />
              </div>
            ) : null}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[var(--text-primary)]">{selected.title}</p>
              {(selected.location || selected.district) && (
                <p className="mt-0.5 flex items-center gap-1 text-xs text-[var(--text-tertiary)]">
                  <MapPin className="size-3 text-[var(--color-accent)]" />
                  {[selected.location, selected.district].filter(Boolean).join(', ')}
                </p>
              )}
              {selected.price && (
                <p className="mt-1 font-price text-sm font-semibold text-[var(--color-accent)]">
                  ৳{Number(selected.price).toLocaleString()}
                </p>
              )}
            </div>
          </div>

          <Link
            href={`/properties/${selected.id}`}
            className="mt-3 flex items-center justify-center gap-1.5 rounded-xl bg-[var(--color-accent)] py-2.5 text-xs font-semibold text-[#0A0A0F] transition hover:shadow-[0_4px_16px_rgba(201,169,110,0.3)]"
          >
            View Details
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      )}
    </div>
  )
}
