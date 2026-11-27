import { createHash, timingSafeEqual } from 'node:crypto'
import { headers } from 'next/headers'

export const ADMIN_REALM = 'Bangkok Flow admin'

const MIN_PASSWORD_LENGTH = 24
const BASIC_RE = /^Basic[ \t]+([A-Za-z0-9+/]+={0,2})[ \t]*$/i

function sameSecret(a: string, b: string): boolean {
  const da = createHash('sha256').update(a, 'utf8').digest()
  const db = createHash('sha256').update(b, 'utf8').digest()
  return timingSafeEqual(da, db)
}

export function checkBasicAuth(header: string | null): 'ok' | 'denied' | 'not_configured' {
  const password = process.env.ADMIN_DEMO_PASSWORD
  if (!password || password.length < MIN_PASSWORD_LENGTH) return 'not_configured'
  const username = process.env.ADMIN_DEMO_USER || 'admin'
  const match = header ? BASIC_RE.exec(header) : null
  if (!match) return 'denied'
  const decoded = Buffer.from(match[1]!, 'base64').toString('utf8')
  const sep = decoded.indexOf(':')
  if (sep < 0) return 'denied'
  const userOk = sameSecret(decoded.slice(0, sep), username)
  const passOk = sameSecret(decoded.slice(sep + 1), password)
  return userOk && passOk ? 'ok' : 'denied'
}

export async function requireAdmin(): Promise<{ username: string }> {
  if (checkBasicAuth((await headers()).get('authorization')) !== 'ok') {
    const { AppError } = await import('@/lib/security/errors')
    throw new AppError('unauthorized', 401)
  }
  return { username: process.env.ADMIN_DEMO_USER || 'admin' }
}
