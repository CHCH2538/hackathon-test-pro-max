import 'server-only'
import { createHmac, timingSafeEqual } from 'node:crypto'
import { log } from './log'

export function verifyHmacSignature(
  rawBody: string,
  header: string | null,
  secret: string,
  encoding: 'hex' | 'base64',
): boolean {
  if (!header || !secret) return false
  const expected = Buffer.from(createHmac('sha256', secret).update(rawBody).digest(encoding))
  const given = Buffer.from(encoding === 'hex' ? header.trim().toLowerCase() : header.trim())
  if (given.length !== expected.length) return false
  return timingSafeEqual(given, expected)
}

export function verifyLineSignature(rawBody: string, header: string | null): boolean {
  const ok = verifyHmacSignature(rawBody, header, process.env.LINE_CHANNEL_SECRET ?? '', 'base64')
  if (!ok) log.warn('signature_failed', { source: 'line', present: header !== null })
  return ok
}
