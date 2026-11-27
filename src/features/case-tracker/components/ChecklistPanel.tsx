'use client'

import { useState, useOptimistic, useTransition } from 'react'
import type { ChecklistItem, CaseToken, RequirementKind, ServiceId } from '@/lib/contracts'
import { Checkbox } from '@/components/ui/Checkbox'
import { SourceBadge } from '@/components/ui/SourceBadge'
import { StaleBadge } from '@/components/ui/StaleBadge'
import { KIND_HEADING_TH, KIND_ORDER } from '../labels'
import { api, routes } from '@/lib/routes'
import type { ReportQuery } from '@/lib/routes'

type ServiceGroup = {
  serviceId: ServiceId
  sourceUrl: string
  lastVerified: string
  items: ChecklistItem[]
}

type KindGroup = {
  kind: RequirementKind
  services: ServiceGroup[]
}

function groupItems(items: ChecklistItem[]): KindGroup[] {
  const result: KindGroup[] = []
  for (const kind of KIND_ORDER) {
    const kindItems = items.filter((i) => i.kind === kind)
    if (kindItems.length === 0) continue

    const serviceMap = new Map<ServiceId, ServiceGroup>()
    for (const item of kindItems) {
      let g = serviceMap.get(item.serviceId)
      if (!g) {
        g = { serviceId: item.serviceId, sourceUrl: item.sourceUrl, lastVerified: item.lastVerified, items: [] }
        serviceMap.set(item.serviceId, g)
      }
      g.items.push(item)
    }
    result.push({ kind, services: [...serviceMap.values()] })
  }
  return result
}

export type ChecklistPanelProps = {
  items: ChecklistItem[]
  token: CaseToken
}

export function ChecklistPanel({ items, token }: ChecklistPanelProps) {
  const [localItems, setLocalItems] = useState<ChecklistItem[]>(items)
  const [optimisticItems, applyOptimistic] = useOptimistic(localItems, (prev, { id, checked }: { id: string; checked: boolean }) =>
    prev.map((i) => (i.id === id ? { ...i, checked } : i)),
  )
  const [, startTransition] = useTransition()

  const checkedCount = optimisticItems.filter((i) => i.checked).length
  const groups = groupItems(optimisticItems)

  async function tick(item: ChecklistItem, checked: boolean) {
    startTransition(async () => {
      applyOptimistic({ id: item.id, checked })
      try {
        const res = await fetch(api.case, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'tick', token, itemId: item.id, checked }),
        })
        if (res.ok) {
          const data = (await res.json()) as { item: ChecklistItem }
          setLocalItems((prev) => prev.map((i) => (i.id === data.item.id ? data.item : i)))
        } else {
          setLocalItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, checked: !checked } : i)))
        }
      } catch {
        setLocalItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, checked: !checked } : i)))
      }
    })
  }

  return (
    <section aria-label="Checklist" className="space-y-5">
      <p className="text-sm font-medium text-gray-700">
        เตรียมแล้ว {checkedCount}/{optimisticItems.length}
      </p>
      {groups.map(({ kind, services }) => (
        <div key={kind}>
          <h2 className="mb-2 text-base font-bold text-gray-800">{KIND_HEADING_TH[kind]}</h2>
          {services.map((sg) => (
            <div key={sg.serviceId} className="mb-3 space-y-1">
              {sg.items.map((item) => (
                <div key={item.id}>
                  {item.conditionStatus === 'unknown' && item.conditionLabelTh ? (
                    <p className="ml-2 text-sm text-gray-500">ถ้า{item.conditionLabelTh}</p>
                  ) : null}
                  <Checkbox checked={item.checked} onChange={(c) => tick(item, c)} labelTh={item.textTh} />
                  <div className="ml-2 mt-0.5">
                    <a
                      href={routes.report({ serviceId: sg.serviceId, requirementId: item.requirementId ?? undefined } as ReportQuery)}
                      className="text-xs text-gray-500 underline hover:text-gray-700"
                    >
                      ข้อมูลนี้ไม่ตรง
                    </a>
                  </div>
                </div>
              ))}
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <SourceBadge sourceUrl={sg.sourceUrl} lastVerified={sg.lastVerified} />
                <StaleBadge lastVerified={sg.lastVerified} />
              </div>
            </div>
          ))}
        </div>
      ))}
    </section>
  )
}
