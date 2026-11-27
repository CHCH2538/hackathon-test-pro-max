import type { Condition, SlotAnswers, SlotValue } from '@/lib/contracts'

export type Tri = 'true' | 'false' | 'unknown'

type Leaf = Extract<Condition, { slot: string }>

function slotValue(slots: SlotAnswers, key: string): Exclude<SlotValue, null> | undefined {
  if (!Object.hasOwn(slots, key)) return undefined
  return slots[key] ?? undefined
}

function matchLeaf(c: Leaf, v: Exclude<SlotValue, null>): boolean {
  switch (c.op) {
    case 'eq':
      return v === c.value
    case 'neq':
      return v !== c.value
    case 'in':
      return typeof v === 'string' && c.value.includes(v)
    case 'exists':
      return true
  }
}

export function evaluateCondition(c: Condition | null, slots: SlotAnswers): boolean {
  if (c === null) return true
  if ('all' in c) return c.all.every((x) => evaluateCondition(x, slots))
  if ('any' in c) return c.any.some((x) => evaluateCondition(x, slots))
  if ('not' in c) return !evaluateCondition(c.not, slots)
  const v = slotValue(slots, c.slot)
  if (v === undefined) return c.op === 'neq'
  return matchLeaf(c, v)
}

export function evaluateCondition3(c: Condition | null, slots: SlotAnswers): Tri {
  if (c === null) return 'true'
  if ('all' in c) {
    const rs = c.all.map((x) => evaluateCondition3(x, slots))
    if (rs.includes('false')) return 'false'
    return rs.includes('unknown') ? 'unknown' : 'true'
  }
  if ('any' in c) {
    const rs = c.any.map((x) => evaluateCondition3(x, slots))
    if (rs.includes('true')) return 'true'
    return rs.includes('unknown') ? 'unknown' : 'false'
  }
  if ('not' in c) {
    const r = evaluateCondition3(c.not, slots)
    return r === 'unknown' ? 'unknown' : r === 'true' ? 'false' : 'true'
  }
  const v = slotValue(slots, c.slot)
  if (v === undefined) return 'unknown'
  return matchLeaf(c, v) ? 'true' : 'false'
}
