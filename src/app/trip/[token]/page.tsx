import { notFound } from 'next/navigation'
import { SlicePlaceholder } from '@/components/shell/SlicePlaceholder'
import { getCaseByToken } from '@/lib/case'

export const dynamic = 'force-dynamic'

export default async function TripPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const view = await getCaseByToken(token)
  if (!view) notFound()
  return <SlicePlaceholder spec="22-route-timing" probe={view.departAt ?? '—'} />
}
