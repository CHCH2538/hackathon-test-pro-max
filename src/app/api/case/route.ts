import { setChecklistItem, transitionCase } from '@/lib/case'
import type { CaseToken } from '@/lib/contracts'
import { getSessionId } from '@/lib/auth/session'
import { rateLimit } from '@/lib/security/rateLimit'
import { AppError, toSafeResponse } from '@/lib/security/errors'
import { trackEvent } from '@/lib/security/log'
import { CaseActionSchema } from '@/features/case-tracker/schemas'

const MAX_APPT_DAYS = 365

export async function POST(request: Request): Promise<Response> {
  try {
    const sid = await getSessionId()
    const rl = await rateLimit('case_write', sid)
    if (!rl.ok) throw new AppError('rate_limited', 429, { retryAfterSec: rl.retryAfterSec })

    const json = await request.json().catch(() => null)
    const parsed = CaseActionSchema.safeParse(json)
    if (!parsed.success) throw new AppError('bad_request', 400)

    const action = parsed.data

    if (action.action === 'tick') {
      const item = await setChecklistItem(action.token, action.itemId, action.checked)
      if (!item) throw new AppError('not_found', 404)
      trackEvent('checklist_ticked', { caseId: item.caseId }, { checked: action.checked }).catch(() => {})
      return Response.json({ item })
    }

    if (action.action === 'book') {
      const appt = new Date(action.appointmentAt)
      const now = new Date()
      const maxFuture = new Date(now.getTime() + MAX_APPT_DAYS * 86_400_000)
      if (appt <= now || appt > maxFuture) throw new AppError('bad_request', 400)

      const result = await transitionCase(action.token, 'booked', { appointmentAt: action.appointmentAt })
      if (!result.ok) {
        if (result.reason === 'not_found') throw new AppError('not_found', 404)
        if (result.reason === 'missing_appointment') throw new AppError('bad_request', 400)
        throw new AppError('conflict', 409)
      }
      return Response.json({ status: result.case.status, appointmentAt: result.case.appointmentAt })
    }

    if (action.action === 'transition') {
      const result = await transitionCase(action.token as CaseToken, action.to)
      if (!result.ok) {
        if (result.reason === 'not_found') throw new AppError('not_found', 404)
        throw new AppError('conflict', 409)
      }
      return Response.json({ status: result.case.status, appointmentAt: result.case.appointmentAt })
    }

    if (action.action === 'calendar') {
      const { getCaseByToken } = await import('@/lib/case')
      const view = await getCaseByToken(action.token)
      if (!view) throw new AppError('not_found', 404)
      trackEvent('calendar_added', { caseId: view.id }, { kind: 'google' }).catch(() => {})
      return Response.json({})
    }

    throw new AppError('bad_request', 400)
  } catch (err) {
    return toSafeResponse(err)
  }
}
