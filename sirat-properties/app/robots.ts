import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://siratproperties.com'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/buyer/', '/seller/', '/agent/', '/admin/', '/auth/', '/api/'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  }
}
