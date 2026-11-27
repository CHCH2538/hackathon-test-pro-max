import type { ChecklistItem, IsoDateTime, Office, Uuid } from '@/lib/contracts'
import { NOT_GOV_SITE_TH } from '@/lib/ai/disclaimers'

export type CalendarInput = {
  caseId: Uuid
  titleTh: string
  appointmentAt: IsoDateTime
  departAt: IsoDateTime | null
  durationMin: number
  office: Pick<Office, 'nameTh' | 'addressTh'> | null
  directionsHref: string | null
  checklist: readonly Pick<ChecklistItem, 'textTh' | 'checked'>[]
  caseHref: string
}

function escapeIcs(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')
}

function foldLine(line: string): string {
  const encoded = new TextEncoder().encode(line)
  if (encoded.length <= 75) return line

  const lines: string[] = []
  let pos = 0
  let first = true
  while (pos < encoded.length) {
    const limit = first ? 75 : 74
    let end = pos + limit
    if (end >= encoded.length) {
      lines.push((first ? '' : ' ') + new TextDecoder().decode(encoded.slice(pos)))
      break
    }
    // back off to avoid splitting multi-byte chars
    while (end > pos && (encoded[end]! & 0xc0) === 0x80) end--
    lines.push((first ? '' : ' ') + new TextDecoder().decode(encoded.slice(pos, end)))
    pos = end
    first = false
  }
  return lines.join('\r\n')
}

function toUtcStamp(iso: IsoDateTime): string {
  const d = new Date(iso)
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

function formatHhMm(iso: IsoDateTime): string {
  const d = new Date(iso)
  const bkk = new Date(d.getTime() + 7 * 3_600_000)
  const h = bkk.getUTCHours().toString().padStart(2, '0')
  const m = bkk.getUTCMinutes().toString().padStart(2, '0')
  return `${h}:${m}`
}

export function buildIcs(e: CalendarInput, now: Date): string {
  const start = e.departAt ?? e.appointmentAt
  const endDate = new Date(new Date(e.appointmentAt).getTime() + e.durationMin * 60_000)
  const endIso = endDate.toISOString() as IsoDateTime

  const descParts: string[] = [`นัด ${formatHhMm(e.appointmentAt)}`]
  if (e.departAt) descParts.push(`ควรออกจากบ้าน ${formatHhMm(e.departAt)}`)
  if (e.directionsHref) descParts.push(`นำทาง: ${e.directionsHref}`)
  descParts.push('Checklist:')
  for (const item of e.checklist) {
    descParts.push(`${item.checked ? '☑' : '☐'} ${item.textTh}`)
  }
  descParts.push(`ดูแผน: ${e.caseHref}`)
  descParts.push(NOT_GOV_SITE_TH)

  const description = descParts.join('\n')
  const location = e.office ? `${e.office.nameTh} ${e.office.addressTh}` : ''
  const dtstamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Bangkok Flow//TH',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    foldLine(`UID:${e.caseId}@bangkok-flow`),
    foldLine(`DTSTAMP:${dtstamp}`),
    foldLine(`DTSTART:${toUtcStamp(start)}`),
    foldLine(`DTEND:${toUtcStamp(endIso)}`),
    foldLine(`SUMMARY:${escapeIcs(e.titleTh)}`),
    ...(location ? [foldLine(`LOCATION:${escapeIcs(location)}`)] : []),
    foldLine(`DESCRIPTION:${escapeIcs(description)}`),
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    foldLine(`DESCRIPTION:${escapeIcs(e.titleTh)}`),
    'TRIGGER:-P1D',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ]

  return lines.join('\r\n') + '\r\n'
}

export function googleCalendarUrl(e: CalendarInput): string {
  const start = e.departAt ?? e.appointmentAt
  const endDate = new Date(new Date(e.appointmentAt).getTime() + e.durationMin * 60_000)

  const fmt = (iso: IsoDateTime) =>
    new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z/, 'Z')

  const descParts: string[] = [`นัด ${formatHhMm(e.appointmentAt)}`]
  if (e.departAt) descParts.push(`ควรออกจากบ้าน ${formatHhMm(e.departAt)}`)
  if (e.directionsHref) descParts.push(`นำทาง: ${e.directionsHref}`)
  descParts.push('Checklist:')
  for (const item of e.checklist) {
    descParts.push(`${item.checked ? '☑' : '☐'} ${item.textTh}`)
  }
  descParts.push(`ดูแผน: ${e.caseHref}`)
  descParts.push(NOT_GOV_SITE_TH)

  let details = descParts.join('\n')
  if (details.length > 1_500) {
    const truncated = descParts.slice(0, -2)
    while (truncated.join('\n').length > 1_490) truncated.pop()
    details = truncated.join('\n') + '\n…'
  }

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: e.titleTh,
    dates: `${fmt(start)}/${fmt(endDate.toISOString() as IsoDateTime)}`,
    details,
  })
  if (e.office) params.set('location', `${e.office.nameTh} ${e.office.addressTh}`)

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}
