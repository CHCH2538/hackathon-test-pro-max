import type { AgencyKind, Holiday, HhMm, IsoDate, Office, TimeRange, Weekday } from '@/lib/contracts'
import { bangkokDate, isoDateToUtcMs } from './staleness'

const WEEKDAYS: readonly Weekday[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
const BANGKOK_OFFSET_MS = 7 * 3_600_000

function toMinutes(t: HhMm): number {
  const [h, m] = t.split(':')
  return Number(h) * 60 + Number(m)
}

function weekdayOf(date: IsoDate): Weekday {
  return WEEKDAYS[new Date(isoDateToUtcMs(date)).getUTCDay()]!
}

function isClosedByHoliday(officeId: string, agencyKind: AgencyKind, date: IsoDate, holidays: readonly Holiday[]): boolean {
  return holidays.some(
    (h) =>
      h.date === date &&
      ((h.closedAgencyKinds === null && h.closedOfficeIds === null) ||
        (h.closedAgencyKinds?.includes(agencyKind) ?? false) ||
        (h.closedOfficeIds?.includes(officeId) ?? false)),
  )
}

export function openSlots(
  office: Pick<Office, 'id' | 'openingHours'>,
  agencyKind: AgencyKind,
  date: IsoDate,
  holidays: readonly Holiday[],
): TimeRange[] {
  if (isClosedByHoliday(office.id, agencyKind, date, holidays)) return []
  return [...(office.openingHours[weekdayOf(date)] ?? [])]
}

export function isOpenAt(
  office: Pick<Office, 'id' | 'agencyId' | 'openingHours'>,
  agencyKind: AgencyKind,
  at: Date,
  holidays: readonly Holiday[],
): boolean {
  const date = bangkokDate(at)
  const local = new Date(at.getTime() + BANGKOK_OFFSET_MS)
  const minutes = local.getUTCHours() * 60 + local.getUTCMinutes()
  return openSlots(office, agencyKind, date, holidays).some(
    (r) => minutes >= toMinutes(r.open) && minutes < toMinutes(r.close),
  )
}
