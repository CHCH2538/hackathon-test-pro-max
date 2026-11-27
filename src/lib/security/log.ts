import 'server-only'
import type { EventName, EventProps, Uuid } from '@/lib/contracts'
import { maskPii } from '@/lib/ai/pii'
import { createServiceClient } from '@/lib/db/server'

type LogFn = (event: string, fields?: Record<string, unknown>) => void
type Level = 'info' | 'warn' | 'error'

const DENY_KEY = /token|secret|password|authorization|cookie|lat|lng|point|text|message|uid|id_token/i
const RESERVED_KEYS = new Set(['level', 'event', 'ts'])
const MAX_LOG_STRING = 200
const MAX_PROP_STRING = 64
const MAX_DEPTH = 3

function cleanString(s: string): string {
  return maskPii(s).text.slice(0, MAX_LOG_STRING)
}

function cleanValue(v: unknown, depth: number): unknown {
  if (typeof v === 'string') return cleanString(v)
  if (typeof v === 'number') return Number.isFinite(v) ? v : null
  if (typeof v === 'boolean' || v === null) return v
  if (typeof v === 'bigint') return v.toString()
  if (depth >= MAX_DEPTH || typeof v !== 'object') return undefined
  if (Array.isArray(v)) return v.map((x) => cleanValue(x, depth + 1)).filter((x) => x !== undefined)
  return cleanFields(v as Record<string, unknown>, depth + 1)
}

function cleanFields(fields: Record<string, unknown>, depth: number): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(fields)) {
    if (DENY_KEY.test(k) || (depth === 0 && RESERVED_KEYS.has(k))) continue
    const c = cleanValue(v, depth)
    if (c !== undefined) out[k] = c
  }
  return out
}

function emit(level: Level, event: string, fields?: Record<string, unknown>): void {
  const line = JSON.stringify({
    level,
    event: cleanString(event),
    ts: new Date().toISOString(),
    ...(fields ? cleanFields(fields, 0) : {}),
  })
  if (level === 'error') console.error(line)
  else if (level === 'warn') console.warn(line)
  else console.log(line)
}

export const log: { info: LogFn; warn: LogFn; error: LogFn } = {
  info: (event, fields) => emit('info', event, fields),
  warn: (event, fields) => emit('warn', event, fields),
  error: (event, fields) => emit('error', event, fields),
}

function cleanProps(props: EventProps): EventProps {
  const out: EventProps = {}
  for (const [k, v] of Object.entries(props as Record<string, unknown>)) {
    if (typeof v === 'string') {
      if (v.length <= MAX_PROP_STRING) out[k] = maskPii(v).text
    } else if ((typeof v === 'number' && Number.isFinite(v)) || typeof v === 'boolean' || v === null) {
      out[k] = v
    }
  }
  return out
}

export async function trackEvent(
  name: EventName,
  ctx: { sessionId?: Uuid; caseId?: Uuid },
  props: EventProps = {},
): Promise<void> {
  try {
    const { error } = await createServiceClient()
      .from('events')
      .insert({
        name,
        session_id: ctx.sessionId ?? null,
        case_id: ctx.caseId ?? null,
        props: cleanProps(props),
      })
    if (error) log.warn('track_event_failed', { name, code: error.code })
  } catch (err) {
    log.warn('track_event_failed', { name, error: err instanceof Error ? err.name : typeof err })
  }
}
