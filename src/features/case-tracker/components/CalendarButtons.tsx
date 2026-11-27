'use client'

import { useTransition } from 'react'
import type { CaseToken, IsoDateTime } from '@/lib/contracts'
import { api } from '@/lib/routes'

export type CalendarButtonsProps = {
  token: CaseToken
  appointmentAt: IsoDateTime | null
  googleUrl: string | null
}

export function CalendarButtons({ token, appointmentAt, googleUrl }: CalendarButtonsProps) {
  const [pending, startTransition] = useTransition()

  if (!appointmentAt || !googleUrl) {
    return <p className="text-sm text-gray-500">ใส่วันนัดก่อน แล้วเพิ่มลงปฏิทินได้</p>
  }

  function trackGoogle() {
    startTransition(async () => {
      await fetch(api.case, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'calendar', token, kind: 'google' }),
      }).catch(() => {})
    })
  }

  return (
    <div className="flex flex-wrap gap-2">
      <a
        href={googleUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={trackGoogle}
        className="inline-flex min-h-12 items-center gap-2 rounded-lg border-2 border-blue-700 bg-white px-4 font-semibold text-blue-800 hover:bg-blue-50 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-blue-950 focus-visible:outline-solid"
      >
        เพิ่มใน Google Calendar
      </a>
      <a
        href={api.caseIcs(token)}
        download="bangkok-flow-case.ics"
        className="inline-flex min-h-12 items-center gap-2 rounded-lg border-2 border-gray-400 bg-white px-4 font-semibold text-gray-800 hover:bg-gray-50 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-blue-950 focus-visible:outline-solid"
      >
        ดาวน์โหลด .ics (iPhone / Outlook)
      </a>
      {pending && <span className="sr-only">กำลังบันทึก</span>}
    </div>
  )
}
