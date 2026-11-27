import 'server-only'
import { HTTPFetchError, messagingApi } from '@line/bot-sdk'
import type { Uuid } from '@/lib/contracts'
import { claimPush } from '@/lib/case/queries'
import { createServiceClient } from '@/lib/db/server'
import { AppError } from '@/lib/security/errors'
import { log, trackEvent } from '@/lib/security/log'
import { UuidSchema } from '@/lib/security/schemas'
export type PushResult = 'sent' | 'not_friend' | 'no_budget' | 'failed'
export const MAX_PUSH_MESSAGES = 5
let client: messagingApi.MessagingApiClient | undefined
function lineClient(): messagingApi.MessagingApiClient {
  const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN
  if (!channelAccessToken) throw new AppError('not_configured', 503)
  client ??= new messagingApi.MessagingApiClient({ channelAccessToken })
  return client
}
export async function pushToLineUser(
  lineUserId: Uuid,
  messages: readonly messagingApi.Message[],
  opts: { caseId: Uuid | null; retryKey?: Uuid },
): Promise<PushResult> {
  if (
    !UuidSchema.safeParse(lineUserId).success ||
    messages.length < 1 ||
    messages.length > MAX_PUSH_MESSAGES ||
    (opts.caseId !== null && !UuidSchema.safeParse(opts.caseId).success) ||
    (opts.retryKey !== undefined && !UuidSchema.safeParse(opts.retryKey).success)
  ) {
    throw new AppError('bad_request', 400)
  }
  const line = lineClient()
  const { data, error } = await createServiceClient()
    .from('line_users')
    .select('line_uid, is_friend, blocked_at')
    .eq('id', lineUserId)
    .maybeSingle()
  if (error) throw new AppError('internal', 500, { cause: error })
  if (!data || !data.is_friend || data.blocked_at !== null) return 'not_friend'
  if (!(await claimPush(opts.caseId))) return 'no_budget'
  try {
    await line.pushMessage({ to: data.line_uid, messages: [...messages] }, opts.retryKey)
  } catch (err) {
    if (!(err instanceof HTTPFetchError && err.status === 409)) {
      log.warn('line_push_failed', { status: err instanceof HTTPFetchError ? err.status : null })
      return 'failed'
    }
  }
  await trackEvent('push_sent', opts.caseId ? { caseId: opts.caseId } : {}, { messages: messages.length })
  return 'sent'
}
