import type { MetadataRoute } from 'next'
import { routes } from '@/lib/routes'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [routes.admin, routes.dev, '/c/', '/plan/', '/trip/'],
    },
    sitemap: new URL('/sitemap.xml', siteUrl).toString(),
  }
}
