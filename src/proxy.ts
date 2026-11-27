import { NextResponse, type NextRequest } from 'next/server'
import { buildCsp, securityHeaders } from '@/lib/security/headers'
import { ADMIN_REALM, checkBasicAuth } from '@/lib/auth/admin'
import { SESSION_COOKIE, SESSION_COOKIE_OPTIONS, isSessionToken, mintSessionToken } from '@/lib/auth/session'

function isAdminPath(p: string): boolean {
  return p === '/admin' || p.startsWith('/admin/') || p === '/api/admin' || p.startsWith('/api/admin/')
}

function needsSession(p: string): boolean {
  return (
    p !== '/api/line/webhook' && !p.includes('/cron/') && p !== '/api/health' && p !== '/api/pass/webhook'
  )
}

function base64(bytes: Uint8Array): string {
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin)
}

function withCookie(header: string | null, name: string, value: string): string {
  const rest = (header ?? '')
    .split(';')
    .map((part) => part.trim())
    .filter((part) => part && part.split('=', 1)[0]!.trim() !== name)
  return [...rest, `${name}=${value}`].join('; ')
}

function applyHeaders(res: NextResponse, csp: string, headers: ReadonlyArray<[string, string]>): void {
  res.headers.set('Content-Security-Policy', csp)
  for (const [key, value] of headers) res.headers.set(key, value)
}

export function proxy(req: NextRequest): NextResponse {
  const { pathname } = req.nextUrl
  const dev = process.env.NODE_ENV !== 'production'
  const nonce = base64(crypto.getRandomValues(new Uint8Array(16)))
  const csp = buildCsp(nonce, { dev, supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '' })
  const headers = securityHeaders({ production: process.env.APP_ENV === 'production' })

  if (isAdminPath(pathname)) {
    const auth = checkBasicAuth(req.headers.get('authorization'))
    if (auth !== 'ok') {
      const res = new NextResponse(null, { status: auth === 'not_configured' ? 503 : 401 })
      if (auth === 'denied') {
        res.headers.set('WWW-Authenticate', `Basic realm="${ADMIN_REALM}", charset="UTF-8"`)
      }
      applyHeaders(res, csp, headers)
      return res
    }
  }

  const reqHeaders = new Headers(req.headers)
  reqHeaders.set('x-nonce', nonce)
  reqHeaders.set('content-security-policy', csp)

  const current = req.cookies.get(SESSION_COOKIE)?.value
  const mint = needsSession(pathname) && !isSessionToken(current)
  const sid = mint ? mintSessionToken() : null
  if (sid) reqHeaders.set('cookie', withCookie(req.headers.get('cookie'), SESSION_COOKIE, sid))

  const res = NextResponse.next({ request: { headers: reqHeaders } })
  applyHeaders(res, csp, headers)
  if (sid) res.cookies.set(SESSION_COOKIE, sid, SESSION_COOKIE_OPTIONS)
  return res
}

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico|og/).*)'] }
