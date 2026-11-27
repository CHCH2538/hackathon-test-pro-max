import { Card } from '@/components/ui/Card'
import type { TimeSaved } from '../timeSaved'

export type TimeSavedCardProps = {
  timeSaved: TimeSaved
}

export function TimeSavedCard({ timeSaved }: TimeSavedCardProps) {
  const hours = Math.floor(timeSaved.minutes / 60)
  const mins = timeSaved.minutes % 60

  const display = hours > 0 ? `${hours} ชม. ${mins} นาที` : `${mins} นาที`

  return (
    <Card title="เวลาที่ประหยัดได้">
      <p className="text-2xl font-bold text-green-700">ประมาณ {display}</p>
      <p className="mt-1 text-sm text-gray-600">{timeSaved.basisTh}</p>
      <p className="mt-1 text-xs text-gray-500">* เป็นการประมาณการณ์เท่านั้น</p>
    </Card>
  )
}
