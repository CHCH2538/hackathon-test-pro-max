import { notFound } from 'next/navigation'
import { SlicePlaceholder } from '@/components/shell/SlicePlaceholder'
import { getCaseByToken } from '@/lib/case'
import { CASE_STATUS_LABEL_TH } from '@/lib/contracts'

export default async function CasePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const view = await getCaseByToken(token)
  if (!view) notFound()
  return (
    <SlicePlaceholder
      spec="13-case-tracker"
      probe={
        <>
          {CASE_STATUS_LABEL_TH[view.status]} · checklist {view.checklist.length}
        </>
      }
    />
  )
}
