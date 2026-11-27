import { buttonClasses } from '@/components/ui/Button'
import { hotlines, tel } from '@/lib/routes'

export type EmergencyBarProps = { variant?: 'bar' | 'inline' }

const EMERGENCY_NUMBERS = [
  { number: hotlines.police, labelTh: 'เหตุด่วนเหตุร้าย' },
  { number: hotlines.ems, labelTh: 'เจ็บป่วยฉุกเฉิน' },
] as const

const CONTAINER_CLASSES: Record<NonNullable<EmergencyBarProps['variant']>, string> = {
  bar: 'sticky bottom-0 z-40 w-full border-t-2 border-red-700 bg-white px-4 py-2',
  inline: 'w-full rounded-lg border-2 border-red-700 bg-red-50 p-3',
}

export function EmergencyBar({ variant = 'bar' }: EmergencyBarProps) {
  return (
    <nav aria-label="เบอร์ฉุกเฉิน" className={CONTAINER_CLASSES[variant]}>
      <ul className="mx-auto grid max-w-3xl grid-cols-2 gap-2">
        {EMERGENCY_NUMBERS.map(({ number, labelTh }) => (
          <li key={number}>
            <a href={tel(number)} className={`${buttonClasses('danger', 'lg')} w-full`}>
              <span className="text-xl font-bold">{number}</span>
              <span>{labelTh}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
