import 'server-only'
import { createHmac } from 'node:crypto'
import type { IsoDateTime, LatLng, MapsResult, TravelMode } from '../contracts'
import { log } from '../security/log'
import { BANGKOK_BOUNDS, FIELD_MASKS } from './fieldMasks'

const ENDPOINTS = {
  computeRoutes: 'https://routes.googleapis.com/directions/v2:computeRoutes',
  computeRouteMatrix: 'https://routes.googleapis.com/distanceMatrix/v2:computeRouteMatrix',
  autocomplete: 'https://places.googleapis.com/v1/places:autocomplete',
  placeDetails: 'https://places.googleapis.com/v1/places/',
  searchText: 'https://places.googleapis.com/v1/places:searchText',
  staticMap: 'https://maps.googleapis.com/maps/api/staticmap',
} as const

const ALLOWED_HOSTS: readonly string[] = ['routes.googleapis.com', 'places.googleapis.com']
const GEOCODE_FIELD_MASK = 'places.id,places.location'
const DEFAULT_TIMEOUT_MS = 4000
const PLACE_ID_RE = /^[A-Za-z0-9_-]{1,256}$/
const SESSION_TOKEN_RE = /^[A-Za-z0-9_-]{1,128}$/

export type RoutingPreference = 'TRAFFIC_UNAWARE' | 'TRAFFIC_AWARE' | 'TRAFFIC_AWARE_OPTIMAL'
export type Waypoint = LatLng | { placeId: string }
export type ComputeRoutesRequest = {
  origin: Waypoint
  destination: Waypoint
  travelMode: TravelMode
  routingPreference?: RoutingPreference
  departureTime?: IsoDateTime
  arrivalTime?: IsoDateTime
}
export type ComputeRoutesResponse = {
  routes?: Array<{
    duration?: string
    distanceMeters?: number
    polyline?: { encodedPolyline?: string }
    legs?: Array<{ duration?: string; steps?: Array<{ transitDetails?: unknown }> }>
  }>
}
export type RouteMatrixRequest = {
  origins: readonly Waypoint[]
  destinations: readonly Waypoint[]
  travelMode: TravelMode
  routingPreference?: RoutingPreference
  departureTime?: IsoDateTime
}
export type RouteMatrixElement = {
  originIndex: number
  destinationIndex: number
  duration?: string
  distanceMeters?: number
  condition?: string
}
export type PlaceSuggestion = { placeId: string; text: string }
export type PlaceDetails = { id: string; displayName: string; location: LatLng; formattedAddress: string }

type GoogleLatLng = { latitude: number; longitude: number }

function timeoutFromEnv(): number {
  const n = Number(process.env.MAPS_TIMEOUT_MS)
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_TIMEOUT_MS
}

function isAllowedEndpoint(url: string): boolean {
  try {
    const u = new URL(url)
    return u.protocol === 'https:' && ALLOWED_HOSTS.includes(u.host)
  } catch {
    return false
  }
}

function isResourceExhausted(json: unknown): boolean {
  if (typeof json !== 'object' || json === null) return false
  const err = (json as { error?: { status?: unknown } }).error
  return err?.status === 'RESOURCE_EXHAUSTED'
}

export async function mapsFetch<T>(
  url: string,
  body: unknown,
  fieldMask: string,
  opts: { timeoutMs?: number; purpose?: string } = {},
): Promise<MapsResult<T>> {
  const r = await mapsFetchOnce<T>(url, body, fieldMask, opts)
  log.info('maps_call', { purpose: opts.purpose ?? 'unknown', outcome: r.ok ? 'ok' : r.reason })
  return r
}

async function mapsFetchOnce<T>(
  url: string,
  body: unknown,
  fieldMask: string,
  opts: { timeoutMs?: number },
): Promise<MapsResult<T>> {
  if (fieldMask.trim() === '' || !isAllowedEndpoint(url)) return { ok: false, reason: 'bad_request' }
  const key = process.env.GOOGLE_MAPS_SERVER_KEY
  if (!key) return { ok: false, reason: 'not_configured' }
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? timeoutFromEnv())
  try {
    const res = await fetch(url, {
      method: body === undefined ? 'GET' : 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': key,
        'X-Goog-FieldMask': fieldMask,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
      cache: 'no-store',
    })
    const json: unknown = await res.json().catch(() => null)
    if (res.ok) return json === null ? { ok: false, reason: 'upstream' } : { ok: true, data: json as T }
    if (res.status === 429 || isResourceExhausted(json)) return { ok: false, reason: 'quota' }
    if (res.status >= 500) return { ok: false, reason: 'upstream' }
    return { ok: false, reason: 'bad_request' }
  } catch {
    return { ok: false, reason: controller.signal.aborted ? 'timeout' : 'upstream' }
  } finally {
    clearTimeout(timer)
  }
}

function toWaypoint(w: Waypoint) {
  return 'placeId' in w
    ? { placeId: w.placeId }
    : { location: { latLng: { latitude: w.lat, longitude: w.lng } } }
}

function bangkokRectangle() {
  return {
    rectangle: {
      low: { latitude: BANGKOK_BOUNDS.south, longitude: BANGKOK_BOUNDS.west },
      high: { latitude: BANGKOK_BOUNDS.north, longitude: BANGKOK_BOUNDS.east },
    },
  }
}

export function computeRoutes(
  req: ComputeRoutesRequest,
  fieldMask: string = FIELD_MASKS.routes,
): Promise<MapsResult<ComputeRoutesResponse>> {
  return mapsFetch<ComputeRoutesResponse>(
    ENDPOINTS.computeRoutes,
    {
      origin: toWaypoint(req.origin),
      destination: toWaypoint(req.destination),
      travelMode: req.travelMode,
      routingPreference: req.routingPreference,
      departureTime: req.departureTime,
      arrivalTime: req.arrivalTime,
      languageCode: 'th',
      regionCode: 'th',
    },
    fieldMask,
    { purpose: 'computeRoutes' },
  )
}

export async function computeRouteMatrix(
  req: RouteMatrixRequest,
  fieldMask: string = FIELD_MASKS.matrix,
): Promise<MapsResult<RouteMatrixElement[]>> {
  const r = await mapsFetch<RouteMatrixElement[]>(
    ENDPOINTS.computeRouteMatrix,
    {
      origins: req.origins.map((w) => ({ waypoint: toWaypoint(w) })),
      destinations: req.destinations.map((w) => ({ waypoint: toWaypoint(w) })),
      travelMode: req.travelMode,
      routingPreference: req.routingPreference,
      departureTime: req.departureTime,
      languageCode: 'th',
      regionCode: 'th',
    },
    fieldMask,
    { purpose: 'computeRouteMatrix' },
  )
  if (!r.ok) return r
  return Array.isArray(r.data) ? r : { ok: false, reason: 'upstream' }
}

export async function autocomplete(
  input: string,
  sessionToken: string,
): Promise<MapsResult<PlaceSuggestion[]>> {
  const text = input.trim()
  if (text === '' || text.length > 200 || !SESSION_TOKEN_RE.test(sessionToken)) {
    return { ok: false, reason: 'bad_request' }
  }
  const r = await mapsFetch<{
    suggestions?: Array<{ placePrediction?: { placeId?: string; text?: { text?: string } } }>
  }>(
    ENDPOINTS.autocomplete,
    {
      input: text,
      sessionToken,
      includedRegionCodes: ['th'],
      regionCode: 'th',
      languageCode: 'th',
      locationRestriction: bangkokRectangle(),
    },
    FIELD_MASKS.autocomplete,
    { purpose: 'autocomplete' },
  )
  if (!r.ok) return r
  const data: PlaceSuggestion[] = []
  for (const s of r.data.suggestions ?? []) {
    const p = s.placePrediction
    if (p?.placeId && p.text?.text) data.push({ placeId: p.placeId, text: p.text.text })
  }
  return { ok: true, data }
}

export async function placeDetails(placeId: string, sessionToken: string): Promise<MapsResult<PlaceDetails>> {
  if (!PLACE_ID_RE.test(placeId) || !SESSION_TOKEN_RE.test(sessionToken)) {
    return { ok: false, reason: 'bad_request' }
  }
  const q = new URLSearchParams({ languageCode: 'th', regionCode: 'th', sessionToken })
  const r = await mapsFetch<{
    id?: string
    displayName?: { text?: string }
    location?: GoogleLatLng
    formattedAddress?: string
  }>(
    `${ENDPOINTS.placeDetails}${encodeURIComponent(placeId)}?${q.toString()}`,
    undefined,
    FIELD_MASKS.placeDetails,
    {
      purpose: 'placeDetails',
    },
  )
  if (!r.ok) return r
  const d = r.data
  if (!d.id || !d.location) return { ok: false, reason: 'upstream' }
  return {
    ok: true,
    data: {
      id: d.id,
      displayName: d.displayName?.text ?? '',
      location: { lat: d.location.latitude, lng: d.location.longitude },
      formattedAddress: d.formattedAddress ?? '',
    },
  }
}

export async function geocode(address: string): Promise<MapsResult<{ point: LatLng; placeId: string }>> {
  const text = address.trim()
  if (text === '' || text.length > 300) return { ok: false, reason: 'bad_request' }
  const r = await mapsFetch<{ places?: Array<{ id?: string; location?: GoogleLatLng }> }>(
    ENDPOINTS.searchText,
    {
      textQuery: text,
      regionCode: 'th',
      languageCode: 'th',
      pageSize: 1,
      locationRestriction: bangkokRectangle(),
    },
    GEOCODE_FIELD_MASK,
    { purpose: 'geocode' },
  )
  if (!r.ok) return r
  const p = r.data.places?.[0]
  if (!p?.id || !p.location) return { ok: false, reason: 'bad_request' }
  return { ok: true, data: { point: { lat: p.location.latitude, lng: p.location.longitude }, placeId: p.id } }
}

export function staticMapUrl(p: {
  markers: readonly LatLng[]
  path?: string
  size: `${number}x${number}`
}): string {
  const key = process.env.GOOGLE_MAPS_SERVER_KEY
  if (!key) return ''
  const q = new URLSearchParams({ size: p.size, language: 'th', region: 'th' })
  if (p.markers.length > 0) q.set('markers', p.markers.map((m) => `${m.lat},${m.lng}`).join('|'))
  if (p.path) q.set('path', `enc:${p.path}`)
  q.set('key', key)
  const url = `${ENDPOINTS.staticMap}?${q.toString()}`
  const secret = process.env.GOOGLE_MAPS_STATIC_SIGNING_SECRET
  if (!secret) return url
  const u = new URL(url)
  const signature = createHmac('sha1', Buffer.from(secret.replace(/-/g, '+').replace(/_/g, '/'), 'base64'))
    .update(`${u.pathname}${u.search}`)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
  return `${url}&signature=${signature}`
}
