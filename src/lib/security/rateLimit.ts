import 'server-only'
import { createServiceClient } from '@/lib/db/server'
import { log } from './log'

export type RateLimitPolicy =
  | 'chat'
  | 'chat_ip'
  | 'plan'
  | 'maps'
  | 'case_read'
  | 'case_write'
  | 'line_login'
  | 'line_webhook'
  | 'report'
  | 'admin'
  | 'pass'
  | 'llm_daily'

const llmDailyCap = Number.parseInt(process.env.LLM_DAILY_CALL_CAP ?? '', 10)

export const RATE_LIMITS: Readonly<Record<RateLimitPolicy, { windowSec: number; max: number }>> = {
  chat: { windowSec: 60, max: 20 },
  chat_ip: { windowSec: 60, max: 60 },
  plan: { windowSec: 60, max: 30 },
  maps: { windowSec: 60, max: 60 },
  case_read: { windowSec: 60, max: 60 },
  case_write: { windowSec: 60, max: 30 },
  line_login: { windowSec: 600, max: 10 },
  line_webhook: { windowSec: 60, max: 600 },
  report: { windowSec: 3600, max: 5 },
  admin: { windowSec: 60, max: 120 },
  pass: { windowSec: 60, max: 10 },
  llm_daily: { windowSec: 86400, max: Number.isFinite(llmDailyCap) && llmDailyCap > 0 ? llmDailyCap : 2000 },
}

const FAIL_CLOSED_RETRY_SEC = 30

export async function rateLimit(
  policy: RateLimitPolicy | { name: string; windowSec: number; max: number },
  subject: string,
): Promise<{ ok: true } | { ok: false; retryAfterSec: number }> {
  const { name, windowSec, max } =
    typeof policy === 'string' ? { name: policy, ...RATE_LIMITS[policy] } : policy
  try {
    const { data, error } = await createServiceClient().rpc('rate_limit_hit', {
      p_key: `${name}:${subject}`,
      p_window_sec: windowSec,
      p_max: max,
    })
    const row = data?.[0]
    if (error || !row) {
      log.error('rate_limit_error', { policy: name, code: error?.code ?? 'no_row' })
      return { ok: false, retryAfterSec: FAIL_CLOSED_RETRY_SEC }
    }
    if (row.allowed) return { ok: true }
    const retryAfterSec = Math.max(1, row.retry_after_sec)
    log.warn('rate_limited', { policy: name, retryAfterSec })
    return { ok: false, retryAfterSec }
  } catch (err) {
    log.error('rate_limit_error', { policy: name, error: err instanceof Error ? err.name : typeof err })
    return { ok: false, retryAfterSec: FAIL_CLOSED_RETRY_SEC }
  }
}
