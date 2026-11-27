import 'server-only'
import { createHash, timingSafeEqual } from 'node:crypto'
import { AppError } from './errors'

const MIN_SECRET_LENGTH = 32

function digest(s: string): Buffer {
  return createHash('sha256').update(s).digest()
}

export function requireCronAuth(req: Request): void {
  const secret = process.env.CRON_SECRET
  const header = req.headers.get('authorization')
  if (!secret || secret.length < MIN_SECRET_LENGTH || !header) throw new AppError('unauthorized', 401)
  if (!timingSafeEqual(digest(header), digest(`Bearer ${secret}`))) throw new AppError('unauthorized', 401)
}
