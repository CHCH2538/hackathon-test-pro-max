import { requireCronAuth } from '@/lib/security/cron'
import { AppError, toSafeResponse } from '@/lib/security/errors'
import { log } from '@/lib/security/log'
import { createServiceClient } from '@/lib/db/server'
import { bangkokDate } from '@/lib/catalog/staleness'

export const dynamic = 'force-dynamic'

type PurgeCounts = { cases: number; sessions: number }

function toPurgeCounts(data: unknown): PurgeCounts {
  const d = (data ?? {}) as Partial<Record<keyof PurgeCounts, unknown>>
  return {
    cases: typeof d.cases === 'number' ? d.cases : 0,
    sessions: typeof d.sessions === 'number' ? d.sessions : 0,
  }
}

export async function GET(req: Request): Promise<Response> {
  try {
    requireCronAuth(req)
    const db = createServiceClient()
    const now = new Date()
    const due = await db.rpc('advance_due_cases', { p_today: bangkokDate(now) })
    if (due.error) throw new AppError('internal', 500, { cause: due.error })
    const purged = await db.rpc('purge_expired', { p_now: now.toISOString() })
    if (purged.error) throw new AppError('internal', 500, { cause: purged.error })
    const counts = toPurgeCounts(purged.data)
    log.info('cron_run', { job: 'retention', due: due.data, ...counts })
    return Response.json(
      { ok: true, due: due.data, ...counts },
      { headers: { 'Cache-Control': 'no-store' } },
    )
  } catch (e) {
    return toSafeResponse(e)
  }
}
