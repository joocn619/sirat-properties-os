import type { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://siratproperties.com'

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${base}/auth/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ]

  // Skip DB queries in dev or when Supabase is not configured
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  if (!url || !key || url.includes('your_supabase') || process.env.DEV_BYPASS_AUTH === 'true') {
    return staticPages
  }

  try {
    const supabase = createClient(url, key)

    const [{ data: properties }, { data: landingPages }] = await Promise.all([
      supabase.from('properties').select('id, updated_at').eq('status', 'published').order('updated_at', { ascending: false }).limit(500),
      supabase.from('landing_pages').select('custom_slug, updated_at').eq('is_published', true).limit(200),
    ])

    const propertyPages: MetadataRoute.Sitemap = (properties ?? []).map((p: any) => ({
      url: `${base}/properties/${p.id}`,
      lastModified: new Date(p.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

    const projectPages: MetadataRoute.Sitemap = (landingPages ?? []).map((lp: any) => ({
      url: `${base}/projects/${lp.custom_slug}`,
      lastModified: new Date(lp.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

    return [...staticPages, ...propertyPages, ...projectPages]
  } catch {
    return staticPages
  }
}
