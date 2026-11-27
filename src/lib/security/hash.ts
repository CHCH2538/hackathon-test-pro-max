import 'server-only'
import { createHmac } from 'node:crypto'
import { AppError } from './errors'

export function hashIp(ip: string): string {
  const salt = process.env.IP_HASH_SALT
  if (!salt) throw new AppError('not_configured', 503)
  return createHmac('sha256', salt).update(ip).digest('hex').slice(0, 32)
}

export function clientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  if (forwarded) return forwarded
  const real = req.headers.get('x-real-ip')?.trim()
  return real || 'unknown'
}
