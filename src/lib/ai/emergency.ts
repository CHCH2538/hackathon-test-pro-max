import type { EmergencyResult } from '@/lib/contracts'

export const EMERGENCY_TERMS: readonly string[] = [
  'บาดเจ็บ',
  'เลือดออก',
  'หมดสติ',
  'ไม่หายใจ',
  'หายใจไม่ออก',
  'ถูกแทง',
  'ถูกยิง',
  'กำลังทำร้าย',
  'กำลังเกิดเหตุ',
  'ไฟไหม้',
  'จมน้ำ',
  'ชัก',
  'รถชน',
  'ช่วยด้วย',
] as const
export const NEGATION_WINDOW = 10
const NEGATED_BEFORE = /(ไม่มี|ไม่ได้|ไม่ได้มี)\s*(ใคร|คน)?\s*$/

export function detectEmergency(text: string): EmergencyResult {
  const t = text
    .normalize('NFC')
    .replace(/[\u200b-\u200d\ufeff]/g, '')
    .replace(/\s+/g, ' ')
  for (const term of EMERGENCY_TERMS) {
    let i = t.indexOf(term)
    while (i !== -1) {
      const before = t.slice(Math.max(0, i - NEGATION_WINDOW), i)
      if (!NEGATED_BEFORE.test(before)) return { emergency: true, matchedTerm: term }
      i = t.indexOf(term, i + term.length)
    }
  }
  return { emergency: false }
}
