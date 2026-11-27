import type React from 'react'

export type ChipTone = 'neutral' | 'info' | 'warn' | 'danger'

export type ChipProps = {
  tone?: ChipTone
  children: React.ReactNode
}

const TONE_CLASSES: Record<ChipTone, string> = {
  neutral: 'border-gray-400 bg-gray-100 text-gray-800',
  info: 'border-blue-300 bg-blue-50 text-blue-800',
  warn: 'border-amber-400 bg-amber-100 text-amber-900',
  danger: 'border-red-300 bg-red-50 text-red-800',
}

export function Chip({ tone = 'neutral', children }: ChipProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-3 py-0.5 text-sm font-medium ${TONE_CLASSES[tone]}`}
    >
      {children}
    </span>
  )
}
