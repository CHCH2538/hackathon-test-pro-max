'use client'

import { useState } from 'react'
import type { CaseToken } from '@/lib/contracts'
import { LinkButton } from '@/components/ui/LinkButton'
import { Button } from '@/components/ui/Button'
import { routes } from '@/lib/routes'

export type NextLinksProps = {
  token: CaseToken
  hasOffice: boolean
  onlineOnly: boolean
  lineLinked: boolean
  caseUrl: string
}

export function NextLinks({ token, hasOffice, onlineOnly, lineLinked, caseUrl }: NextLinksProps) {
  const [copied, setCopied] = useState(false)

  async function copyLink() {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: 'แผนของฉัน', url: caseUrl })
        return
      } catch {}
    }
    await navigator.clipboard.writeText(caseUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-wrap gap-2">
      {!onlineOnly && (
        <LinkButton href={routes.plan(token)} variant="secondary">
          เลือกสำนักงาน / จุดเกิดเหตุ
        </LinkButton>
      )}
      {hasOffice && (
        <LinkButton href={routes.trip(token)} variant="secondary">
          ดูเส้นทางและเวลาออกจากบ้าน
        </LinkButton>
      )}
      {lineLinked ? (
        <span className="inline-flex min-h-12 items-center rounded-lg border-2 border-gray-300 px-4 text-sm text-gray-500">
          ผูก LINE แล้ว
        </span>
      ) : (
        <LinkButton href={routes.lineLink(token)} variant="secondary">
          ส่งเข้า LINE
        </LinkButton>
      )}
      <Button variant="secondary" onClick={copyLink}>
        {copied ? 'คัดลอกแล้ว!' : 'คัดลอกลิงก์'}
      </Button>
      <p className="w-full text-xs text-gray-500">เก็บลิงก์นี้ไว้เพื่อเปิดดูภายหลัง (ไม่ต้องสมัคร)</p>
    </div>
  )
}
