import { requireCronAuth } from '@/lib/security/cron'
import { toSafeResponse } from '@/lib/security/errors'

export async function GET(req: Request): Promise<Response> {
  try {
    requireCronAuth(req)
    return Response.json({ skipped: true })
  } catch (err) {
    return toSafeResponse(err)
  }
}
