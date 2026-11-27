import 'server-only'
import Anthropic from '@anthropic-ai/sdk'
import type { Uuid } from '@/lib/contracts'
import { AppError } from '@/lib/security/errors'
import { log, trackEvent } from '@/lib/security/log'
import { rateLimit } from '@/lib/security/rateLimit'
import { maskPii } from './pii'
export type ClaudeCall = {
  purpose: 'chat' | 'line' | 'ocr'
  system: string
  messages: Anthropic.MessageParam[]
  tools?: Anthropic.Tool[]
  maxTokens?: number
  signal?: AbortSignal
  sessionId?: Uuid
}
type Usage = { usageIn: number; usageOut: number }
type Outcome = 'ok' | 'timeout' | 'aborted' | 'error'
const DEFAULT_MAX_TOKENS = 600
const DEFAULT_TIMEOUT_MS = 8000
let client: Anthropic | undefined
function positiveInt(raw: string | undefined, fallback: number): number {
  const n = Number.parseInt(raw ?? '', 10)
  return Number.isFinite(n) && n > 0 ? n : fallback
}
function config(): { anthropic: Anthropic; model: string } {
  const apiKey = process.env.ANTHROPIC_API_KEY
  const model = process.env.ANTHROPIC_MODEL
  if (!apiKey || !model) throw new AppError('not_configured', 503)
  client ??= new Anthropic({ apiKey })
  return { anthropic: client, model }
}
function maxTokensFor(call: ClaudeCall): number {
  const cap = positiveInt(process.env.LLM_MAX_TOKENS, DEFAULT_MAX_TOKENS)
  const requested = call.maxTokens !== undefined && call.maxTokens > 0 ? Math.floor(call.maxTokens) : cap
  return Math.min(requested, cap)
}
function assertNoCoords(call: ClaudeCall): void {
  if (maskPii(JSON.stringify(call.messages)).counts.coords > 0) {
    log.error('llm_coords_blocked', { purpose: call.purpose })
    throw new AppError('internal', 500)
  }
}
async function prepare(call: ClaudeCall) {
  const { anthropic, model } = config()
  assertNoCoords(call)
  const limit = await rateLimit('llm_daily', 'global')
  if (!limit.ok) throw new AppError('upstream_unavailable', 503, { retryAfterSec: limit.retryAfterSec })
  const timeout = AbortSignal.timeout(positiveInt(process.env.LLM_TIMEOUT_MS, DEFAULT_TIMEOUT_MS))
  const signal = call.signal ? AbortSignal.any([call.signal, timeout]) : timeout
  const params: Omit<Anthropic.MessageCreateParamsNonStreaming, 'stream'> = {
    model,
    max_tokens: maxTokensFor(call),
    system: call.system,
    messages: call.messages,
    ...(call.tools ? { tools: call.tools } : {}),
  }
  return { anthropic, params, signal, timeout, startedAt: Date.now() }
}
function outcomeOf(err: unknown, timeout: AbortSignal, external?: AbortSignal): Outcome {
  if (timeout.aborted) return 'timeout'
  if (external?.aborted) return 'aborted'
  return err === undefined ? 'ok' : 'error'
}
async function record(
  call: ClaudeCall,
  model: string,
  outcome: Outcome,
  usage: Usage,
  startedAt: number,
  err?: unknown,
): Promise<void> {
  const props = {
    purpose: call.purpose,
    model,
    outcome,
    usageIn: usage.usageIn,
    usageOut: usage.usageOut,
    durationMs: Date.now() - startedAt,
    ...(err instanceof Anthropic.APIError && err.status !== undefined ? { status: err.status } : {}),
  }
  if (outcome === 'ok') log.info('llm_call', props)
  else log.warn('llm_call', props)
  await trackEvent('llm_call', { sessionId: call.sessionId }, props)
}
function toAppError(err: unknown): AppError {
  return err instanceof AppError ? err : new AppError('upstream_unavailable', 503, { cause: err })
}
export async function callClaude(call: ClaudeCall): Promise<Anthropic.Message> {
  const { anthropic, params, signal, timeout, startedAt } = await prepare(call)
  try {
    const message = await anthropic.messages.create({ ...params, stream: false }, { signal })
    await record(
      call,
      params.model,
      'ok',
      { usageIn: message.usage.input_tokens, usageOut: message.usage.output_tokens },
      startedAt,
    )
    return message
  } catch (err) {
    await record(
      call,
      params.model,
      outcomeOf(err, timeout, call.signal),
      { usageIn: 0, usageOut: 0 },
      startedAt,
      err,
    )
    throw toAppError(err)
  }
}
export async function* streamClaude(call: ClaudeCall): AsyncIterable<Anthropic.MessageStreamEvent> {
  const { anthropic, params, signal, timeout, startedAt } = await prepare(call)
  const usage: Usage = { usageIn: 0, usageOut: 0 }
  let failure: unknown
  let completed = false
  try {
    const stream = await anthropic.messages.create({ ...params, stream: true }, { signal })
    for await (const event of stream) {
      if (event.type === 'message_start') {
        usage.usageIn = event.message.usage.input_tokens
        usage.usageOut = event.message.usage.output_tokens
      } else if (event.type === 'message_delta') {
        usage.usageOut = event.usage.output_tokens
      }
      yield event
    }
    completed = true
  } catch (err) {
    failure = err
    throw toAppError(err)
  } finally {
    const outcome = completed
      ? 'ok'
      : failure === undefined
        ? 'aborted'
        : outcomeOf(failure, timeout, call.signal)
    await record(call, params.model, outcome, usage, startedAt, failure)
  }
}
