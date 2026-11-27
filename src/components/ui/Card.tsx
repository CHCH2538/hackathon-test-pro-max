import type React from 'react'
import { useId } from 'react'

export type CardProps = {
  title?: string
  children: React.ReactNode
  as?: 'section' | 'article' | 'div'
}

export function Card({ title, children, as: Tag = 'section' }: CardProps) {
  const headingId = useId()
  return (
    <Tag
      aria-labelledby={title ? headingId : undefined}
      className="rounded-xl border border-gray-300 bg-white p-4 text-gray-900 shadow-sm"
    >
      {title ? (
        <h2 id={headingId} className="mb-3 text-lg font-bold">
          {title}
        </h2>
      ) : null}
      {children}
    </Tag>
  )
}
