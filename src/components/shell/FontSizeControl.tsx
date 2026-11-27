'use client'

import { useSyncExternalStore } from 'react'

const SCALES = ['100', '125', '150'] as const
type FontScale = (typeof SCALES)[number]

const LABELS: Record<FontScale, string> = {
  '100': 'ขนาดปกติ',
  '125': 'ขนาดใหญ่',
  '150': 'ขนาดใหญ่มาก',
}

const GLYPH_CLASSES: Record<FontScale, string> = {
  '100': 'text-base',
  '125': 'text-lg',
  '150': 'text-xl',
}

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365

function isScale(v: string | undefined): v is FontScale {
  return v !== undefined && (SCALES as readonly string[]).includes(v)
}

function subscribe(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-font-scale'] })
  return () => observer.disconnect()
}

function getSnapshot(): FontScale {
  const v = document.documentElement.dataset.fontScale
  return isScale(v) ? v : '100'
}

function getServerSnapshot(): FontScale {
  return '100'
}

function applyScale(scale: FontScale): void {
  document.documentElement.dataset.fontScale = scale
  const secure = window.location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `bf_fs=${scale}; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax${secure}`
}

export function FontSizeControl() {
  const current = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  return (
    <div role="group" aria-label="ขนาดตัวอักษร" className="flex items-center gap-1">
      {SCALES.map((scale) => {
        const active = scale === current
        return (
          <button
            key={scale}
            type="button"
            aria-pressed={active}
            aria-label={LABELS[scale]}
            title={LABELS[scale]}
            onClick={() => applyScale(scale)}
            className={[
              'inline-flex min-h-12 min-w-12 items-center justify-center rounded-lg border-2 font-bold',
              'focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-blue-950 focus-visible:outline-solid',
              active
                ? 'border-blue-700 bg-blue-700 text-white'
                : 'border-blue-700 bg-white text-blue-800 hover:bg-blue-50',
              GLYPH_CLASSES[scale],
            ].join(' ')}
          >
            ก
          </button>
        )
      })}
    </div>
  )
}
