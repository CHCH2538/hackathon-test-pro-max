import { cookies } from 'next/headers'
import { cache } from 'react'
import type { Uuid } from '@/lib/contracts'

export const SESSION_COOKIE = 'bf_sid'

export const SESSION_COOKIE_OPTIONS: {
  httpOnly: true
  secure: true
  sameSite: 'lax'
  path: '/'
  maxAge: 2592000
} = { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 2592000 }

const TOKEN_RE = /^[A-Za-z0-9_-]{22}$/

export function mintSessionToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function isSessionToken(x: unknown): x is string {
  return typeof x === 'string' && TOKEN_RE.test(x)
}

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('')
}

async function touch(token: string): Promise<Uuid> {
  const [{ createServiceClient }, { AppError }] = await Promise.all([
    import('@/lib/db/server'),
    import('@/lib/security/errors'),
  ])
  const { data, error } = await createServiceClient().rpc('touch_session', {
    p_token_hash: `\\x${await sha256Hex(token)}`,
  })
  if (error || !data) throw new AppError('internal', 500, { cause: error })
  return data
}

async function readToken(): Promise<string | null> {
  const value = (await cookies()).get(SESSION_COOKIE)?.value
  return isSessionToken(value) ? value : null
}

export const getSessionId: () => Promise<Uuid> = cache(async () => {
  const token = await readToken()
  if (!token) {
    const { AppError } = await import('@/lib/security/errors')
    throw new AppError('unauthorized', 401)
  }
  return touch(token)
})

export const getSessionIdOrNull: () => Promise<Uuid | null> = cache(async () => {
  const token = await readToken()
  return token ? touch(token) : null
})
