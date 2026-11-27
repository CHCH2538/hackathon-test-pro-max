import type { Metadata } from 'next'
import Link from 'next/link'
import { Chip } from '@/components/ui'
import { SPECS, api } from '@/lib/routes'

export const metadata: Metadata = {
  title: 'สถานะสเปก (dev)',
  robots: { index: false },
}

export default function DevPage() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4 p-4">
      <h1 className="text-2xl font-bold">สถานะสเปก (dev)</h1>
      <p>
        <a href={api.health} className="font-semibold text-blue-800 underline">
          {api.health}
        </a>
      </p>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b-2 border-gray-400">
              <th scope="col" className="p-2">
                Spec
              </th>
              <th scope="col" className="p-2">
                Jira
              </th>
              <th scope="col" className="p-2">
                Wave
              </th>
              <th scope="col" className="p-2">
                Executor
              </th>
              <th scope="col" className="p-2">
                Owns
              </th>
              <th scope="col" className="p-2">
                Page
              </th>
            </tr>
          </thead>
          <tbody>
            {SPECS.map((s) => (
              <tr key={s.id} className="border-b border-gray-300 align-top">
                <th scope="row" className="p-2 font-mono">
                  {s.id}
                  {s.phase2 ? (
                    <span className="ml-2">
                      <Chip tone="warn">Phase 2</Chip>
                    </span>
                  ) : null}
                </th>
                <td className="p-2">{s.jira}</td>
                <td className="p-2">{s.wave}</td>
                <td className="p-2">{s.executor}</td>
                <td className="p-2">
                  <ul className="font-mono text-xs">
                    {s.owns.map((path) => (
                      <li key={path}>{path}</li>
                    ))}
                  </ul>
                </td>
                <td className="p-2">
                  {s.href ? (
                    <Link href={s.href} className="font-semibold text-blue-800 underline">
                      {s.href}
                    </Link>
                  ) : (
                    '—'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
