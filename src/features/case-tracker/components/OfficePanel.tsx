import type { Agency, Office } from '@/lib/contracts'
import { Card } from '@/components/ui/Card'
import { ExternalLink } from '@/components/ui/ExternalLink'
import { directionsUrl } from '@/lib/maps/urls'
import { tel } from '@/lib/routes'
import { bangkokDate } from '@/lib/catalog/staleness'
import { openSlots } from '@/lib/catalog/hours'

export type OfficePanelProps = {
  office: Office
  agency: Agency | null
}

function todaySlotsTh(office: Office, agency: Agency | null): string {
  const today = bangkokDate(new Date())
  const slots = openSlots(office, agency?.kind ?? 'other', today, [])
  if (slots.length === 0) return 'ปิดทำการวันนี้'
  return slots.map((s) => `${s.open}–${s.close}`).join(', ')
}

export function OfficePanel({ office, agency }: OfficePanelProps) {
  const dest = office.googlePlaceId
    ? { placeId: office.googlePlaceId, name: office.nameTh }
    : office.location
  const mapsHref = directionsUrl({ destination: dest, travelMode: 'TRANSIT' })

  return (
    <Card title="สำนักงาน">
      <div className="space-y-1 text-base">
        <p className="font-semibold">{office.nameTh}</p>
        <p className="text-gray-700">{office.addressTh}</p>
        {office.nearestStationTh && (
          <p className="text-sm text-gray-600">สถานีใกล้สุด: {office.nearestStationTh}</p>
        )}
        <p className="text-sm text-gray-600">เวลาทำการวันนี้: {todaySlotsTh(office, agency)}</p>
        {office.phone && (
          <p>
            <a href={tel(office.phone)} className="text-blue-800 underline">
              {office.phone}
            </a>
          </p>
        )}
        <div className="pt-1">
          <ExternalLink href={mapsHref}>นำทางใน Google Maps</ExternalLink>
        </div>
      </div>
    </Card>
  )
}
