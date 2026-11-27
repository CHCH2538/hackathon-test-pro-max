import type { Metadata } from 'next'
import type React from 'react'
import { SlicePlaceholder } from '@/components/shell/SlicePlaceholder'
import { requireAdmin } from '@/lib/auth/admin'
import { listServices } from '@/lib/catalog'
import { staleness } from '@/lib/catalog/pure'
import { AppError } from '@/lib/security/errors'
export const dynamic = 'force-dynamic'
export const metadata: Metadata = { robots: { index: false } }
async function probe(): Promise<React.ReactNode> {
  try {
    const services = await listServices()
    const now = new Date()
    return (
      <ul>
        {services.map((s) => {
          const st = staleness(s.lastVerified, now)
          return (
            <li key={s.id}>
              {s.id} · {s.lastVerified} · {st.days}d{st.isStale ? ' · stale' : ''}
            </li>
          )
        })}
      </ul>
    )
  } catch (err) {
    return `listServices() failed: ${err instanceof AppError ? err.code : 'internal'}`
  }
}
export default async function AdminPage() {
  await requireAdmin()
  return <SlicePlaceholder spec="92-admin-catalog" probe={await probe()} />
}
