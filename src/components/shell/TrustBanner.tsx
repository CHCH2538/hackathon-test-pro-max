import { NOT_GOV_SITE_TH, NOT_POLICE_CHANNEL_TH, NO_MONEY_NO_PASSWORD_TH } from '@/lib/ai/disclaimers'

export function TrustBanner() {
  return (
    <aside
      aria-label="ข้อควรทราบ"
      className="w-full border-b-2 border-amber-600 bg-amber-50 px-4 py-2 text-amber-950"
    >
      <ul className="mx-auto flex max-w-3xl flex-col gap-1 text-base font-semibold sm:flex-row sm:flex-wrap sm:gap-x-4">
        <li>{NOT_GOV_SITE_TH}</li>
        <li>{NOT_POLICE_CHANNEL_TH}</li>
        <li>{NO_MONEY_NO_PASSWORD_TH}</li>
      </ul>
    </aside>
  )
}
