import 'server-only'
import type { CaseToken, CaseView, Service } from '@/lib/contracts'
import { getCaseByToken, updateCase } from '@/lib/case'
import { getAgency, getServicesByIds } from '@/lib/catalog'
import { trackEvent } from '@/lib/security/log'
import { estimateTimeSaved, type TimeSaved } from '../timeSaved'

export type CasePageData = {
  view: CaseView
  services: Service[]
  isPolice: boolean
  timeSaved: TimeSaved
}

export async function loadCasePage(token: string): Promise<CasePageData | null> {
  const view = await getCaseByToken(token)
  if (!view) return null

  const services = await getServicesByIds(view.serviceIds)

  const agencyIds = [...new Set(view.services.map((s) => s.agencyId))]
  const agencies = await Promise.all(agencyIds.map((id) => getAgency(id)))
  const isPolice = agencies.some((a) => a?.kind === 'police')

  const timeSaved = estimateTimeSaved(view, services)

  if (view.timeSavedMin !== timeSaved.minutes) {
    await updateCase(token as CaseToken, { timeSavedMin: timeSaved.minutes })
  }

  trackEvent('case_viewed', { caseId: view.id }, { status: view.status }).catch(() => {})

  return { view, services, isPolice, timeSaved }
}
