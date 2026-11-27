import { getCaseByToken } from '@/lib/case'
import { getServicesByIds } from '@/lib/catalog'
import { AppError, toSafeResponse } from '@/lib/security/errors'
import { trackEvent } from '@/lib/security/log'
import { routes } from '@/lib/routes'
import { directionsUrl } from '@/lib/maps/urls'
import { buildIcs } from '@/features/case-tracker/calendar'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
): Promise<Response> {
  try {
    const { token } = await params
    const view = await getCaseByToken(token)
    if (!view) throw new AppError('not_found', 404)
    if (!view.appointmentAt) throw new AppError('conflict', 409)

    const services = await getServicesByIds(view.serviceIds)
    const totalDuration = services.reduce((acc, s) => acc + (s.durationMin ?? 60), 0)
    const titleTh = view.services.map((s) => s.nameTh).join(' + ')

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''
    const caseHref = `${siteUrl}${routes.case(view.id as never)}`

    const dest = view.office
      ? view.office.googlePlaceId
        ? { placeId: view.office.googlePlaceId, name: view.office.nameTh }
        : view.office.location
      : null

    const ics = buildIcs(
      {
        caseId: view.id,
        titleTh,
        appointmentAt: view.appointmentAt,
        departAt: view.departAt,
        durationMin: totalDuration || 60,
        office: view.office,
        directionsHref: dest ? directionsUrl({ destination: dest, travelMode: 'TRANSIT' }) : null,
        checklist: view.checklist,
        caseHref,
      },
      new Date(),
    )

    trackEvent('calendar_added', { caseId: view.id }, { kind: 'ics' }).catch(() => {})

    return new Response(ics, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'attachment; filename="bangkok-flow-case.ics"',
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    return toSafeResponse(err)
  }
}
