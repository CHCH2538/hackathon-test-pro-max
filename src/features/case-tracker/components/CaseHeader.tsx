import type { CaseStatus, IsoDateTime } from '@/lib/contracts'
import { CASE_STATUS_LABEL_TH } from '@/lib/contracts'
import { Chip } from '@/components/ui/Chip'

const STATUS_TONE: Record<CaseStatus, 'neutral' | 'info' | 'warn' | 'danger'> = {
  planned: 'neutral',
  booked: 'info',
  due: 'warn',
  done: 'info',
  postponed: 'warn',
  cancelled: 'danger',
}

const THAI_DATETIME = new Intl.DateTimeFormat('th-TH', {
  dateStyle: 'long',
  timeStyle: 'short',
  timeZone: 'Asia/Bangkok',
})

function thaiDateTime(iso: IsoDateTime): string {
  try {
    return THAI_DATETIME.format(new Date(iso))
  } catch {
    return iso
  }
}

function thaiTime(iso: IsoDateTime): string {
  try {
    return new Intl.DateTimeFormat('th-TH', { timeStyle: 'short', timeZone: 'Asia/Bangkok' }).format(
      new Date(iso),
    )
  } catch {
    return iso
  }
}

export type CaseHeaderProps = {
  titleTh: string
  status: CaseStatus
  appointmentAt: IsoDateTime | null
  departAt: IsoDateTime | null
}

export function CaseHeader({ titleTh, status, appointmentAt, departAt }: CaseHeaderProps) {
  return (
    <div className="mb-4 space-y-2">
      <h1 className="text-2xl font-bold text-gray-900">{titleTh}</h1>
      <div className="flex flex-wrap items-center gap-2">
        <Chip tone={STATUS_TONE[status]}>{CASE_STATUS_LABEL_TH[status]}</Chip>
        {appointmentAt && (
          <span className="text-sm text-gray-700">
            นัด <time dateTime={appointmentAt}>{thaiDateTime(appointmentAt)}</time>
          </span>
        )}
      </div>
      {departAt && (
        <p className="text-sm font-semibold text-blue-800">
          ควรออกจากบ้าน <time dateTime={departAt}>{thaiTime(departAt)} น.</time>
        </p>
      )}
    </div>
  )
}
