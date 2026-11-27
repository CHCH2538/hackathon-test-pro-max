import type React from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'danger'
export type ButtonSize = 'md' | 'lg'

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'border-blue-700 bg-blue-700 text-white hover:border-blue-800 hover:bg-blue-800',
  secondary: 'border-blue-700 bg-white text-blue-800 hover:bg-blue-50',
  danger: 'border-red-700 bg-red-700 text-white hover:border-red-800 hover:bg-red-800',
}

const SIZE_CLASSES: Record<ButtonSize, string> = {
  md: 'min-h-12 px-4 text-base',
  lg: 'min-h-14 px-6 text-lg',
}

const FOCUS_RING =
  'focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-blue-950 focus-visible:outline-solid'

export function buttonClasses(variant: ButtonVariant = 'primary', size: ButtonSize = 'md'): string {
  return [
    'inline-flex min-w-12 items-center justify-center gap-2 rounded-lg border-2 font-semibold no-underline transition-colors',
    'disabled:cursor-not-allowed disabled:opacity-60',
    FOCUS_RING,
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
  ].join(' ')
}

export function Button({ variant, size, className, type = 'button', ...rest }: ButtonProps) {
  const classes = className ? `${buttonClasses(variant, size)} ${className}` : buttonClasses(variant, size)
  return <button type={type} className={classes} {...rest} />
}
