// MARK: primitives
export type Brand<T, B extends string> = T & { readonly __brand: B }
export type Slug = string
export type AgencyId = Slug
export type OfficeId = Slug
export type ServiceId = Slug
export type PassProductId = Slug
export type Uuid = string
export type IsoDate = string
export type IsoDateTime = string
export type HhMm = string
export type Hotline = string
export type CaseToken = Brand<string, 'CaseToken'>
export type LatLng = { lat: number; lng: number }
export const LOCALES = ['th', 'en', 'my', 'km'] as const
export type Locale = (typeof LOCALES)[number]
export type I18nMap = Partial<Record<Exclude<Locale, 'th'>, Record<string, string>>>

// MARK: enums (mirror migration 1)
export const AGENCY_KINDS = [
  'district',
  'police',
  'dlt',
  'gov_app',
  'city_report',
  'land',
  'social_security',
  'consular',
  'revenue',
  'utility',
  'other',
] as const
export type AgencyKind = (typeof AGENCY_KINDS)[number]
export const OFFICE_RULES = ['incident_location', 'house_registration', 'any_office', 'online'] as const
export type OfficeRule = (typeof OFFICE_RULES)[number]
export const JURISDICTION_KINDS = ['police_area', 'district_admin'] as const
export type JurisdictionKind = (typeof JURISDICTION_KINDS)[number]
export const REQUIREMENT_KINDS = ['before_go', 'document', 'step', 'remember'] as const
export type RequirementKind = (typeof REQUIREMENT_KINDS)[number]
export const COPY_TYPES = ['original', 'copy', 'original_and_copy', 'not_applicable'] as const
export type CopyType = (typeof COPY_TYPES)[number]
export type DocForm = CopyType
export const CONDITION_STATUSES = ['always', 'met', 'unknown'] as const
export type ConditionStatus = (typeof CONDITION_STATUSES)[number]
export const CASE_STATUSES = ['planned', 'booked', 'due', 'done', 'postponed', 'cancelled'] as const
export type CaseStatus = (typeof CASE_STATUSES)[number]
export const CASE_MODES = ['free', 'smart'] as const
export type CaseMode = (typeof CASE_MODES)[number]
export const ORIGIN_SOURCES = ['gps', 'pin', 'search'] as const
export type OriginSource = (typeof ORIGIN_SOURCES)[number]
export const REMINDER_KINDS = [
  'd_minus_1',
  'morning_of',
  'unticked_docs',
  'expiry',
  'next_step',
  'reroute',
  'route_event',
  'survey',
] as const
export type ReminderKind = (typeof REMINDER_KINDS)[number]
export const REMINDER_STATUSES = ['pending', 'sent', 'cancelled', 'failed'] as const
export type ReminderStatus = (typeof REMINDER_STATUSES)[number]
export const REMINDER_FREQUENCIES = ['all', 'important_only', 'off'] as const
export type ReminderFrequency = (typeof REMINDER_FREQUENCIES)[number]
export const CONSENT_PURPOSES = ['line_link', 'reminders', 'survey'] as const
export type ConsentPurpose = (typeof CONSENT_PURPOSES)[number]
export const TRAVEL_MODES = ['TRANSIT', 'DRIVE', 'TWO_WHEELER', 'WALK'] as const
export type TravelMode = (typeof TRAVEL_MODES)[number]
export const REPORT_STATUSES = ['open', 'accepted', 'rejected', 'fixed'] as const
export type ReportStatus = (typeof REPORT_STATUSES)[number]
export const REVIEW_ACTIONS = ['create', 'update', 'verify', 'publish', 'unpublish', 'delete'] as const
export type ReviewAction = (typeof REVIEW_ACTIONS)[number]
export const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'] as const
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number]
export const LEDGER_REASONS = [
  'purchase',
  'spend',
  'refund',
  'transfer_in',
  'transfer_out',
  'sponsor',
  'free_first',
  'expire',
] as const
export type LedgerReason = (typeof LEDGER_REASONS)[number]
export const FAMILY_STATUSES = ['pending', 'active', 'revoked'] as const
export type FamilyStatus = (typeof FAMILY_STATUSES)[number]
export const DOC_TYPES = ['id_card', 'driving_licence', 'vehicle_tax', 'passport'] as const
export type DocType = (typeof DOC_TYPES)[number]
export const DAY_PARTS = ['morning', 'midday', 'afternoon'] as const
export type DayPart = (typeof DAY_PARTS)[number]

// MARK: catalog JSON shapes
export type SlotKey = string
export type SlotValue = string | boolean | null
export type SlotAnswers = Record<SlotKey, SlotValue>
export type Condition =
  | { slot: SlotKey; op: 'eq' | 'neq'; value: string | boolean }
  | { slot: SlotKey; op: 'in'; value: readonly string[] }
  | { slot: SlotKey; op: 'exists' }
  | { all: readonly Condition[] }
  | { any: readonly Condition[] }
  | { not: Condition }
export type TriageOption = { value: string; labelTh: string; i18n?: I18nMap }
export type TriageQuestion = {
  id: SlotKey
  labelTh: string
  kind: 'single' | 'boolean' | 'date' | 'location'
  options?: readonly TriageOption[]
  askIf?: Condition
  i18n?: I18nMap
}
export type TimeRange = { open: HhMm; close: HhMm }
export type Weekday = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'
export type OpeningHours = Record<Weekday, readonly TimeRange[]> & { noteTh?: string }

// MARK: catalog rows (D-01 to D-06, D-09)
export type Agency = {
  id: AgencyId
  nameTh: string
  kind: AgencyKind
  hotline: Hotline | null
  websiteUrl: string | null
  published: boolean
  i18n: I18nMap
}
export type Office = {
  id: OfficeId
  agencyId: AgencyId
  nameTh: string
  location: LatLng
  addressTh: string
  phone: string | null
  openingHours: OpeningHours
  nearestStationTh: string | null
  bookingUrl: string | null
  googlePlaceId: string | null
  sourceUrl: string
  lastVerified: IsoDate
  published: boolean
  i18n: I18nMap
}
export type JurisdictionMatch = {
  officeId: OfficeId
  jurisdictionId: Uuid
  covers: boolean
  edgeDistanceM: number
  isProxy: boolean
}
export type NearbyOffice = { officeId: OfficeId; straightM: number }
export type Service = {
  id: ServiceId
  agencyId: AgencyId
  nameTh: string
  synonyms: readonly string[]
  examplePhrases: readonly string[]
  officeRule: OfficeRule
  canCompleteOnline: boolean
  onlineChannelNameTh: string | null
  onlineChannelUrl: string | null
  feeThb: number | null
  feeNoteTh: string | null
  durationMin: number | null
  hotline: Hotline | null
  triageQuestions: readonly TriageQuestion[]
  sourceUrl: string
  lastVerified: IsoDate
  published: boolean
  i18n: I18nMap
}
export type ServiceRequirement = {
  id: Uuid
  serviceId: ServiceId
  kind: RequirementKind
  textTh: string
  condition: Condition | null
  conditionLabelTh: string | null
  copyType: CopyType
  copies: number | null
  sortOrder: number
  active: boolean
  i18n: I18nMap
}
export type ServiceLink = {
  id: Uuid
  fromServiceId: ServiceId
  toServiceId: ServiceId
  condition: Condition | null
  conditionLabelTh: string | null
  sortOrder: number
  active: boolean
  i18n: I18nMap
}
export type Holiday = {
  id: Uuid
  date: IsoDate
  nameTh: string
  closedAgencyKinds: readonly AgencyKind[] | null
  closedOfficeIds: readonly OfficeId[] | null
  sourceUrl: string | null
}

// MARK: case rows (D-07, D-10)
export type Case = {
  id: Uuid
  sessionId: Uuid | null
  lineUserId: Uuid | null
  familyLinkId: Uuid | null
  parentCaseId: Uuid | null
  serviceIds: readonly ServiceId[]
  slotAnswers: SlotAnswers
  onlineOnly: boolean
  officeId: OfficeId | null
  incidentPoint: LatLng | null
  incidentConfirmed: boolean
  appointmentAt: IsoDateTime | null
  departAt: IsoDateTime | null
  status: CaseStatus
  mode: CaseMode
  smartActivatedAt: IsoDateTime | null
  pushCount: number
  pushCap: number
  remindersMuted: boolean
  timeSavedMin: number | null
  locale: Locale
  createdAt: IsoDateTime
  updatedAt: IsoDateTime
  closedAt: IsoDateTime | null
  expiresAt: IsoDateTime
}
export type ChecklistItem = {
  id: Uuid
  caseId: Uuid
  requirementId: Uuid | null
  serviceId: ServiceId
  kind: RequirementKind
  textTh: string
  conditionLabelTh: string | null
  conditionStatus: ConditionStatus
  sourceUrl: string
  lastVerified: IsoDate
  sortOrder: number
  checked: boolean
  checkedAt: IsoDateTime | null
}
export type CaseOrigin = { caseId: Uuid; point: LatLng; source: OriginSource }

// MARK: LINE, routes, admin, KPI, Phase 2 rows
export type LineUser = {
  id: Uuid
  isFriend: boolean
  reminderFrequency: ReminderFrequency
  locale: Locale
  freeSmartUsedAt: IsoDateTime | null
  blockedAt: IsoDateTime | null
}
export type Consent = {
  id: Uuid
  lineUserId: Uuid
  purpose: ConsentPurpose
  policyVersion: string
  grantedAt: IsoDateTime
  revokedAt: IsoDateTime | null
}
export type Reminder = {
  id: Uuid
  caseId: Uuid | null
  documentExpiryId: Uuid | null
  kind: ReminderKind
  sendAt: IsoDateTime
  status: ReminderStatus
  attempts: number
  sentAt: IsoDateTime | null
  dedupeKey: string
}
export type DocumentExpiry = {
  id: Uuid
  lineUserId: Uuid
  familyLinkId: Uuid | null
  docType: DocType
  expiresOn: IsoDate
}
export type FamilyLink = {
  id: Uuid
  carerLineUserId: Uuid
  memberLineUserId: Uuid | null
  memberLabelTh: string
  status: FamilyStatus
}
export type RoutePlan = {
  id: Uuid
  caseId: Uuid
  officeId: OfficeId | null
  travelMode: TravelMode
  trafficAware: boolean
  isChain: boolean
  arriveBy: IsoDateTime | null
  departAt: IsoDateTime | null
  durationS: number | null
  distanceM: number | null
  bufferMin: number
  baselineDurationS: number | null
  isFallback: boolean
  summaryTh: string | null
  encodedPolyline: string | null
  computedAt: IsoDateTime
  reroutedAt: IsoDateTime | null
}
export type RouteLeg = {
  id: Uuid
  routePlanId: Uuid
  seq: number
  toOfficeId: OfficeId | null
  travelMode: TravelMode
  durationS: number | null
  distanceM: number | null
  arriveAt: IsoDateTime | null
  withinHours: boolean | null
  steps: readonly RouteStep[]
}
export type RouteStep = {
  mode: TravelMode | 'BTS' | 'MRT' | 'BUS' | 'BOAT'
  lineNameTh?: string
  fromStopTh?: string
  toStopTh?: string
  durationS: number
}
export type CatalogReport = {
  id: Uuid
  serviceId: ServiceId | null
  requirementId: Uuid | null
  officeId: OfficeId | null
  messageTh: string
  status: ReportStatus
  adminNote: string | null
  createdAt: IsoDateTime
  resolvedAt: IsoDateTime | null
}
export type CatalogReviewEntry = {
  id: number
  entityTable: CatalogTable
  entityId: string
  action: ReviewAction
  changedFields: readonly string[]
  note: string | null
  reviewedBy: string
  reviewedAt: IsoDateTime
}
export type CatalogTable =
  | 'agencies'
  | 'offices'
  | 'jurisdictions'
  | 'services'
  | 'service_requirements'
  | 'service_links'
  | 'holidays'
export type SurveyResponse = {
  id: Uuid
  caseId: Uuid | null
  serviceId: ServiceId | null
  tripsSaved: number
}
export type PassProduct = {
  id: PassProductId
  nameTh: string
  passes: number
  priceSatang: number
  validMonths: number
  active: boolean
}
export type Payment = {
  id: Uuid
  lineUserId: Uuid | null
  productId: PassProductId
  provider: string
  providerRef: string
  amountSatang: number
  currency: 'THB'
  status: PaymentStatus
  receiptUrl: string | null
  paidAt: IsoDateTime | null
}
export type PassWallet = { id: Uuid; lineUserId: Uuid }
export type PassLedgerEntry = {
  id: number
  walletId: Uuid
  delta: number
  reason: LedgerReason
  caseId: Uuid | null
  paymentId: Uuid | null
  counterpartWalletId: Uuid | null
  expiresAt: IsoDateTime | null
  createdAt: IsoDateTime
}
export type SponsorCode = {
  sponsorName: string
  passesPerCode: number
  maxRedemptions: number
  redeemedCount: number
  expiresAt: IsoDateTime
}
export type WaitReport = {
  id: Uuid
  officeId: OfficeId
  serviceId: ServiceId | null
  visitedOn: IsoDate
  dayPart: DayPart
  waitMin: number
}
export type CatalogSource = {
  id: Uuid
  serviceId: ServiceId | null
  agencyId: AgencyId | null
  titleTh: string
  sourceUrl: string
  excerptTh: string
  retrievedOn: IsoDate
}
export type OfficeQueueSlot = {
  id: Uuid
  officeId: OfficeId
  serviceId: ServiceId | null
  startsAt: IsoDateTime
  endsAt: IsoDateTime
  available: number | null
  source: string
  fetchedAt: IsoDateTime
}

// MARK: case status machine (D-10)
export const CASE_TRANSITIONS: Readonly<Record<CaseStatus, readonly CaseStatus[]>> = {
  planned: ['booked', 'done', 'cancelled'],
  booked: ['due', 'postponed', 'done', 'cancelled'],
  due: ['done', 'postponed', 'cancelled'],
  postponed: ['booked', 'cancelled'],
  done: [],
  cancelled: [],
}
export const ONLINE_ONLY_EDGE = { from: 'planned', to: 'done' } as const
export const OPEN_CASE_STATUSES = [
  'planned',
  'booked',
  'due',
  'postponed',
] as const satisfies readonly CaseStatus[]
export const CASE_STATUS_LABEL_TH: Readonly<Record<CaseStatus, string>> = {
  planned: 'วางแผนแล้ว',
  booked: 'นัดแล้ว',
  due: 'ถึงวันนัด',
  done: 'เสร็จ',
  postponed: 'เลื่อน',
  cancelled: 'ยกเลิก',
}

// MARK: cross-slice DTOs
export type ChecklistDraft = {
  requirementId: Uuid
  serviceId: ServiceId
  kind: RequirementKind
  textTh: string
  conditionLabelTh: string | null
  conditionStatus: ConditionStatus
  sourceUrl: string
  lastVerified: IsoDate
  sortOrder: number
}
export type CaseDraft = {
  serviceIds: readonly ServiceId[]
  slotAnswers: SlotAnswers
  onlineOnly: boolean
  parentIndex: number | null
  checklist: readonly ChecklistDraft[]
}
export type CreatedCase = { index: number; caseId: Uuid; token: CaseToken }
export type CasePatch = Partial<{
  officeId: OfficeId | null
  incidentPoint: LatLng | null
  incidentConfirmed: boolean
  slotAnswers: SlotAnswers
  appointmentAt: IsoDateTime | null
  departAt: IsoDateTime | null
  onlineOnly: boolean
  remindersMuted: boolean
  timeSavedMin: number | null
  locale: Locale
  mode: CaseMode
  smartActivatedAt: IsoDateTime | null
  pushCap: number
  familyLinkId: Uuid | null
}>
export type CaseView = Case & {
  services: readonly Pick<
    Service,
    | 'id'
    | 'nameTh'
    | 'agencyId'
    | 'canCompleteOnline'
    | 'onlineChannelNameTh'
    | 'onlineChannelUrl'
    | 'hotline'
    | 'sourceUrl'
    | 'lastVerified'
  >[]
  office: Office | null
  checklist: readonly ChecklistItem[]
  hasOrigin: boolean
}
export type CaseSummary = Pick<Case, 'id' | 'serviceIds' | 'status' | 'appointmentAt' | 'createdAt'> & {
  titleTh: string
}
export type TransitionResult =
  { ok: true; case: Case } | { ok: false; reason: 'not_found' | 'invalid_transition' | 'missing_appointment' }
export type Staleness = { days: number; isStale: boolean }
export type EmergencyResult = { emergency: false } | { emergency: true; matchedTerm: string }
export type MapsFailure = 'timeout' | 'quota' | 'upstream' | 'bad_request' | 'not_configured'
export type MapsResult<T> = { ok: true; data: T } | { ok: false; reason: MapsFailure }

// MARK: errors, events, health
export const SAFE_ERROR_CODES = [
  'bad_request',
  'unauthorized',
  'forbidden',
  'not_found',
  'conflict',
  'rate_limited',
  'upstream_unavailable',
  'not_implemented',
  'not_configured',
  'internal',
] as const
export type SafeErrorCode = (typeof SAFE_ERROR_CODES)[number]
export type SafeErrorBody = { error: SafeErrorCode; messageTh: string; retryAfterSec?: number }
export const EVENT_NAMES = [
  'chat_started',
  'services_selected',
  'low_confidence',
  'emergency_shown',
  'online_resolved',
  'plan_ready',
  'case_created',
  'office_selected',
  'jurisdiction_shown',
  'maps_fallback',
  'maps_call',
  'route_computed',
  'case_viewed',
  'checklist_ticked',
  'calendar_added',
  'line_linked',
  'push_sent',
  'reminder_failed',
  'line_data_deleted',
  'survey_answered',
  'report_submitted',
  'catalog_edited',
  'pass_purchased',
  'pass_spent',
  'pass_refunded',
  'llm_call',
  'rate_limited',
  'signature_failed',
  'cron_run',
] as const
export type EventName = (typeof EVENT_NAMES)[number]
export type EventProps = Record<string, string | number | boolean | null>
export type HealthResponse = { ok: boolean; db: 'ok' | 'down'; commit: string | null }

// MARK: spec manifest
export type SpecId =
  | '00-foundation'
  | '11-chat-triage'
  | '12-office-finder'
  | '13-case-tracker'
  | '20-journeys-e2e'
  | '21-line-oa'
  | '22-route-timing'
  | '30-smart-pass'
  | '31-phase2-extras'
  | '90-landing-seo'
  | '91-demo-catalog'
  | '92-admin-catalog'
  | '93-docs-pitch'
export type SpecInfo = {
  id: SpecId
  jira: `KAN-${number}`
  wave: 0 | 1 | 2 | 3 | 4
  executor: string
  owns: readonly string[]
  href: string | null
  phase2: boolean
}
