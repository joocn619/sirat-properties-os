import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import {
  MapPin, Phone, Mail, MessageCircle, Star, ChevronDown,
  Building2, CheckCircle2, Clock, ExternalLink,
} from 'lucide-react'

/* ── Dynamic SEO Metadata ── */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: lp } = await supabase
    .from('landing_pages')
    .select('projects(name, description, properties(location, district, price))')
    .eq('custom_slug', slug)
    .eq('is_published', true)
    .single()

  if (!lp) return { title: 'Project Not Found' }

  const project = (lp as any).projects
  const property = project?.properties
  const loc = [property?.location, property?.district].filter(Boolean).join(', ')
  const desc = project?.description
    ?? `${project?.name}${loc ? ` — ${loc}` : ''}. View details, floor plans, and pricing on Sirat Properties.`

  return {
    title: `${project?.name} | Sirat Properties`,
    description: desc,
    openGraph: {
      title: project?.name,
      description: desc,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: project?.name,
      description: desc,
    },
  }
}

const UPDATE_TYPE: Record<string, { label: string; color: string }> = {
  progress:     { label: 'Progress', color: '#3B82F6' },
  announcement: { label: 'Announcement', color: '#C9A96E' },
  milestone:    { label: 'Milestone', color: '#10B981' },
}

const HERO_BG: Record<string, string> = {
  gradient_dark: 'linear-gradient(135deg,#0A0A0F 0%,#111128 50%,#0A0A0F 100%)',
  gradient_blue: 'linear-gradient(135deg,#0A0A0F 0%,#0f1d3a 40%,#162447 65%,#0A0A0F 100%)',
  gradient_gold: 'linear-gradient(135deg,#0A0A0F 0%,#1a1610 40%,#2a2010 65%,#0A0A0F 100%)',
  solid_dark:    '#0A0A0F',
}

export default async function PublicProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: lp } = await supabase
    .from('landing_pages')
    .select(`
      sections,
      projects(
        id, name, description, current_progress, status,
        properties(title, location, district, price, property_images(url, is_primary)),
        project_updates(id, title, description, update_type, created_at)
      )
    `)
    .eq('custom_slug', slug)
    .eq('is_published', true)
    .single()

  if (!lp) notFound()

  const project = lp.projects as any
  const property = project?.properties
  const sections = (lp.sections as any[]) ?? []
  const updates = (project?.project_updates ?? []).sort(
    (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-[#F0EDE8]">
      {/* Sections */}
      {sections.map((section: any, idx: number) => (
        <RenderSection key={idx} section={section} project={project} property={property} />
      ))}

      {/* Fallback if no sections */}
      {!sections.length && (
        <div className="flex min-h-[60vh] items-center justify-center px-6 text-center" style={{ background: HERO_BG.gradient_dark }}>
          <div className="relative">
            <div className="pointer-events-none absolute -inset-20 rounded-full bg-[radial-gradient(circle,rgba(201,169,110,0.12),transparent_60%)] blur-2xl" />
            <h1 className="relative font-display text-5xl font-medium tracking-tight">{project?.name}</h1>
            {project?.description && <p className="relative mt-3 text-base text-[#9E9AA0]">{project.description}</p>}
          </div>
        </div>
      )}

      {/* Progress & updates — always shown */}
      <div className="mx-auto max-w-4xl px-6 py-16">
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C9A96E]">Project Progress</h2>
            <span className="font-display text-2xl font-medium text-[#C9A96E]">{project?.current_progress ?? 0}%</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-white/[0.06]">
            <div className="h-full rounded-full bg-[#C9A96E] transition-all duration-700" style={{ width: `${project?.current_progress ?? 0}%` }} />
          </div>
          <p className="mt-2 text-xs text-[#5C5866]">
            Status: <span className="capitalize text-[#9E9AA0]">{project?.status}</span>
          </p>
        </div>

        {updates.length > 0 && (
          <div className="mt-10 space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C9A96E]">Latest Updates</h2>
            {updates.map((u: any) => {
              const cfg = UPDATE_TYPE[u.update_type] ?? UPDATE_TYPE.progress
              return (
                <div key={u.id} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                      style={{ background: `${cfg.color}18`, color: cfg.color }}>
                      {cfg.label}
                    </span>
                    <span className="text-xs text-[#5C5866]">
                      {new Date(u.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <p className="font-semibold text-[#F0EDE8]">{u.title}</p>
                  {u.description && <p className="mt-1 text-sm leading-6 text-[#9E9AA0]">{u.description}</p>}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-white/[0.04] py-8 text-center">
        <p className="text-xs text-[#5C5866]">
          Powered by <span className="text-[#C9A96E]">Sirat Properties</span> Real Estate OS
        </p>
      </footer>
    </div>
  )
}

/* ─── Section Renderer ─── */

function RenderSection({ section, project, property }: { section: any; project: any; property: any }) {
  const { type, data } = section

  /* Hero */
  if (type === 'hero') {
    const bg = HERO_BG[data.bg_style] ?? HERO_BG.gradient_dark
    return (
      <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden px-6 text-center"
        style={{ background: bg }}>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,169,110,0.1),transparent_55%)]" />
        <div className="relative z-10 max-w-3xl space-y-5">
          <h1 className="font-display text-5xl font-medium leading-[1.08] tracking-tight md:text-7xl">
            {data.headline || project?.name}
          </h1>
          {data.subheadline && <p className="mx-auto max-w-xl text-base leading-7 text-[#9E9AA0]">{data.subheadline}</p>}
          {data.cta_text && (
            <a href="#contact" className="inline-flex items-center gap-2 rounded-2xl bg-[#C9A96E] px-7 py-3.5 text-sm font-semibold text-[#0A0A0F] transition hover:shadow-[0_8px_32px_rgba(201,169,110,0.3)]">
              {data.cta_text}
            </a>
          )}
        </div>
      </section>
    )
  }

  /* Stats */
  if (type === 'stats') {
    const items = (data.items as { label: string; value: string }[]).filter(i => i.value)
    if (!items.length) return null
    return (
      <section className="border-y border-white/[0.04] bg-white/[0.01]">
        <div className="mx-auto grid max-w-5xl grid-cols-2 divide-x divide-white/[0.04] md:grid-cols-4">
          {items.map((item, i) => (
            <div key={i} className="px-6 py-10 text-center">
              <p className="font-display text-3xl font-medium text-[#C9A96E] md:text-4xl">{item.value}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#5C5866]">{item.label}</p>
            </div>
          ))}
        </div>
      </section>
    )
  }

  /* Gallery */
  if (type === 'gallery') {
    const imgs = (data.image_urls as string[]).filter(Boolean)
    const primaryImg = property?.property_images?.find((i: any) => i.is_primary)?.url ?? property?.property_images?.[0]?.url
    const allImgs = imgs.length ? imgs : primaryImg ? [primaryImg] : []
    if (!allImgs.length) return null
    return (
      <section className="mx-auto max-w-6xl px-6 py-16">
        {data.title && <h2 className="mb-8 text-center text-xs font-semibold uppercase tracking-[0.18em] text-[#C9A96E]">{data.title}</h2>}
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
          {allImgs.map((url: string, i: number) => (
            <div key={i} className="group aspect-[4/3] overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02]">
              <img src={url} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            </div>
          ))}
        </div>
      </section>
    )
  }

  /* Video */
  if (type === 'video') {
    if (!data.video_url) return null
    return (
      <section className="mx-auto max-w-4xl px-6 py-16">
        {data.title && <h2 className="mb-8 text-center text-xs font-semibold uppercase tracking-[0.18em] text-[#C9A96E]">{data.title}</h2>}
        <div className="aspect-video overflow-hidden rounded-2xl border border-white/[0.06]">
          <iframe src={data.video_url} className="h-full w-full border-0" allowFullScreen loading="lazy" />
        </div>
        {data.caption && <p className="mt-3 text-center text-sm text-[#5C5866]">{data.caption}</p>}
      </section>
    )
  }

  /* Features */
  if (type === 'features') {
    const items = (data.items as string[]).filter(Boolean)
    if (!items.length) return null
    return (
      <section className="bg-white/[0.01] py-16">
        <div className="mx-auto max-w-4xl px-6">
          {data.title && <h2 className="mb-8 text-center text-xs font-semibold uppercase tracking-[0.18em] text-[#C9A96E]">{data.title}</h2>}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {items.map((item: string, i: number) => (
              <div key={i} className="flex items-center gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm">
                <CheckCircle2 className="size-4 shrink-0 text-[#C9A96E]" />
                <span className="text-[#F0EDE8]">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  /* Floor Plans */
  if (type === 'floor_plan') {
    const plans = (data.plans as any[]).filter((p: any) => p.name)
    if (!plans.length) return null
    return (
      <section className="mx-auto max-w-5xl px-6 py-16">
        {data.title && <h2 className="mb-8 text-center text-xs font-semibold uppercase tracking-[0.18em] text-[#C9A96E]">{data.title}</h2>}
        <div className="grid gap-4 md:grid-cols-2">
          {plans.map((plan: any, i: number) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02]">
              {plan.image_url && (
                <div className="aspect-[16/10] overflow-hidden bg-white/[0.02]">
                  <img src={plan.image_url} alt={plan.name} className="h-full w-full object-contain" />
                </div>
              )}
              <div className="flex items-center justify-between p-5">
                <div>
                  <p className="font-semibold text-[#F0EDE8]">{plan.name}</p>
                  {plan.size && <p className="mt-0.5 text-xs text-[#5C5866]">{plan.size}</p>}
                </div>
                {plan.price && <p className="font-display text-xl font-medium text-[#C9A96E]">{plan.price}</p>}
              </div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  /* Pricing */
  if (type === 'pricing') {
    const units = (data.units as any[]).filter((u: any) => u.type)
    if (!units.length) return null
    const statusColor: Record<string, string> = { Available: '#10b981', Booked: '#C9A96E', Sold: '#f43f5e' }
    return (
      <section className="bg-white/[0.01] py-16">
        <div className="mx-auto max-w-4xl px-6">
          {data.title && <h2 className="mb-8 text-center text-xs font-semibold uppercase tracking-[0.18em] text-[#C9A96E]">{data.title}</h2>}
          <div className="overflow-hidden rounded-2xl border border-white/[0.06]">
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 border-b border-white/[0.06] bg-white/[0.02] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#5C5866]">
              <span>Type</span><span>Size</span><span>Price</span><span>Status</span>
            </div>
            {units.map((u: any, i: number) => (
              <div key={i} className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 border-b border-white/[0.03] px-5 py-4 text-sm last:border-0">
                <span className="font-semibold text-[#F0EDE8]">{u.type}</span>
                <span className="text-[#9E9AA0]">{u.size}</span>
                <span className="font-display text-base font-medium text-[#C9A96E]">{u.price}</span>
                <span className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                  style={{ background: `${statusColor[u.status] ?? '#9E9AA0'}16`, color: statusColor[u.status] ?? '#9E9AA0' }}>
                  {u.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  /* Testimonials */
  if (type === 'testimonials') {
    const items = (data.items as any[]).filter((t: any) => t.quote)
    if (!items.length) return null
    return (
      <section className="mx-auto max-w-5xl px-6 py-16">
        {data.title && <h2 className="mb-8 text-center text-xs font-semibold uppercase tracking-[0.18em] text-[#C9A96E]">{data.title}</h2>}
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((t: any, i: number) => (
            <div key={i} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
              <div className="mb-3 flex gap-0.5">
                {Array.from({ length: t.rating || 5 }).map((_, j) => (
                  <Star key={j} className="size-3.5 fill-[#C9A96E] text-[#C9A96E]" />
                ))}
              </div>
              <p className="font-display text-base italic leading-7 text-[#F0EDE8]">&ldquo;{t.quote}&rdquo;</p>
              {t.name && <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-[#5C5866]">— {t.name}</p>}
            </div>
          ))}
        </div>
      </section>
    )
  }

  /* FAQ */
  if (type === 'faq') {
    const items = (data.items as any[]).filter((f: any) => f.question)
    if (!items.length) return null
    return (
      <section className="bg-white/[0.01] py-16">
        <div className="mx-auto max-w-3xl px-6">
          {data.title && <h2 className="mb-8 text-center text-xs font-semibold uppercase tracking-[0.18em] text-[#C9A96E]">{data.title}</h2>}
          <div className="divide-y divide-white/[0.04] rounded-2xl border border-white/[0.06]">
            {items.map((faq: any, i: number) => (
              <details key={i} className="group">
                <summary className="flex cursor-pointer items-center justify-between px-5 py-4 text-sm font-semibold text-[#F0EDE8] [&::-webkit-details-marker]:hidden">
                  {faq.question}
                  <ChevronDown className="size-4 shrink-0 text-[#5C5866] transition-transform group-open:rotate-180" />
                </summary>
                {faq.answer && <p className="px-5 pb-4 text-sm leading-6 text-[#9E9AA0]">{faq.answer}</p>}
              </details>
            ))}
          </div>
        </div>
      </section>
    )
  }

  /* Location */
  if (type === 'location') return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      {data.title && <h2 className="mb-8 text-center text-xs font-semibold uppercase tracking-[0.18em] text-[#C9A96E]">{data.title}</h2>}
      {data.address && (
        <p className="mb-4 flex items-center justify-center gap-2 text-sm text-[#9E9AA0]">
          <MapPin className="size-4 text-[#C9A96E]" /> {data.address}
        </p>
      )}
      {data.map_embed && (
        <div className="mb-6 overflow-hidden rounded-2xl border border-white/[0.06]">
          <iframe src={data.map_embed} className="h-64 w-full border-0" loading="lazy" />
        </div>
      )}
      {(data.highlights as string[])?.filter(Boolean).length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {(data.highlights as string[]).filter(Boolean).map((h: string, i: number) => (
            <div key={i} className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-[#9E9AA0]">
              <Clock className="size-3.5 text-[#C9A96E]" /> {h}
            </div>
          ))}
        </div>
      )}
    </section>
  )

  /* CTA */
  if (type === 'cta') return (
    <section className="relative overflow-hidden py-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,169,110,0.1),transparent_60%)]" />
      <div className="relative z-10 mx-auto max-w-2xl px-6 text-center">
        {data.headline && <h2 className="font-display text-4xl font-medium tracking-tight">{data.headline}</h2>}
        {data.subheadline && <p className="mt-3 text-base text-[#9E9AA0]">{data.subheadline}</p>}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {data.cta_text && (
            <a href="#contact" className="rounded-2xl bg-[#C9A96E] px-7 py-3.5 text-sm font-semibold text-[#0A0A0F] transition hover:shadow-[0_8px_32px_rgba(201,169,110,0.3)]">
              {data.cta_text}
            </a>
          )}
          {data.phone && (
            <a href={`https://wa.me/88${data.phone}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.04] px-6 py-3.5 text-sm font-semibold text-[#F0EDE8] transition hover:bg-white/[0.08]">
              <MessageCircle className="size-4 text-[#25D366]" /> WhatsApp
            </a>
          )}
        </div>
      </div>
    </section>
  )

  /* Contact */
  if (type === 'contact') return (
    <section id="contact" className="border-t border-white/[0.04] bg-white/[0.01] py-16">
      <div className="mx-auto max-w-xl px-6 text-center">
        {data.title && <h2 className="mb-8 text-xs font-semibold uppercase tracking-[0.18em] text-[#C9A96E]">{data.title}</h2>}
        <div className="space-y-3">
          {data.phone && (
            <a href={`tel:${data.phone}`}
              className="flex items-center justify-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] py-4 text-sm transition hover:bg-white/[0.04]">
              <Phone className="size-4 text-[#C9A96E]" /> {data.phone}
            </a>
          )}
          {data.whatsapp && (
            <a href={`https://wa.me/88${data.whatsapp}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 rounded-2xl bg-[#25D366]/10 py-4 text-sm text-[#25D366] ring-1 ring-[#25D366]/20 transition hover:bg-[#25D366]/15">
              <MessageCircle className="size-4" /> WhatsApp
            </a>
          )}
          {data.email && (
            <a href={`mailto:${data.email}`}
              className="flex items-center justify-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] py-4 text-sm transition hover:bg-white/[0.04]">
              <Mail className="size-4 text-[#C9A96E]" /> {data.email}
            </a>
          )}
        </div>
      </div>
    </section>
  )

  return null
}
