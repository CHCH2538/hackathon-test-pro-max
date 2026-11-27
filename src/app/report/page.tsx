import type { z } from 'zod'
import { SlicePlaceholder } from '@/components/shell/SlicePlaceholder'
import { SlugSchema, UuidSchema } from '@/lib/security/schemas'
export const dynamic = 'force-dynamic'
type SearchParams = Promise<Record<string, string | string[] | undefined>>
function pick<T>(schema: z.ZodType<T>, raw: string | string[] | undefined): T | null {
  if (typeof raw !== 'string') return null
  const parsed = schema.safeParse(raw)
  return parsed.success ? parsed.data : null
}
export default async function ReportPage({ searchParams }: { searchParams: SearchParams }) {
  const q = await searchParams
  const serviceId = pick(SlugSchema, q.serviceId)
  const requirementId = pick(UuidSchema, q.requirementId)
  const officeId = pick(SlugSchema, q.officeId)
  return (
    <SlicePlaceholder
      spec="92-admin-catalog"
      probe={
        <>
          serviceId={serviceId ?? '—'} · requirementId={requirementId ?? '—'} · officeId={officeId ?? '—'}
        </>
      }
    />
  )
}
