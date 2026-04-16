import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { MapPin, Ruler, Building2, Compass, MessageCircle, Phone, CheckCircle2, ArrowRight } from 'lucide-react'

import { StartChatButton } from '@/components/chat/StartChatButton'
import { SavePropertyButton } from '@/components/property/SavePropertyButton'
import { createClient } from '@/lib/supabase/server'

/* ── Dynamic SEO Metadata ── */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data: property } = await supabase
    .from('properties')
    .select('title, location, district, price, listing_type, property_images(url, is_primary)')
    .eq('id', id)
    .single()

  if (!property) return { title: 'Property Not Found' }

  const image = (property.property_images as any[])?.find((i: any) => i.is_primary)?.url
    ?? (property.property_images as any[])?.[0]?.url
  const loc = [property.location, property.district].filter(Boolean).join(', ')
  const priceStr = property.price ? `৳${Number(property.price).toLocaleString()}` : ''
  const desc = `${property.title}${loc ? ` in ${loc}` : ''}${priceStr ? ` — ${priceStr}` : ''}. Browse on Sirat Properties.`

  return {
    title: `${property.title} | Sirat Properties`,
    description: desc,
    openGraph: {
      title: property.title,
      description: desc,
      type: 'website',
      ...(image ? { images: [{ url: image, width: 1200, height: 630, alt: property.title }] } : {}),
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title: property.title,
      description: desc,
      ...(image ? { images: [image] } : {}),
    },
  }
}

const TYPE_LABEL: Record<string, string> = {
  flat: 'Flat', land_share: 'Land Share', commercial: 'Commercial', duplex: 'Duplex', plot: 'Plot',
}
const LISTING_LABEL: Record<string, string> = {
  sale: 'Sale', rent: 'Rent', installment: 'Installment',
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: property } = await supabase
    .from('properties')
    .select(`
      *,
      property_images(*),
      property_units(*),
      seller:users!seller_id(id, email, profiles(full_name, avatar_url, whatsapp_number)),
      agent_listings(
        status,
        agents(user_id, profiles(full_name, avatar_url, whatsapp_number))
      )
    `)
    .eq('id', id)
    .single()

  if (!property || !property.is_published) notFound()

  const images = property.property_images ?? []
  const primaryImage = images.find((img: any) => img.is_primary) ?? images[0]
  const otherImages = images.filter((img: any) => img !== primaryImage)

  const approvedAgent = property.agent_listings?.find((e: any) => e.status === 'approved')
  const agent = approvedAgent?.agents?.profiles ?? null
  const agentWhatsapp = approvedAgent?.agents?.profiles?.whatsapp_number
  const agentUserId: string | null = approvedAgent?.agents?.user_id ?? null
  const amenities: string[] = property.amenities ?? []

  // Check if user has saved this property
  let isSaved = false
  if (user) {
    const { data: saved } = await supabase
      .from('saved_properties')
      .select('id')
      .eq('user_id', user.id)
      .eq('property_id', id)
      .single()
    isSaved = !!saved
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-[#F0EDE8]">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">

        {/* Image Gallery */}
        <div className="mb-8 grid grid-cols-1 gap-2 overflow-hidden rounded-2xl md:grid-cols-3">
          <div className="relative aspect-[4/3] overflow-hidden bg-[#111118] md:col-span-2">
            {primaryImage ? (
              primaryImage.media_type === 'video' ? (
                <video src={primaryImage.url} controls className="h-full w-full object-cover" />
              ) : (
                <Image src={primaryImage.url} alt={property.title} fill sizes="(max-width: 768px) 100vw, 66vw" className="object-cover" priority />
              )
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#111118,#16213e,#111118)]">
                <Building2 className="size-16 text-[#5C5866]" />
              </div>
            )}
          </div>
          <div className="hidden grid-rows-2 gap-2 md:grid">
            {otherImages.slice(0, 2).map((img: any, i: number) => (
              <div key={i} className="relative overflow-hidden bg-[#111118]">
                <Image src={img.url} alt="" fill sizes="33vw" className="object-cover" />
              </div>
            ))}
            {otherImages.length < 2 && (
              <div className="bg-[#111118]" />
            )}
          </div>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Main Content */}
          <div className="min-w-0 flex-1 space-y-6">
            {/* Title row */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-white/[0.04] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#9E9AA0]">
                    {TYPE_LABEL[property.property_type] ?? property.property_type}
                  </span>
                  <span className="rounded-md bg-[rgba(201,169,110,0.1)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#C9A96E]">
                    {LISTING_LABEL[property.listing_type] ?? property.listing_type}
                  </span>
                  {property.is_featured && (
                    <span className="rounded-md bg-[rgba(201,169,110,0.15)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#C9A96E]">
                      Featured
                    </span>
                  )}
                </div>
                <h1 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">{property.title}</h1>
                {(property.location || property.district) && (
                  <p className="mt-2 flex items-center gap-1.5 text-sm text-[#9E9AA0]">
                    <MapPin className="size-4 text-[#C9A96E]" />
                    {[property.location, property.district].filter(Boolean).join(', ')}
                  </p>
                )}
              </div>
              {user && (
                <div className="flex items-center gap-2">
                  <SavePropertyButton propertyId={property.id} initialSaved={isSaved} />
                </div>
              )}
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {property.price && (
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#5C5866]">Price</p>
                  <p className="mt-1 font-price text-xl font-semibold text-[#C9A96E]">৳{Number(property.price).toLocaleString()}</p>
                </div>
              )}
              {property.area_sqft && (
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#5C5866]">Area</p>
                  <p className="mt-1 flex items-center gap-1.5 text-xl font-semibold"><Ruler className="size-4 text-[#5C5866]" />{property.area_sqft} sqft</p>
                </div>
              )}
              {property.floor_number && (
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#5C5866]">Floor</p>
                  <p className="mt-1 flex items-center gap-1.5 text-xl font-semibold"><Building2 className="size-4 text-[#5C5866]" />{property.floor_number}/{property.total_floors}</p>
                </div>
              )}
              {property.facing && (
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#5C5866]">Facing</p>
                  <p className="mt-1 flex items-center gap-1.5 text-xl font-semibold"><Compass className="size-4 text-[#5C5866]" />{property.facing}</p>
                </div>
              )}
            </div>

            {/* Description */}
            {property.description && (
              <div>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-[#C9A96E]">Description</h2>
                <p className="whitespace-pre-wrap text-sm leading-7 text-[#9E9AA0]">{property.description}</p>
              </div>
            )}

            {/* Amenities */}
            {amenities.length > 0 && (
              <div>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-[#C9A96E]">Amenities</h2>
                <div className="flex flex-wrap gap-2">
                  {amenities.map((a) => (
                    <span key={a} className="flex items-center gap-1.5 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 text-xs text-[#F0EDE8]">
                      <CheckCircle2 className="size-3 text-[#C9A96E]" /> {a}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Address */}
            {property.address && (
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
                <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#C9A96E]">Address</h2>
                <p className="text-sm text-[#9E9AA0]">{property.address}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="w-full shrink-0 space-y-4 lg:w-80">
            {/* Agent or Seller card */}
            {agent ? (
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
                <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#C9A96E]">Assigned Agent</p>
                <div className="mb-4 flex items-center gap-3">
                  {agent.avatar_url ? (
                    <img src={agent.avatar_url} alt={agent.full_name} className="size-12 rounded-2xl object-cover ring-1 ring-white/[0.08]" />
                  ) : (
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-[rgba(201,169,110,0.12)] text-lg font-semibold text-[#C9A96E]">
                      {agent.full_name?.[0]}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold">{agent.full_name}</p>
                    <p className="text-xs text-[#5C5866]">Real Estate Agent</p>
                  </div>
                </div>
                {agentWhatsapp && (
                  <a href={`https://wa.me/88${agentWhatsapp}?text=I want to know more about ${property.title}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366]/10 py-3 text-sm font-semibold text-[#25D366] ring-1 ring-[#25D366]/20 transition hover:bg-[#25D366]/15">
                    <MessageCircle className="size-4" /> WhatsApp Agent
                  </a>
                )}
                {user && agentUserId && user.id !== agentUserId && (
                  <div className="mt-2">
                    <StartChatButton buyerId={user.id} agentId={agentUserId} propertyId={property.id} />
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
                <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#C9A96E]">Seller</p>
                <div className="flex items-center gap-3">
                  {(property.seller as any)?.profiles?.avatar_url ? (
                    <img src={(property.seller as any).profiles.avatar_url} alt="" className="size-10 rounded-xl object-cover ring-1 ring-white/[0.08]" />
                  ) : (
                    <div className="flex size-10 items-center justify-center rounded-xl bg-[rgba(201,169,110,0.12)] text-sm font-semibold text-[#C9A96E]">
                      {(property.seller as any)?.profiles?.full_name?.[0] ?? 'S'}
                    </div>
                  )}
                  <p className="text-sm font-semibold">{(property.seller as any)?.profiles?.full_name ?? 'Seller'}</p>
                </div>
                {(property.seller as any)?.profiles?.whatsapp_number && (
                  <a href={`https://wa.me/88${(property.seller as any).profiles.whatsapp_number}`}
                    target="_blank" rel="noopener noreferrer"
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366]/10 py-3 text-sm font-semibold text-[#25D366] ring-1 ring-[#25D366]/20 transition hover:bg-[#25D366]/15">
                    <MessageCircle className="size-4" /> WhatsApp Seller
                  </a>
                )}
              </div>
            )}

            {/* Booking CTA */}
            <Link href={`/buyer/bookings/new?property=${property.id}`}
              className="group flex items-center justify-center gap-2 rounded-2xl bg-[#C9A96E] py-4 text-sm font-semibold text-[#0A0A0F] transition-all hover:shadow-[0_8px_32px_rgba(201,169,110,0.3)]">
              Start Booking
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 border-t border-white/[0.04] py-6 text-center">
        <p className="text-xs text-[#5C5866]">Powered by <span className="text-[#C9A96E]">Sirat Properties</span></p>
      </footer>
    </div>
  )
}
