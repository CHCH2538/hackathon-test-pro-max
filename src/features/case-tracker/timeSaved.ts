import type { CaseView, Service } from '@/lib/contracts'

export const DEFAULT_ONE_WAY_MIN = 45
export const DEFAULT_SERVICE_MIN = 60

export type TimeSaved = { minutes: number; basisTh: string }

export function estimateTimeSaved(
  c: Pick<CaseView, 'onlineOnly' | 'appointmentAt' | 'departAt'>,
  services: readonly Pick<Service, 'durationMin'>[],
): TimeSaved {
  let oneWay = DEFAULT_ONE_WAY_MIN
  if (c.departAt && c.appointmentAt) {
    const gapMin = (new Date(c.appointmentAt).getTime() - new Date(c.departAt).getTime()) / 60_000
    if (gapMin >= 5 && gapMin <= 240) oneWay = gapMin
  }

  const maxDuration = services.reduce<number | null>((acc, s) => {
    if (s.durationMin === null) return acc
    return acc === null ? s.durationMin : Math.max(acc, s.durationMin)
  }, null)
  const wait = maxDuration ?? DEFAULT_SERVICE_MIN

  const raw = 2 * oneWay + wait
  const minutes = Math.round(raw / 5) * 5

  const basisTh = c.onlineOnly
    ? 'ไม่ต้องเดินทางไปสำนักงาน (ไป-กลับ + เวลารอ)'
    : 'เลี่ยงการไปซ้ำ 1 เที่ยวเพราะเตรียมเอกสารครบ (ไป-กลับ + เวลารอ)'

  return { minutes, basisTh }
}
