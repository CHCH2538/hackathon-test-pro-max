'use client'

import { useState, useEffect } from 'react'
import type { CaseStatus, CaseToken, IsoDateTime } from '@/lib/contracts'
import { CASE_STATUS_LABEL_TH } from '@/lib/contracts'
import { isCaseToken } from '@/lib/case/status'
import { routes } from '@/lib/routes'
import Link from 'next/link'

const LS_KEY = 'bf_cases'
const MAX_CASES = 10

export type RecentEntry = {
  token: CaseToken
  titleTh: string
  status: CaseStatus
  savedAt: IsoDateTime
}

function readEntries(): RecentEntry[] {
  if (typeof localStorage === 'undefined') return []
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown[]
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (e): e is RecentEntry =>
        typeof e === 'object' && e !== null && isCaseToken((e as RecentEntry).token),
    )
  } catch {
    return []
  }
}

function writeEntries(entries: RecentEntry[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(entries.slice(0, MAX_CASES)))
  } catch {}
}

export function saveCurrentCase(entry: Omit<RecentEntry, 'savedAt'>) {
  if (typeof localStorage === 'undefined') return
  const entries = readEntries().filter((e) => e.token !== entry.token)
  entries.unshift({ ...entry, savedAt: new Date().toISOString() })
  writeEntries(entries)
}

export type RecentCasesProps = {
  currentToken: CaseToken
}

export function RecentCases({ currentToken }: RecentCasesProps) {
  const [entries, setEntries] = useState<RecentEntry[]>(() =>
    readEntries().filter((e) => e.token !== currentToken),
  )

  function remove(token: CaseToken) {
    const updated = readEntries().filter((e) => e.token !== token)
    writeEntries(updated)
    setEntries(updated.filter((e) => e.token !== currentToken))
  }

  if (entries.length === 0) return null

  return (
    <section aria-label="Case ที่เปิดในเครื่องนี้">
      <h2 className="mb-2 text-base font-bold text-gray-800">Case ที่เปิดในเครื่องนี้</h2>
      <ul className="space-y-1">
        {entries.map((e) => (
          <li key={e.token} className="flex items-center gap-2">
            <Link href={routes.case(e.token)} className="flex-1 text-blue-800 underline text-sm">
              {e.titleTh} ({CASE_STATUS_LABEL_TH[e.status]})
            </Link>
            <button
              onClick={() => remove(e.token)}
              className="text-xs text-gray-400 hover:text-gray-600"
              aria-label={`ลบ ${e.titleTh} ออกจากรายการ`}
            >
              ลบ
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function SaveCurrentCase({ token, titleTh, status }: { token: CaseToken; titleTh: string; status: CaseStatus }) {
  useEffect(() => {
    saveCurrentCase({ token, titleTh, status })
  }, [token, titleTh, status])
  return null
}
