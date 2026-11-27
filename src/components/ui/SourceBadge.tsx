import type { IsoDate } from '@/lib/contracts'
import { isoDateToUtcMs } from '@/lib/catalog/staleness'
import { ExternalLink } from './ExternalLink'

export type SourceBadgeProps = {
  sourceUrl: string
  lastVerified: IsoDate
}

const THAI_DATE = new Intl.DateTimeFormat('th-TH', { dateStyle: 'long', timeZone: 'UTC' })

function hostOf(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return url
  }
}

function thaiDate(date: IsoDate): string {
  try {
    return THAI_DATE.format(new Date(isoDateToUtcMs(date)))
  } catch {
    return date
  }
}

export function SourceBadge({ sourceUrl, lastVerified }: SourceBadgeProps) {
  return (
    <span className="inline-flex flex-wrap items-center gap-x-2 text-sm text-gray-800">
      <span>
        แหล่งที่มา: <ExternalLink href={sourceUrl}>{hostOf(sourceUrl)}</ExternalLink>
      </span>
      <span>
        ตรวจสอบเมื่อ <time dateTime={lastVerified}>{thaiDate(lastVerified)}</time>
      </span>
    </span>
  )
}
