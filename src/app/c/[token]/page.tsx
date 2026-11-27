import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { NOT_POLICE_CHANNEL_TH } from '@/lib/ai/disclaimers'
import { getSessionId } from '@/lib/auth/session'
import { rateLimit } from '@/lib/security/rateLimit'
import { routes } from '@/lib/routes'
import { directionsUrl } from '@/lib/maps/urls'
import { Alert } from '@/components/ui/Alert'
import { Card } from '@/components/ui/Card'
import { loadCasePage } from '@/features/case-tracker/server'
import { CaseHeader } from '@/features/case-tracker/components/CaseHeader'
import { ChecklistPanel } from '@/features/case-tracker/components/ChecklistPanel'
import { OfficePanel } from '@/features/case-tracker/components/OfficePanel'
import { OnlinePanel } from '@/features/case-tracker/components/OnlinePanel'
import { TimeSavedCard } from '@/features/case-tracker/components/TimeSavedCard'
import { StatusActions } from '@/features/case-tracker/components/StatusActions'
import { CalendarButtons } from '@/features/case-tracker/components/CalendarButtons'
import { NextLinks } from '@/features/case-tracker/components/NextLinks'
import { RecentCases, SaveCurrentCase } from '@/features/case-tracker/components/RecentCases'
import { googleCalendarUrl } from '@/features/case-tracker/calendar'
import type { CaseToken } from '@/lib/contracts'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function CasePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  const sid = await getSessionId().catch(() => null)
  if (sid) {
    const rl = await rateLimit('case_read', sid)
    if (!rl.ok) {
      return (
        <main className="mx-auto max-w-xl px-4 py-8">
          <Alert tone="warn">เปิดบ่อยเกินไป ลองใหม่ในอีกสักครู่</Alert>
        </main>
      )
    }
  }

  const data = await loadCasePage(token)
  if (!data) notFound()

  const { view, services, isPolice, timeSaved } = data
  const titleTh = view.services.map((s) => s.nameTh).join(' + ')

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''
  const caseUrl = `${siteUrl}${routes.case(token as CaseToken)}`

  const calToken = token as CaseToken

  let googleUrl: string | null = null
  if (view.appointmentAt) {
    const totalDuration = services.reduce((acc, s) => acc + (s.durationMin ?? 60), 0)
    const dest = view.office
      ? view.office.googlePlaceId
        ? { placeId: view.office.googlePlaceId, name: view.office.nameTh }
        : view.office.location
      : null
    googleUrl = googleCalendarUrl({
      caseId: view.id,
      titleTh,
      appointmentAt: view.appointmentAt,
      departAt: view.departAt,
      durationMin: totalDuration || 60,
      office: view.office,
      directionsHref: dest ? directionsUrl({ destination: dest, travelMode: 'TRANSIT' }) : null,
      checklist: view.checklist,
      caseHref: caseUrl,
    })
  }

  return (
    <main className="mx-auto max-w-xl space-y-5 px-4 py-6">
      <SaveCurrentCase token={calToken} titleTh={titleTh} status={view.status} />

      <CaseHeader
        titleTh={titleTh}
        status={view.status}
        appointmentAt={view.appointmentAt}
        departAt={view.departAt}
      />

      {isPolice && (
        <Alert tone="info">{NOT_POLICE_CHANNEL_TH}</Alert>
      )}

      {view.onlineOnly && <OnlinePanel services={view.services} />}

      {view.checklist.length > 0 && (
        <Card>
          <ChecklistPanel items={[...view.checklist]} token={calToken} />
        </Card>
      )}

      {view.office && <OfficePanel office={view.office} agency={null} />}

      <TimeSavedCard timeSaved={timeSaved} />

      <Card title="การดำเนินการ">
        <StatusActions
          status={view.status}
          onlineOnly={view.onlineOnly}
          token={calToken}
        />
      </Card>

      <Card title="เพิ่มลงปฏิทิน">
        <CalendarButtons token={calToken} appointmentAt={view.appointmentAt} googleUrl={googleUrl} />
      </Card>

      <NextLinks
        token={calToken}
        hasOffice={view.office !== null}
        onlineOnly={view.onlineOnly}
        lineLinked={view.lineUserId !== null}
        caseUrl={caseUrl}
      />

      <RecentCases currentToken={calToken} />
    </main>
  )
}
