import Link from 'next/link'
import { routes } from '@/lib/routes'
import { FontSizeControl } from './FontSizeControl'
import { Nav } from './Nav'

export function Header() {
  return (
    <header className="border-b-2 border-slate-200 bg-white">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-2 px-4 py-2">
        <Link
          href={routes.home}
          className="flex min-h-12 flex-col justify-center rounded-md text-slate-900 no-underline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-blue-950 focus-visible:outline-solid"
        >
          <span className="text-lg font-bold leading-tight">Bangkok Flow</span>
          <span className="text-sm leading-tight text-slate-700">ผู้ช่วยบริการรัฐแบบแชท</span>
        </Link>
        <div className="flex items-center gap-2">
          <FontSizeControl />
          <Nav />
        </div>
      </div>
    </header>
  )
}
