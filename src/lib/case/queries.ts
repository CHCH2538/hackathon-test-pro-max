import 'server-only'
import { z } from 'zod'
import { ORIGIN_SOURCES } from '@/lib/contracts'
import type {
  Case,
  CaseDraft,
  CaseMode,
  CasePatch,
  CaseStatus,
  CaseSummary,
  CaseToken,
  CaseView,
  ChecklistDraft,
  ChecklistItem,
  CreatedCase,
  IsoDateTime,
  LatLng,
  Locale,
  OriginSource,
  Service,
  SlotAnswers,
  TransitionResult,
  Uuid,
} from '@/lib/contracts'
import { getOffice, getServicesByIds } from '@/lib/catalog'
import { createServiceClient } from '@/lib/db/server'
import type { Database, Json } from '@/lib/db/database.types'
import { AppError } from '@/lib/security/errors'
import { trackEvent } from '@/lib/security/log'
import {
  CaseDraftSchema,
  CasePatchSchema,
  IsoDateTimeSchema,
  LatLngSchema,
  UuidSchema,
} from '@/lib/security/schemas'
import { canTransition, isCaseToken } from './status'
import { hashToken, newCaseToken } from './token'

type Row<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
type CaseRow = Omit<Row<'cases'>, 'token_hash'>

const CASE_COLUMNS =
  'id, session_id, line_user_id, family_link_id, parent_case_id, service_ids, slot_answers, online_only, ' +
  'office_id, incident_point, incident_confirmed, appointment_at, depart_at, status, mode, smart_activated_at, ' +
  'push_count, push_cap, reminders_muted, time_saved_min, locale, created_at, updated_at, closed_at, expires_at'

const SUMMARY_COLUMNS = 'id, service_ids, status, appointment_at, created_at'

// MARK: mapping
function dbError(cause: unknown): AppError {
  return new AppError('upstream_unavailable', 503, { cause })
}

function byteaHex(buf: Buffer): string {
  return `\\x${buf.toString('hex')}`
}

function nowIso(): string {
  return new Date().toISOString()
}

function parsePoint(v: unknown): LatLng | null {
  if (v === null || v === undefined) return null
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
  if (typeof v === 'object' && 'coordinates' in v) {
    const [lng, lat] = (v as { coordinates: unknown }).coordinates as [unknown, unknown]
    if (typeof lng === 'number' && typeof lat === 'number') return { lat, lng }
  }
  throw new AppError('internal', 500)
}

function toCase(r: CaseRow): Case {
  return {
    id: r.id,
    sessionId: r.session_id,
    lineUserId: r.line_user_id,
    familyLinkId: r.family_link_id,
    parentCaseId: r.parent_case_id,
    serviceIds: r.service_ids.map(String),
    slotAnswers: (r.slot_answers ?? {}) as SlotAnswers,
    onlineOnly: r.online_only,
    officeId: r.office_id,
    incidentPoint: parsePoint(r.incident_point),
    incidentConfirmed: r.incident_confirmed,
    appointmentAt: r.appointment_at,
    departAt: r.depart_at,
    status: r.status,
    mode: r.mode as CaseMode,
    smartActivatedAt: r.smart_activated_at,
    pushCount: r.push_count,
    pushCap: r.push_cap,
    remindersMuted: r.reminders_muted,
    timeSavedMin: r.time_saved_min,
    locale: r.locale as Locale,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    closedAt: r.closed_at,
    expiresAt: r.expires_at,
  }
}

function toChecklistItem(r: Row<'case_checklist_items'>): ChecklistItem {
  return {
    id: r.id,
    caseId: r.case_id,
    requirementId: r.requirement_id,
    serviceId: r.service_id,
    kind: r.kind,
    textTh: r.text_th,
    conditionLabelTh: r.condition_label_th,
    conditionStatus: r.condition_status,
    sourceUrl: r.source_url,
    lastVerified: r.last_verified,
    sortOrder: r.sort_order,
    checked: r.checked,
    checkedAt: r.checked_at,
  }
}

function toChecklistRow(d: ChecklistDraft) {
  return {
    requirement_id: d.requirementId,
    service_id: d.serviceId,
    kind: d.kind,
    text_th: d.textTh,
    condition_label_th: d.conditionLabelTh,
    condition_status: d.conditionStatus,
    source_url: d.sourceUrl,
    last_verified: d.lastVerified,
    sort_order: d.sortOrder,
  }
}

function toServiceView(s: Service): CaseView['services'][number] {
  return {
    id: s.id,
    nameTh: s.nameTh,
    agencyId: s.agencyId,
    canCompleteOnline: s.canCompleteOnline,
    onlineChannelNameTh: s.onlineChannelNameTh,
    onlineChannelUrl: s.onlineChannelUrl,
    hotline: s.hotline,
    sourceUrl: s.sourceUrl,
    lastVerified: s.lastVerified,
  }
}

// MARK: lookups
async function findLiveCase(token: string): Promise<CaseRow | null> {
  if (!isCaseToken(token)) return null
  const { data, error } = await createServiceClient()
    .from('cases')
    .select(CASE_COLUMNS)
    .eq('token_hash', byteaHex(hashToken(token)))
    .gte('expires_at', nowIso())
    .maybeSingle<CaseRow>()
  if (error) throw dbError(error)
  return data
}

async function checklistFor(caseId: Uuid): Promise<ChecklistItem[]> {
  const { data, error } = await createServiceClient()
    .from('case_checklist_items')
    .select('*')
    .eq('case_id', caseId)
    .order('sort_order')
    .order('id')
  if (error) throw dbError(error)
  return data.map(toChecklistItem)
}

async function hasOriginFor(caseId: Uuid): Promise<boolean> {
  const { count, error } = await createServiceClient()
    .from('case_origins')
    .select('case_id', { count: 'exact', head: true })
    .eq('case_id', caseId)
  if (error) throw dbError(error)
  return (count ?? 0) > 0
}

type SummaryRow = Pick<Row<'cases'>, 'id' | 'service_ids' | 'status' | 'appointment_at' | 'created_at'>

async function toSummaries(rows: readonly SummaryRow[]): Promise<CaseSummary[]> {
  const ids = [...new Set(rows.flatMap((r) => r.service_ids.map(String)))]
  const names = new Map((await getServicesByIds(ids)).map((s) => [s.id, s.nameTh]))
  return rows.map((r) => {
    const serviceIds = r.service_ids.map(String)
    return {
      id: r.id,
      serviceIds,
      status: r.status,
      appointmentAt: r.appointment_at,
      createdAt: r.created_at,
      titleTh: serviceIds.map((id) => names.get(id) ?? id).join(' + '),
    }
  })
}

async function listSummaries(column: 'session_id' | 'line_user_id', value: Uuid): Promise<CaseSummary[]> {
  const { data, error } = await createServiceClient()
    .from('cases')
    .select(SUMMARY_COLUMNS)
    .eq(column, value)
    .gte('expires_at', nowIso())
    .order('created_at', { ascending: false })
  if (error) throw dbError(error)
  return toSummaries(data)
}

// MARK: create
export async function createCases(sessionId: Uuid, drafts: readonly CaseDraft[]): Promise<CreatedCase[]> {
  const result = z.array(CaseDraftSchema).min(1).max(5).safeParse(drafts)
  if (!result.success) throw new AppError('bad_request', 400)
  const parsed = result.data
  parsed.forEach((d, i) => {
    if (d.parentIndex !== null && d.parentIndex >= i) throw new AppError('bad_request', 400)
  })
  const tokens = parsed.map(() => newCaseToken())
  const payload = parsed.map((d, i) => ({
    token_hash_hex: hashToken(tokens[i]!).toString('hex'),
    service_ids: [...d.serviceIds],
    slot_answers: d.slotAnswers,
    online_only: d.onlineOnly,
    parent_index: d.parentIndex,
    checklist: d.checklist.map(toChecklistRow),
  }))
  const { data, error } = await createServiceClient().rpc('create_case_chain', {
    p_session_id: sessionId,
    p_cases: payload as Json,
  })
  if (error || !data || data.length !== parsed.length) throw new AppError('internal', 500, { cause: error })
  const created = data
    .map((r) => ({ index: r.r_index, caseId: r.r_case_id, token: tokens[r.r_index]! }))
    .sort((a, b) => a.index - b.index)
  await Promise.all(
    created.map((c) =>
      trackEvent(
        'case_created',
        { sessionId, caseId: c.caseId },
        { online_only: parsed[c.index]!.onlineOnly },
      ),
    ),
  )
  return created
}

// MARK: read
export async function getCaseByToken(token: string): Promise<CaseView | null> {
  const row = await findLiveCase(token)
  if (!row) return null
  const c = toCase(row)
  const [services, office, checklist, hasOrigin] = await Promise.all([
    getServicesByIds(c.serviceIds),
    c.officeId === null ? null : getOffice(c.officeId),
    checklistFor(c.id),
    hasOriginFor(c.id),
  ])
  return { ...c, services: services.map(toServiceView), office, checklist, hasOrigin }
}

export async function getCaseById(id: Uuid): Promise<Case | null> {
  const { data, error } = await createServiceClient()
    .from('cases')
    .select(CASE_COLUMNS)
    .eq('id', id)
    .gte('expires_at', nowIso())
    .maybeSingle<CaseRow>()
  if (error) throw dbError(error)
  return data ? toCase(data) : null
}

export async function listChecklist(token: CaseToken): Promise<ChecklistItem[]> {
  const row = await findLiveCase(token)
  return row ? checklistFor(row.id) : []
}

export async function listCasesForSession(sessionId: Uuid): Promise<CaseSummary[]> {
  return listSummaries('session_id', sessionId)
}

export async function listCasesForLineUser(lineUserId: Uuid): Promise<CaseSummary[]> {
  return listSummaries('line_user_id', lineUserId)
}

// MARK: update
type CaseUpdate = Database['public']['Tables']['cases']['Update']

const DEFAULT_PUSH_BUDGET = 300

function writeError(error: { code?: string }): AppError {
  if (error.code === '23514' || error.code === '23503') return new AppError('bad_request', 400, { cause: error })
  return dbError(error)
}

function toEwkt(p: LatLng): string {
  return `SRID=4326;POINT(${p.lng} ${p.lat})`
}

function toCaseUpdate(p: CasePatch): CaseUpdate {
  const u: CaseUpdate = {}
  if (p.officeId !== undefined) u.office_id = p.officeId
  if (p.incidentPoint !== undefined) u.incident_point = p.incidentPoint === null ? null : toEwkt(p.incidentPoint)
  if (p.incidentConfirmed !== undefined) u.incident_confirmed = p.incidentConfirmed
  if (p.slotAnswers !== undefined) u.slot_answers = p.slotAnswers as Json
  if (p.appointmentAt !== undefined) u.appointment_at = p.appointmentAt
  if (p.departAt !== undefined) u.depart_at = p.departAt
  if (p.onlineOnly !== undefined) u.online_only = p.onlineOnly
  if (p.remindersMuted !== undefined) u.reminders_muted = p.remindersMuted
  if (p.timeSavedMin !== undefined) u.time_saved_min = p.timeSavedMin
  if (p.locale !== undefined) u.locale = p.locale
  if (p.mode !== undefined) u.mode = p.mode
  if (p.smartActivatedAt !== undefined) u.smart_activated_at = p.smartActivatedAt
  if (p.pushCap !== undefined) u.push_cap = p.pushCap
  if (p.familyLinkId !== undefined) u.family_link_id = p.familyLinkId
  return u
}

function pushBudget(): number {
  const n = Number.parseInt(process.env.LINE_MONTHLY_PUSH_BUDGET ?? '', 10)
  return Number.isInteger(n) && n >= 0 ? n : DEFAULT_PUSH_BUDGET
}

export async function updateCase(token: CaseToken, patch: CasePatch): Promise<Case | null> {
  const parsed = CasePatchSchema.safeParse(patch)
  if (!parsed.success) throw new AppError('bad_request', 400)
  const row = await findLiveCase(token)
  if (!row) return null
  const update = toCaseUpdate(parsed.data)
  if (Object.keys(update).length === 0) return toCase(row)
  const { data, error } = await createServiceClient()
    .from('cases')
    .update(update)
    .eq('id', row.id)
    .select(CASE_COLUMNS)
    .maybeSingle<CaseRow>()
  if (error) throw writeError(error)
  return data ? toCase(data) : null
}

export async function transitionCase(
  token: CaseToken,
  to: CaseStatus,
  opts: { appointmentAt?: IsoDateTime } = {},
): Promise<TransitionResult> {
  if (opts.appointmentAt !== undefined && !IsoDateTimeSchema.safeParse(opts.appointmentAt).success) {
    throw new AppError('bad_request', 400)
  }
  const row = await findLiveCase(token)
  if (!row) return { ok: false, reason: 'not_found' }
  if (!canTransition(row.status, to, row.online_only)) return { ok: false, reason: 'invalid_transition' }
  const appointmentAt = opts.appointmentAt ?? row.appointment_at
  if (to === 'booked' && appointmentAt === null) return { ok: false, reason: 'missing_appointment' }
  const update: CaseUpdate = { status: to }
  if (opts.appointmentAt !== undefined) update.appointment_at = opts.appointmentAt
  const { data, error } = await createServiceClient()
    .from('cases')
    .update(update)
    .eq('id', row.id)
    .eq('status', row.status)
    .select(CASE_COLUMNS)
    .maybeSingle<CaseRow>()
  if (error?.code === '23514') return { ok: false, reason: 'invalid_transition' }
  if (error) throw dbError(error)
  if (!data) return { ok: false, reason: 'invalid_transition' }
  return { ok: true, case: toCase(data) }
}

export async function setChecklistItem(
  token: CaseToken,
  itemId: Uuid,
  checked: boolean,
): Promise<ChecklistItem | null> {
  if (!UuidSchema.safeParse(itemId).success || typeof checked !== 'boolean') return null
  const row = await findLiveCase(token)
  if (!row) return null
  const { data, error } = await createServiceClient()
    .from('case_checklist_items')
    .update({ checked, checked_at: checked ? nowIso() : null })
    .eq('id', itemId)
    .eq('case_id', row.id)
    .select('*')
    .maybeSingle()
  if (error) throw dbError(error)
  return data ? toChecklistItem(data) : null
}

export async function setOrigin(token: CaseToken, point: LatLng, source: OriginSource): Promise<boolean> {
  const parsed = LatLngSchema.safeParse(point)
  if (!parsed.success || !ORIGIN_SOURCES.includes(source)) throw new AppError('bad_request', 400)
  const row = await findLiveCase(token)
  if (!row) return false
  const { error } = await createServiceClient()
    .from('case_origins')
    .upsert(
      { case_id: row.id, point: toEwkt(parsed.data), source, updated_at: nowIso() },
      { onConflict: 'case_id' },
    )
  if (error) throw dbError(error)
  return true
}

export async function getOrigin(token: CaseToken): Promise<LatLng | null> {
  const row = await findLiveCase(token)
  if (!row) return null
  const { data, error } = await createServiceClient()
    .from('case_origins')
    .select('point')
    .eq('case_id', row.id)
    .maybeSingle()
  if (error) throw dbError(error)
  return data ? parsePoint(data.point) : null
}

export async function clearOrigin(token: CaseToken): Promise<void> {
  const row = await findLiveCase(token)
  if (!row) return
  const { error } = await createServiceClient().from('case_origins').delete().eq('case_id', row.id)
  if (error) throw dbError(error)
}

export async function bindLineUser(token: CaseToken, lineUserId: Uuid): Promise<boolean> {
  if (!UuidSchema.safeParse(lineUserId).success) return false
  const row = await findLiveCase(token)
  if (!row) return false
  if (row.line_user_id !== null) return row.line_user_id === lineUserId
  const { data, error } = await createServiceClient()
    .from('cases')
    .update({ line_user_id: lineUserId })
    .eq('id', row.id)
    .is('line_user_id', null)
    .select('id')
    .maybeSingle()
  if (error?.code === '23503') return false
  if (error) throw dbError(error)
  return data !== null
}

export async function claimPush(caseId: Uuid | null): Promise<boolean> {
  if (caseId !== null && !UuidSchema.safeParse(caseId).success) return false
  const p_monthly_budget = pushBudget()
  const { data, error } = await createServiceClient().rpc(
    'claim_push',
    caseId === null ? { p_monthly_budget } : { p_monthly_budget, p_case_id: caseId },
  )
  if (error) throw dbError(error)
  return data === true
}

export async function deleteLineUserData(lineUserId: Uuid): Promise<void> {
  if (!UuidSchema.safeParse(lineUserId).success) throw new AppError('bad_request', 400)
  const { error } = await createServiceClient().rpc('delete_line_user_data', { p_line_user_id: lineUserId })
  if (error) throw dbError(error)
}
