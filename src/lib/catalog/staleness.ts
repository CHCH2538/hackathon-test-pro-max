import type { IsoDate, Staleness } from '@/lib/contracts'

export const STALE_AFTER_DAYS = 90

const DAY_MS = 86_400_000
const BANGKOK_OFFSET_MS = 7 * 3_600_000
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/

export function bangkokDate(at: Date): IsoDate {
  return new Date(at.getTime() + BANGKOK_OFFSET_MS).toISOString().slice(0, 10)
}

export function isoDateToUtcMs(date: IsoDate): number {
  const m = ISO_DATE.exec(date)
  if (!m) throw new RangeError('invalid IsoDate')
  const ms = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  if (new Date(ms).toISOString().slice(0, 10) !== date) throw new RangeError('invalid IsoDate')
  return ms
}

export function staleness(lastVerified: IsoDate, now: Date): Staleness {
  const days = Math.round((isoDateToUtcMs(bangkokDate(now)) - isoDateToUtcMs(lastVerified)) / DAY_MS)
  return { days, isStale: days > STALE_AFTER_DAYS }
}
