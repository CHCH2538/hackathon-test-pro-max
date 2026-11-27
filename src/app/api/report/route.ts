import { AppError, toSafeResponse } from '@/lib/security/errors'
export async function POST(): Promise<Response> {
  return toSafeResponse(new AppError('not_implemented', 501))
}
