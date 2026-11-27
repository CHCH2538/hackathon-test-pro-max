import { CASE_TRANSITIONS, ONLINE_ONLY_EDGE } from '@/lib/contracts'
import type { CaseStatus, CaseToken } from '@/lib/contracts'

const CASE_TOKEN_RE = /^[A-Za-z0-9_-]{22}$/

export function isCaseToken(x: unknown): x is CaseToken {
  return typeof x === 'string' && CASE_TOKEN_RE.test(x)
}

export function canTransition(from: CaseStatus, to: CaseStatus, onlineOnly: boolean): boolean {
  if (!CASE_TRANSITIONS[from].includes(to)) return false
  if (from === ONLINE_ONLY_EDGE.from && to === ONLINE_ONLY_EDGE.to) return onlineOnly
  return true
}
