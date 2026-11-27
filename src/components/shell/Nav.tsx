import Link from 'next/link'
import { NAV_ITEMS } from '@/lib/routes'

type NavItem = (typeof NAV_ITEMS)[number]

const WAVE_LABELS: Record<number, string> = {
  0: 'สำหรับทีมพัฒนา',
  1: 'ระยะที่ 1',
  2: 'ระยะที่ 2',
  3: 'ระยะที่ 3',
  4: 'ระยะที่ 4 (Phase 2)',
}

function groupByWave(items: readonly NavItem[]): [number, NavItem[]][] {
  const groups = new Map<number, NavItem[]>()
  for (const item of items) {
    const group = groups.get(item.wave)
    if (group) group.push(item)
    else groups.set(item.wave, [item])
  }
  const ordered = [...groups.entries()].filter(([wave]) => wave !== 0).sort(([a], [b]) => a - b)
  const dev = groups.get(0)
  return dev ? [...ordered, [0, dev]] : ordered
}

const FOCUS_RING =
  'focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-blue-950 focus-visible:outline-solid'

export function Nav() {
  const groups = groupByWave(NAV_ITEMS)
  return (
    <nav aria-label="เมนูหลัก">
      <details className="relative">
        <summary
          className={`inline-flex min-h-12 min-w-12 cursor-pointer list-none items-center justify-center gap-2 rounded-lg border-2 border-blue-700 bg-white px-4 font-semibold text-blue-800 hover:bg-blue-50 [&::-webkit-details-marker]:hidden ${FOCUS_RING}`}
        >
          <span aria-hidden="true">☰</span>
          เมนู
        </summary>
        <div className="absolute right-0 z-50 mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-lg border-2 border-slate-300 bg-white p-2 shadow-lg">
          {groups.map(([wave, items]) => (
            <section key={wave} aria-labelledby={`nav-wave-${wave}`} className="py-1">
              <h2 id={`nav-wave-${wave}`} className="px-3 py-1 text-sm font-semibold text-slate-700">
                {WAVE_LABELS[wave] ?? `ระยะที่ ${wave}`}
              </h2>
              <ul>
                {items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex min-h-12 items-center rounded-md px-3 text-base text-slate-900 no-underline hover:bg-blue-50 ${FOCUS_RING}`}
                    >
                      {item.labelTh}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </details>
    </nav>
  )
}
