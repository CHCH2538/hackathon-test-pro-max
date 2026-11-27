import type { MetadataRoute } from 'next'
import { routes } from '@/lib/routes'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export default function sitemap(): MetadataRoute.Sitemap {
  return [routes.home, routes.chat].map((path) => ({ url: new URL(path, siteUrl).toString() }))
}
