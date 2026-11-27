import type React from 'react'
import { Card, Chip } from '@/components/ui'
import type { SpecId } from '@/lib/contracts'
import { SPECS } from '@/lib/routes'

export type SlicePlaceholderProps = { spec: SpecId; probe?: React.ReactNode }

export function SlicePlaceholder({ spec, probe }: SlicePlaceholderProps) {
  const info = SPECS.find((s) => s.id === spec)
  if (!info) throw new Error(`Unknown spec: ${spec}`)
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 p-4">
      <h1 className="text-2xl font-bold">{info.id}</h1>
      <div className="flex flex-wrap gap-2">
        <Chip tone="info">{info.jira}</Chip>
        <Chip>Wave {info.wave}</Chip>
        <Chip>{info.executor}</Chip>
        {info.phase2 ? <Chip tone="warn">Phase 2</Chip> : null}
      </div>
      <p>หน้านี้ยังเป็นตัวอย่าง (placeholder) รอทีมของสเปกนี้พัฒนาต่อ</p>
      <Card title="โฟลเดอร์ที่สเปกนี้ดูแล">
        <ul className="list-disc pl-6 font-mono text-sm">
          {info.owns.map((path) => (
            <li key={path}>{path}</li>
          ))}
        </ul>
      </Card>
      {probe !== undefined ? (
        <Card title="Probe">
          <div className="font-mono text-sm">{probe}</div>
        </Card>
      ) : null}
    </div>
  )
}
