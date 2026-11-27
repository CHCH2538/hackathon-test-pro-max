import { AppError, toSafeResponse } from '@/lib/security/errors'

export function POST(): Response {
  return toSafeResponse(new AppError('not_implemented', 501))
}
