import type { IsoDate } from '@/lib/contracts'
import { staleness } from '@/lib/catalog/pure'

export type StaleBadgeProps = {
  lastVerified: IsoDate
  now?: Date
}

export function StaleBadge({ lastVerified, now = new Date() }: StaleBadgeProps) {
  if (!staleness(lastVerified, now).isStale) return null
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-amber-400 bg-amber-100 px-3 py-0.5 text-sm font-semibold text-amber-900">
      ควรโทรยืนยัน
    </span>
  )
}
