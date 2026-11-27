import type { CaseView } from '@/lib/contracts'
import { Card } from '@/components/ui/Card'
import { ExternalLink } from '@/components/ui/ExternalLink'
import { HotlineLink } from '@/components/ui/HotlineLink'

export type OnlinePanelProps = {
  services: CaseView['services']
}

export function OnlinePanel({ services }: OnlinePanelProps) {
  return (
    <Card title="ทำออนไลน์ได้เลย">
      <p className="mb-3 text-base text-gray-800">เรื่องนี้ทำออนไลน์จบได้ ไม่ต้องเดินทาง</p>
      <div className="space-y-3">
        {services
          .filter((s) => s.canCompleteOnline && s.onlineChannelUrl)
          .map((s) => (
            <div key={s.id}>
              <ExternalLink href={s.onlineChannelUrl}>{s.onlineChannelNameTh ?? s.nameTh}</ExternalLink>
            </div>
          ))}
        {services
          .filter((s) => s.hotline)
          .map((s) => (
            <HotlineLink key={s.id} number={s.hotline!} labelTh={s.nameTh} />
          ))}
      </div>
    </Card>
  )
}
