import type React from 'react'
import { safeHref } from '@/lib/security/links'

export type ExternalLinkProps = {
  href: string | null | undefined
  children: React.ReactNode
}

export function ExternalLink({ href, children }: ExternalLinkProps) {
  const safe = safeHref(href)
  if (!safe) return <span>{children}</span>
  return (
    <a
      href={safe}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex min-h-12 items-center gap-1 font-medium text-blue-800 underline underline-offset-2 hover:text-blue-950 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-blue-950 focus-visible:outline-solid"
    >
      {children}
      <span className="sr-only">(เปิดในแท็บใหม่)</span>
    </a>
  )
}
