import 'server-only'
import { AppError } from '@/lib/security/errors'

const LINE_VERIFY_ENDPOINT = 'https://api.line.me/oauth2/v2.1/verify'

type LineVerifyPayload = { sub?: unknown; nonce?: unknown; amr?: unknown }

export async function verifyLineIdToken(
  idToken: string,
  opts: { nonce: string },
): Promise<{ sub: string; amr?: string[] }> {
  const channelId = process.env.LINE_LOGIN_CHANNEL_ID
  if (!channelId) throw new AppError('not_configured', 503)
  if (!idToken || !opts.nonce) throw new AppError('unauthorized', 401)

  let res: Response
  try {
    res = await fetch(LINE_VERIFY_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ id_token: idToken, client_id: channelId, nonce: opts.nonce }),
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    })
  } catch (cause) {
    throw new AppError('unauthorized', 401, { cause })
  }
  if (res.status !== 200) throw new AppError('unauthorized', 401)

  const payload = (await res.json().catch(() => null)) as LineVerifyPayload | null
  if (!payload || typeof payload.sub !== 'string' || payload.sub === '' || payload.nonce !== opts.nonce) {
    throw new AppError('unauthorized', 401)
  }
  const amr = Array.isArray(payload.amr) && payload.amr.every((a) => typeof a === 'string') ? payload.amr : undefined
  return amr ? { sub: payload.sub, amr } : { sub: payload.sub }
}
