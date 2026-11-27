import { AppError, toSafeResponse } from '@/lib/security/errors'

export async function PATCH(): Promise<Response> {
  return toSafeResponse(new AppError('not_implemented', 501))
}
