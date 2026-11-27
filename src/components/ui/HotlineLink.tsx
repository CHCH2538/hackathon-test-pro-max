import type { Hotline } from '@/lib/contracts'
import { tel } from '@/lib/routes'

export type HotlineLinkProps = {
  number: Hotline
  labelTh: string
}

export function HotlineLink({ number, labelTh }: HotlineLinkProps) {
  return (
    <a
      href={tel(number)}
      aria-label={`โทร ${number} ${labelTh}`}
      className="inline-flex min-h-12 min-w-12 items-center gap-2 rounded-lg border-2 border-red-700 bg-white px-4 font-semibold text-red-800 no-underline hover:bg-red-50 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-blue-950 focus-visible:outline-solid"
    >
      <span className="text-lg font-bold">{number}</span>
      <span>{labelTh}</span>
    </a>
  )
}
