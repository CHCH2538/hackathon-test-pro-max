import { NextResponse } from 'next/server'
import { createCatalogClient } from '@/lib/db/server'
import type { HealthResponse } from '@/lib/contracts'

export const dynamic = 'force-dynamic'

async function checkDb(): Promise<HealthResponse['db']> {
  try {
    const { error } = await createCatalogClient()
      .from('agencies')
      .select('*', { count: 'exact', head: true })
    return error ? 'down' : 'ok'
  } catch {
    return 'down'
  }
}

export async function GET(): Promise<NextResponse<HealthResponse>> {
  const db = await checkDb()
  const body: HealthResponse = {
    ok: db === 'ok',
    db,
    commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || null,
  }
  return NextResponse.json(body, {
    status: body.ok ? 200 : 503,
    headers: { 'Cache-Control': 'no-store' },
  })
}
