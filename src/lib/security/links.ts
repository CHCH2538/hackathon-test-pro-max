export const OFFICIAL_HOSTS: readonly string[] = [
  'dga.or.th',
  'www.dga.or.th',
  'traffy.in.th',
  'www.traffy.in.th',
  'citydata.traffy.in.th',
]

export const UTILITY_HOSTS: readonly string[] = [
  'www.google.com',
  'maps.google.com',
  'calendar.google.com',
  'line.me',
  'liff.line.me',
  'lin.ee',
  'apps.apple.com',
  'play.google.com',
]

export function checkLink(
  raw: string,
): { ok: true; url: string } | { ok: false; reason: 'parse' | 'scheme' | 'userinfo' | 'host' } {
  let u: URL
  try {
    u = new URL(raw.trim())
  } catch {
    return { ok: false, reason: 'parse' }
  }
  if (u.protocol !== 'https:') return { ok: false, reason: 'scheme' }
  if (u.username || u.password) return { ok: false, reason: 'userinfo' }
  const host = u.hostname.toLowerCase().replace(/\.$/, '')
  const allowed =
    u.port === '' &&
    (host.endsWith('.go.th') ||
      OFFICIAL_HOSTS.includes(host) ||
      (UTILITY_HOSTS.includes(host) && (host !== 'www.google.com' || u.pathname.startsWith('/maps'))))
  return allowed ? { ok: true, url: u.toString() } : { ok: false, reason: 'host' }
}

export function safeHref(raw: string | null | undefined): string | null {
  if (!raw) return null
  const r = checkLink(raw)
  return r.ok ? r.url : null
}
