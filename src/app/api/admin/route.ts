import { requireAdmin } from '@/lib/auth/admin'
import { AppError, toSafeResponse } from '@/lib/security/errors'
export async function GET(): Promise<Response> {
  try {
    await requireAdmin()
    throw new AppError('not_implemented', 501)
  } catch (err) {
    return toSafeResponse(err)
  }
}
