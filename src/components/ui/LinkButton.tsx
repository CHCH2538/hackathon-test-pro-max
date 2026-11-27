import type React from 'react'
import Link from 'next/link'
import { buttonClasses, type ButtonProps } from './Button'

export type LinkButtonProps = {
  href: string
  variant?: ButtonProps['variant']
  children: React.ReactNode
}

export function LinkButton({ href, variant, children }: LinkButtonProps) {
  return (
    <Link href={href} className={buttonClasses(variant)}>
      {children}
    </Link>
  )
}
