import { notFound } from 'next/navigation'
import { SlicePlaceholder } from '@/components/shell/SlicePlaceholder'
import { getCaseByToken } from '@/lib/case'
import { CASE_STATUS_LABEL_TH } from '@/lib/contracts'

export const dynamic = 'force-dynamic'

export default async function PlanPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const view = await getCaseByToken(token)
  if (!view) notFound()
  return (
    <SlicePlaceholder
      spec="12-office-finder"
      probe={`${CASE_STATUS_LABEL_TH[view.status]} · ${view.office?.nameTh ?? '—'}`}
    />
  )
}
