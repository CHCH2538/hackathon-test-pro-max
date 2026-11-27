import 'server-only'
import type {
  Agency,
  AgencyId,
  AgencyKind,
  Condition,
  Holiday,
  I18nMap,
  IsoDate,
  JurisdictionKind,
  JurisdictionMatch,
  LatLng,
  NearbyOffice,
  Office,
  OfficeId,
  OpeningHours,
  Service,
  ServiceId,
  ServiceLink,
  ServiceRequirement,
  SlotAnswers,
  TriageQuestion,
} from '@/lib/contracts'
import { createCatalogClient } from '@/lib/db/server'
import type { Database, Json } from '@/lib/db/database.types'
import { AppError } from '@/lib/security/errors'
import { LatLngSchema } from '@/lib/security/schemas'
import { evaluateCondition } from './conditions'

type Row<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']

// MARK: mapping
function dbError(cause: unknown): AppError {
  return new AppError('upstream_unavailable', 503, { cause })
}

function i18n(v: Json): I18nMap {
  return (v ?? {}) as I18nMap
}

function condition(v: Json | null): Condition | null {
  return v as unknown as Condition | null
}

function parsePoint(v: unknown): LatLng {
  if (typeof v === 'string' && /^[0-9a-fA-F]{42,}$/.test(v)) {
    const bytes = Buffer.from(v, 'hex')
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
    const le = view.getUint8(0) === 1
    const type = view.getUint32(1, le)
    const offset = type & 0x20000000 ? 9 : 5
    if ((type & 0x0fffffff) === 1 && bytes.byteLength >= offset + 16) {
      return { lng: view.getFloat64(offset, le), lat: view.getFloat64(offset + 8, le) }
    }
  }
  if (typeof v === 'object' && v !== null && 'coordinates' in v) {
    const [lng, lat] = (v as { coordinates: unknown }).coordinates as [unknown, unknown]
    if (typeof lng === 'number' && typeof lat === 'number') return { lat, lng }
  }
  throw new AppError('internal', 500)
}

function validPoint(point: LatLng): LatLng {
  const parsed = LatLngSchema.safeParse(point)
  if (!parsed.success) throw new AppError('bad_request', 400)
  return parsed.data
}

function toAgency(r: Row<'agencies'>): Agency {
  return {
    id: r.id,
    nameTh: r.name_th,
    kind: r.kind,
    hotline: r.hotline,
    websiteUrl: r.website_url,
    published: r.published,
    i18n: i18n(r.i18n),
  }
}

function toOffice(r: Row<'offices'>): Office {
  return {
    id: r.id,
    agencyId: r.agency_id,
    nameTh: r.name_th,
    location: parsePoint(r.location),
    addressTh: r.address_th,
    phone: r.phone,
    openingHours: r.opening_hours as unknown as OpeningHours,
    nearestStationTh: r.nearest_station_th,
    bookingUrl: r.booking_url,
    googlePlaceId: r.google_place_id,
    sourceUrl: r.source_url,
    lastVerified: r.last_verified,
    published: r.published,
    i18n: i18n(r.i18n),
  }
}

function toService(r: Row<'services'>): Service {
  return {
    id: r.id,
    agencyId: r.agency_id,
    nameTh: r.name_th,
    synonyms: r.synonyms,
    examplePhrases: r.example_phrases,
    officeRule: r.office_rule,
    canCompleteOnline: r.can_complete_online,
    onlineChannelNameTh: r.online_channel_name_th,
    onlineChannelUrl: r.online_channel_url,
    feeThb: r.fee_thb,
    feeNoteTh: r.fee_note_th,
    durationMin: r.duration_min,
    hotline: r.hotline,
    triageQuestions: (r.triage_questions ?? []) as unknown as TriageQuestion[],
    sourceUrl: r.source_url,
    lastVerified: r.last_verified,
    published: r.published,
    i18n: i18n(r.i18n),
  }
}

function toRequirement(r: Row<'service_requirements'>): ServiceRequirement {
  return {
    id: r.id,
    serviceId: r.service_id,
    kind: r.kind,
    textTh: r.text_th,
    condition: condition(r.condition),
    conditionLabelTh: r.condition_label_th,
    copyType: r.copy_type,
    copies: r.copies,
    sortOrder: r.sort_order,
    active: r.active,
    i18n: i18n(r.i18n),
  }
}

function toServiceLink(r: Row<'service_links'>): ServiceLink {
  return {
    id: r.id,
    fromServiceId: r.from_service_id,
    toServiceId: r.to_service_id,
    condition: condition(r.condition),
    conditionLabelTh: r.condition_label_th,
    sortOrder: r.sort_order,
    active: r.active,
    i18n: i18n(r.i18n),
  }
}

function toHoliday(r: Row<'holidays'>): Holiday {
  return {
    id: r.id,
    date: r.date,
    nameTh: r.name_th,
    closedAgencyKinds: r.closed_agency_kinds,
    closedOfficeIds: r.closed_office_ids === null ? null : r.closed_office_ids.map(String),
    sourceUrl: r.source_url,
  }
}

// MARK: agencies
export async function listAgencies(): Promise<Agency[]> {
  const { data, error } = await createCatalogClient().from('agencies').select('*').order('id')
  if (error) throw dbError(error)
  return data.map(toAgency)
}

export async function getAgency(id: AgencyId): Promise<Agency | null> {
  const { data, error } = await createCatalogClient().from('agencies').select('*').eq('id', id).maybeSingle()
  if (error) throw dbError(error)
  return data ? toAgency(data) : null
}

// MARK: services
export async function listServices(filter: { agencyId?: AgencyId } = {}): Promise<Service[]> {
  let q = createCatalogClient().from('services').select('*')
  if (filter.agencyId !== undefined) q = q.eq('agency_id', filter.agencyId)
  const { data, error } = await q.order('id')
  if (error) throw dbError(error)
  return data.map(toService)
}

export async function getService(id: ServiceId): Promise<Service | null> {
  const { data, error } = await createCatalogClient().from('services').select('*').eq('id', id).maybeSingle()
  if (error) throw dbError(error)
  return data ? toService(data) : null
}

export async function getServicesByIds(ids: readonly ServiceId[]): Promise<Service[]> {
  if (ids.length === 0) return []
  const { data, error } = await createCatalogClient().from('services').select('*').in('id', [...ids])
  if (error) throw dbError(error)
  const byId = new Map(data.map((r) => [r.id, toService(r)]))
  return ids.flatMap((id) => byId.get(id) ?? [])
}

export async function getRequirements(serviceId: ServiceId, slots?: SlotAnswers): Promise<ServiceRequirement[]> {
  const { data, error } = await createCatalogClient()
    .from('service_requirements')
    .select('*')
    .eq('service_id', serviceId)
    .order('sort_order')
    .order('id')
  if (error) throw dbError(error)
  const rows = data.map(toRequirement)
  return slots === undefined ? rows : rows.filter((r) => evaluateCondition(r.condition, slots))
}

export async function getServiceLinks(fromId: ServiceId, slots?: SlotAnswers): Promise<ServiceLink[]> {
  const { data, error } = await createCatalogClient()
    .from('service_links')
    .select('*')
    .eq('from_service_id', fromId)
    .order('sort_order')
    .order('id')
  if (error) throw dbError(error)
  const rows = data.map(toServiceLink)
  return slots === undefined ? rows : rows.filter((r) => evaluateCondition(r.condition, slots))
}

// MARK: offices
export async function listOffices(filter: {
  agencyId?: AgencyId
  agencyKind?: AgencyKind
  ids?: readonly OfficeId[]
}): Promise<Office[]> {
  if (filter.ids?.length === 0) return []
  let q = createCatalogClient().from('offices').select('*, agencies!inner(kind)')
  if (filter.agencyId !== undefined) q = q.eq('agency_id', filter.agencyId)
  if (filter.agencyKind !== undefined) q = q.eq('agencies.kind', filter.agencyKind)
  if (filter.ids !== undefined) q = q.in('id', [...filter.ids])
  const { data, error } = await q.order('id')
  if (error) throw dbError(error)
  return data.map((r) => toOffice(r))
}

export async function getOffice(id: OfficeId): Promise<Office | null> {
  const { data, error } = await createCatalogClient().from('offices').select('*').eq('id', id).maybeSingle()
  if (error) throw dbError(error)
  return data ? toOffice(data) : null
}

export async function findJurisdictions(
  point: LatLng,
  kind: JurisdictionKind,
  borderM?: number,
): Promise<JurisdictionMatch[]> {
  const { lat, lng } = validPoint(point)
  const { data, error } = await createCatalogClient().rpc('find_jurisdictions', {
    p_lat: lat,
    p_lng: lng,
    p_kind: kind,
    ...(borderM === undefined ? {} : { p_border_m: borderM }),
  })
  if (error) throw dbError(error)
  return data.map((r) => ({
    officeId: String(r.office_id),
    jurisdictionId: r.jurisdiction_id,
    covers: r.covers,
    edgeDistanceM: r.edge_distance_m,
    isProxy: r.is_proxy,
  }))
}

export async function nearestOffices(point: LatLng, kind: AgencyKind, limit?: number): Promise<NearbyOffice[]> {
  const { lat, lng } = validPoint(point)
  const { data, error } = await createCatalogClient().rpc('nearest_offices', {
    p_lat: lat,
    p_lng: lng,
    p_agency_kind: kind,
    ...(limit === undefined ? {} : { p_limit: limit }),
  })
  if (error) throw dbError(error)
  return data.map((r) => ({ officeId: String(r.office_id), straightM: r.straight_m }))
}

// MARK: holidays
export async function listHolidays(from: IsoDate, to: IsoDate): Promise<Holiday[]> {
  const { data, error } = await createCatalogClient()
    .from('holidays')
    .select('*')
    .gte('date', from)
    .lte('date', to)
    .order('date')
  if (error) throw dbError(error)
  return data.map(toHoliday)
}
