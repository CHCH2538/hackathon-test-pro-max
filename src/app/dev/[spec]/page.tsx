import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SlicePlaceholder } from '@/components/shell/SlicePlaceholder'
import { SPECS } from '@/lib/routes'

export const metadata: Metadata = { robots: { index: false } }

export function generateStaticParams(): { spec: string }[] {
  return SPECS.map((s) => ({ spec: s.id }))
}

export default async function DevSpecPage({ params }: { params: Promise<{ spec: string }> }) {
  const { spec } = await params
  const info = SPECS.find((s) => s.id === spec)
  if (!info) notFound()
  return <SlicePlaceholder spec={info.id} />
}
