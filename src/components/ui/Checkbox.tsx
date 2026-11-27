'use client'

export type CheckboxProps = {
  checked: boolean
  onChange: (checked: boolean) => void
  labelTh: string
  disabled?: boolean
}

export function Checkbox({ checked, onChange, labelTh, disabled }: CheckboxProps) {
  return (
    <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-base text-gray-900 has-disabled:cursor-not-allowed has-disabled:opacity-60 has-focus-visible:outline-4 has-focus-visible:outline-offset-2 has-focus-visible:outline-blue-950 has-focus-visible:outline-solid">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="size-6 shrink-0 accent-blue-700 focus-visible:outline-none"
      />
      <span>{labelTh}</span>
    </label>
  )
}
