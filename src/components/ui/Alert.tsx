import type React from 'react'

export type AlertTone = 'info' | 'warn' | 'danger'

export type AlertProps = {
  tone: AlertTone
  titleTh?: string
  children: React.ReactNode
}

const TONE_CLASSES: Record<AlertTone, string> = {
  info: 'border-blue-700 bg-blue-50 text-blue-900',
  warn: 'border-amber-600 bg-amber-50 text-amber-950',
  danger: 'border-red-700 bg-red-50 text-red-900',
}

export function Alert({ tone, titleTh, children }: AlertProps) {
  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      className={`rounded-lg border-l-4 p-4 text-base ${TONE_CLASSES[tone]}`}
    >
      {titleTh ? <p className="mb-1 font-bold">{titleTh}</p> : null}
      <div>{children}</div>
    </div>
  )
}
