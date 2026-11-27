'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { CaseStatus, CaseToken } from '@/lib/contracts'
import { CASE_TRANSITIONS, CASE_STATUS_LABEL_TH } from '@/lib/contracts'
import { canTransition } from '@/lib/case/status'
import { Button } from '@/components/ui/Button'
import { api } from '@/lib/routes'

export type StatusActionsProps = {
  status: CaseStatus
  onlineOnly: boolean
  token: CaseToken
}

const ACTION_LABEL_TH: Partial<Record<CaseStatus, string>> = {
  booked: 'บันทึกวันนัด',
  done: 'เสร็จแล้ว',
  postponed: 'เลื่อนนัด',
  cancelled: 'ยกเลิก',
}

export function StatusActions({ status, onlineOnly, token }: StatusActionsProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [apptInput, setApptInput] = useState('')

  const transitions = CASE_TRANSITIONS[status].filter(
    (to) => to !== 'due' && canTransition(status, to, onlineOnly),
  )

  if (transitions.length === 0) return null

  async function doTransition(to: CaseStatus, opts?: { appointmentAt?: string }) {
    setError(null)
    startTransition(async () => {
      try {
        const body: Record<string, unknown> =
          to === 'booked'
            ? { action: 'book', token, appointmentAt: opts?.appointmentAt }
            : { action: 'transition', token, to }

        const res = await fetch(api.case, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })

        if (res.status === 409) {
          setError('สถานะเปลี่ยนไปแล้ว กรุณาโหลดหน้าใหม่')
          router.refresh()
          return
        }
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as { messageTh?: string }
          setError(data.messageTh ?? 'เกิดข้อผิดพลาด')
          return
        }
        router.refresh()
      } catch {
        setError('เกิดข้อผิดพลาดในการเชื่อมต่อ')
      }
    })
  }

  function localToIso(local: string): string {
    // local is "YYYY-MM-DDTHH:mm" from datetime-local input
    return `${local}:00+07:00`
  }

  return (
    <section aria-label="การดำเนินการ" className="space-y-3">
      {error && <p className="text-sm text-red-700">{error}</p>}

      {transitions.includes('booked') && (
        <div className="space-y-2 rounded-lg border border-gray-200 p-3">
          <label className="block text-sm font-medium text-gray-700" htmlFor="appointment-input">
            วันเวลาที่จองได้
          </label>
          <input
            id="appointment-input"
            type="datetime-local"
            value={apptInput}
            onChange={(e) => setApptInput(e.target.value)}
            min={new Date().toISOString().slice(0, 16)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-700"
          />
          <Button
            variant="primary"
            disabled={!apptInput || pending}
            onClick={() => doTransition('booked', { appointmentAt: localToIso(apptInput) })}
          >
            {ACTION_LABEL_TH['booked']}
          </Button>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {transitions
          .filter((to) => to !== 'booked' && to !== 'cancelled')
          .map((to) => (
            <Button key={to} variant="secondary" disabled={pending} onClick={() => doTransition(to)}>
              {ACTION_LABEL_TH[to] ?? CASE_STATUS_LABEL_TH[to]}
            </Button>
          ))}

        {transitions.includes('cancelled') &&
          (confirmCancel ? (
            <div className="flex gap-2">
              <Button variant="danger" disabled={pending} onClick={() => doTransition('cancelled')}>
                ยืนยันยกเลิก
              </Button>
              <Button variant="secondary" onClick={() => setConfirmCancel(false)}>
                ไม่ยกเลิก
              </Button>
            </div>
          ) : (
            <Button variant="secondary" onClick={() => setConfirmCancel(true)}>
              ยกเลิก
            </Button>
          ))}
      </div>
    </section>
  )
}
