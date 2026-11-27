'use client'

import { useId } from 'react'
import { Button } from './Button'

type ChoiceOption<V> = { value: V; labelTh: string }

type ChoiceButtonsBase<V extends string | boolean> = {
  name: string
  legendTh: string
  options: readonly ChoiceOption<V>[]
  value?: V | null
}

export type ChoiceButtonsProps<V extends string | boolean> = ChoiceButtonsBase<V> &
  ({ allowSkip?: false; onChange: (v: V) => void } | { allowSkip: true; onChange: (v: V | null) => void })

export const SKIP_LABEL_TH = 'ไม่แน่ใจ / ข้าม'

export function ChoiceButtons<V extends string | boolean>(props: ChoiceButtonsProps<V>) {
  const { name, legendTh, options, value } = props
  const groupId = useId()
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-base font-semibold text-gray-900">{legendTh}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option, i) => {
          const id = `${groupId}-${i}`
          return (
            <label
              key={id}
              htmlFor={id}
              className="inline-flex min-h-12 min-w-12 cursor-pointer items-center justify-center rounded-lg border-2 border-blue-700 bg-white px-4 text-base font-semibold text-blue-800 transition-colors hover:bg-blue-50 has-checked:bg-blue-700 has-checked:text-white has-focus-visible:outline-4 has-focus-visible:outline-offset-2 has-focus-visible:outline-blue-950 has-focus-visible:outline-solid"
            >
              <input
                id={id}
                type="radio"
                name={name}
                value={String(i)}
                checked={value !== undefined && value !== null && value === option.value}
                onChange={() => props.onChange(option.value)}
                className="sr-only"
              />
              {option.labelTh}
            </label>
          )
        })}
      </div>
      {props.allowSkip ? (
        <div>
          <Button variant="secondary" onClick={() => props.onChange(null)}>
            {SKIP_LABEL_TH}
          </Button>
        </div>
      ) : null}
    </fieldset>
  )
}
