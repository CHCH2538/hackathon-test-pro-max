import type { LatLng, TravelMode } from '../contracts'

const URL_TRAVEL_MODES: Record<TravelMode, string> = {
  TRANSIT: 'transit',
  DRIVE: 'driving',
  TWO_WHEELER: 'two-wheeler',
  WALK: 'walking',
}

export function directionsUrl(p: {
  destination: LatLng | { placeId: string; name: string }
  travelMode?: TravelMode
}): string {
  const q = new URLSearchParams({ api: '1' })
  if ('placeId' in p.destination) {
    q.set('destination', p.destination.name)
    q.set('destination_place_id', p.destination.placeId)
  } else {
    q.set('destination', `${p.destination.lat},${p.destination.lng}`)
  }
  if (p.travelMode) q.set('travelmode', URL_TRAVEL_MODES[p.travelMode])
  return `https://www.google.com/maps/dir/?${q.toString()}`
}

export function searchUrl(p: { query: string; placeId?: string }): string {
  const q = new URLSearchParams({ api: '1', query: p.query })
  if (p.placeId) q.set('query_place_id', p.placeId)
  return `https://www.google.com/maps/search/?${q.toString()}`
}
