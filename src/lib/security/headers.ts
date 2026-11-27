import 'server-only'

export function buildCsp(nonce: string, env: { dev: boolean; supabaseUrl: string }): string {
  const scriptSrc = [
    "'self'",
    `'nonce-${nonce}'`,
    "'strict-dynamic'",
    'https://maps.googleapis.com',
    'https://static.line-scdn.net',
    ...(env.dev ? ["'unsafe-eval'"] : []),
  ]
  const connectSrc = [
    "'self'",
    ...(env.supabaseUrl ? [env.supabaseUrl] : []),
    'https://*.googleapis.com',
    'https://*.google.com',
    'https://*.gstatic.com',
    'https://api.line.me',
    'https://access.line.me',
    'https://liffsdk.line-scdn.net',
    'https://*.line-scdn.net',
  ]
  return [
    "default-src 'self'",
    `script-src ${scriptSrc.join(' ')}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://*.googleapis.com https://*.gstatic.com https://*.google.com https://*.ggpht.com https://*.line-scdn.net",
    "font-src 'self'",
    `connect-src ${connectSrc.join(' ')}`,
    'frame-src https://*.google.com',
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https://access.line.me",
    "frame-ancestors 'none'",
    'upgrade-insecure-requests',
  ].join('; ')
}

export function securityHeaders(env: { production: boolean }): ReadonlyArray<[string, string]> {
  return [
    ...(env.production
      ? [['Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload'] as [string, string]]
      : []),
    ['X-Frame-Options', 'DENY'],
    ['X-Content-Type-Options', 'nosniff'],
    ['Referrer-Policy', 'strict-origin-when-cross-origin'],
    ['Permissions-Policy', 'geolocation=(self), camera=(), microphone=(), payment=(), usb=()'],
    ['Cross-Origin-Opener-Policy', 'same-origin'],
  ]
}

export async function getNonce(): Promise<string | undefined> {
  const { headers } = await import('next/headers')
  return (await headers()).get('x-nonce') ?? undefined
}
