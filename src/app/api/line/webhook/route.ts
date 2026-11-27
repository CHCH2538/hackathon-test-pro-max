import { AppError, toSafeResponse } from '@/lib/security/errors'
import { verifyLineSignature } from '@/lib/security/signature'

export async function POST(req: Request): Promise<Response> {
  const rawBody = await req.text()
  if (!verifyLineSignature(rawBody, req.headers.get('x-line-signature'))) {
    return toSafeResponse(new AppError('unauthorized', 401))
  }
  return Response.json({})
}
