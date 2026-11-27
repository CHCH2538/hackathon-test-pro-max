import { z } from 'zod'
import {
  AGENCY_KINDS,
  CASE_MODES,
  CASE_STATUSES,
  CONDITION_STATUSES,
  COPY_TYPES,
  JURISDICTION_KINDS,
  LOCALES,
  OFFICE_RULES,
  REQUIREMENT_KINDS,
  type Agency,
  type CaseDraft,
  type CasePatch,
  type CaseStatus,
  type CaseToken,
  type Condition,
  type Holiday,
  type I18nMap,
  type IsoDate,
  type IsoDateTime,
  type JurisdictionKind,
  type LatLng,
  type Office,
  type OfficeId,
  type OpeningHours,
  type Service,
  type ServiceId,
  type ServiceLink,
  type ServiceRequirement,
  type Slug,
  type SlotAnswers,
  type TriageQuestion,
  type Uuid,
} from '../contracts'
import { BANGKOK_BOUNDS as BANGKOK } from '@/lib/maps/fieldMasks'
import { checkLink } from './links'

const CONDITION_MAX_DEPTH = 4

const SlotKeySchema = z.string().regex(/^[a-z_]{1,32}$/)
const HotlineSchema = z.string().regex(/^[0-9]{3,10}$/)
const PhoneSchema = z.string().regex(/^[0-9+][0-9 -]{2,19}$/)
const HhMmSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/)
const SortOrderSchema = z.int().min(0).max(32767)
const nameTh = (max: number) => z.string().min(1).max(max)
const optText = (max: number) => z.string().max(max).nullable()

const I18nMapSchema: z.ZodType<I18nMap> = z.strictObject({
  en: z.record(z.string().max(64), z.string().max(2000)).optional(),
  my: z.record(z.string().max(64), z.string().max(2000)).optional(),
  km: z.record(z.string().max(64), z.string().max(2000)).optional(),
})
const I18nInputSchema = I18nMapSchema.default({})

export const SlugSchema: z.ZodType<Slug> = z
  .string()
  .max(64)
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/)

export const CaseTokenSchema: z.ZodType<CaseToken> = z
  .string()
  .regex(/^[A-Za-z0-9_-]{22}$/)
  .transform((s) => s as CaseToken)

export const UuidSchema: z.ZodType<Uuid> = z.uuid()

export const IsoDateSchema: z.ZodType<IsoDate> = z.iso.date()

export const IsoDateTimeSchema: z.ZodType<IsoDateTime> = z.iso.datetime({ offset: true })

export const LatLngSchema: z.ZodType<LatLng> = z.strictObject({
  lat: z.number().min(BANGKOK.south).max(BANGKOK.north),
  lng: z.number().min(BANGKOK.west).max(BANGKOK.east),
})

export const ChatTextSchema: z.ZodType<string> = z.string().min(1).max(500)

export const SlotAnswersSchema: z.ZodType<SlotAnswers> = z
  .record(SlotKeySchema, z.union([z.string().max(200), z.boolean(), z.null()]))
  .refine((o) => Object.keys(o).length <= 30)

const ConditionLeafSchema = z.union([
  z.strictObject({
    slot: SlotKeySchema,
    op: z.enum(['eq', 'neq']),
    value: z.union([z.string().max(200), z.boolean()]),
  }),
  z.strictObject({ slot: SlotKeySchema, op: z.literal('in'), value: z.array(z.string().max(200)).max(50) }),
  z.strictObject({ slot: SlotKeySchema, op: z.literal('exists') }),
])

function conditionSchema(depth: number): z.ZodType<Condition> {
  if (depth <= 1) return ConditionLeafSchema
  const inner = conditionSchema(depth - 1)
  return z.union([
    ConditionLeafSchema,
    z.strictObject({ all: z.array(inner).max(20) }),
    z.strictObject({ any: z.array(inner).max(20) }),
    z.strictObject({ not: inner }),
  ])
}

export const ConditionSchema: z.ZodType<Condition> = conditionSchema(CONDITION_MAX_DEPTH)

export const TriageQuestionSchema: z.ZodType<TriageQuestion> = z
  .strictObject({
    id: SlotKeySchema,
    labelTh: nameTh(200),
    kind: z.enum(['single', 'boolean', 'date', 'location']),
    options: z
      .array(
        z.strictObject({
          value: z.string().min(1).max(64),
          labelTh: nameTh(200),
          i18n: I18nMapSchema.optional(),
        }),
      )
      .max(20)
      .optional(),
    askIf: ConditionSchema.optional(),
    i18n: I18nMapSchema.optional(),
  })
  .refine((q) => q.kind !== 'single' || (q.options !== undefined && q.options.length > 0), {
    path: ['options'],
  })

const TimeRangeSchema = z
  .strictObject({ open: HhMmSchema, close: HhMmSchema })
  .refine((r) => r.open < r.close, { path: ['close'] })
const DayHoursSchema = z.array(TimeRangeSchema).max(4)

export const OpeningHoursSchema: z.ZodType<OpeningHours> = z.strictObject({
  mon: DayHoursSchema,
  tue: DayHoursSchema,
  wed: DayHoursSchema,
  thu: DayHoursSchema,
  fri: DayHoursSchema,
  sat: DayHoursSchema,
  sun: DayHoursSchema,
  noteTh: z.string().max(300).optional(),
})

export const OfficialUrlSchema: z.ZodType<string> = z
  .string()
  .max(2048)
  .transform((s, ctx) => {
    const r = checkLink(s)
    if (!r.ok) {
      ctx.addIssue({ code: 'custom', message: r.reason })
      return z.NEVER
    }
    return r.url
  })

export const CaseStatusSchema: z.ZodType<CaseStatus> = z.enum(CASE_STATUSES)

const ChecklistDraftSchema = z.strictObject({
  requirementId: UuidSchema,
  serviceId: SlugSchema,
  kind: z.enum(REQUIREMENT_KINDS),
  textTh: nameTh(500),
  conditionLabelTh: optText(120),
  conditionStatus: z.enum(CONDITION_STATUSES),
  sourceUrl: OfficialUrlSchema,
  lastVerified: IsoDateSchema,
  sortOrder: SortOrderSchema,
})

export const CaseDraftSchema: z.ZodType<CaseDraft> = z.strictObject({
  serviceIds: z.array(SlugSchema).min(1).max(5),
  slotAnswers: SlotAnswersSchema,
  onlineOnly: z.boolean(),
  parentIndex: z.int().min(0).max(4).nullable(),
  checklist: z.array(ChecklistDraftSchema).max(100),
})

export const CasePatchSchema: z.ZodType<CasePatch> = z
  .strictObject({
    officeId: SlugSchema.nullable(),
    incidentPoint: LatLngSchema.nullable(),
    incidentConfirmed: z.boolean(),
    slotAnswers: SlotAnswersSchema,
    appointmentAt: IsoDateTimeSchema.nullable(),
    departAt: IsoDateTimeSchema.nullable(),
    onlineOnly: z.boolean(),
    remindersMuted: z.boolean(),
    timeSavedMin: z.int().min(0).max(10000).nullable(),
    locale: z.enum(LOCALES),
    mode: z.enum(CASE_MODES),
    smartActivatedAt: IsoDateTimeSchema.nullable(),
    pushCap: z.int().min(0).max(50),
    familyLinkId: UuidSchema.nullable(),
  })
  .partial()

export const ReportInputSchema: z.ZodType<{
  serviceId?: ServiceId
  requirementId?: Uuid
  officeId?: OfficeId
  messageTh: string
}> = z.strictObject({
  serviceId: SlugSchema.optional(),
  requirementId: UuidSchema.optional(),
  officeId: SlugSchema.optional(),
  messageTh: nameTh(1000),
})

export const AgencyInputSchema: z.ZodType<Omit<Agency, 'published'> & { published?: boolean }> =
  z.strictObject({
    id: SlugSchema,
    nameTh: nameTh(200),
    kind: z.enum(AGENCY_KINDS),
    hotline: HotlineSchema.nullable(),
    websiteUrl: OfficialUrlSchema.nullable(),
    published: z.boolean().optional(),
    i18n: I18nInputSchema,
  })

export const OfficeInputSchema: z.ZodType<Omit<Office, 'published'> & { published?: boolean }> =
  z.strictObject({
    id: SlugSchema,
    agencyId: SlugSchema,
    nameTh: nameTh(200),
    location: LatLngSchema,
    addressTh: nameTh(500),
    phone: PhoneSchema.nullable(),
    openingHours: OpeningHoursSchema,
    nearestStationTh: optText(120),
    bookingUrl: OfficialUrlSchema.nullable(),
    googlePlaceId: optText(256),
    sourceUrl: OfficialUrlSchema,
    lastVerified: IsoDateSchema,
    published: z.boolean().optional(),
    i18n: I18nInputSchema,
  })

const PositionSchema = z.array(z.number()).min(2).max(3)
const PolygonCoordsSchema = z.array(z.array(PositionSchema).min(4)).min(1)
const GeoJsonAreaSchema = z.discriminatedUnion('type', [
  z.strictObject({ type: z.literal('Polygon'), coordinates: PolygonCoordsSchema }),
  z.strictObject({ type: z.literal('MultiPolygon'), coordinates: z.array(PolygonCoordsSchema).min(1) }),
])

export const JurisdictionInputSchema: z.ZodType<{
  officeId: OfficeId
  kind: JurisdictionKind
  geojson: unknown
  isProxy: boolean
  sourceUrl: string
  lastVerified: IsoDate
}> = z.strictObject({
  officeId: SlugSchema,
  kind: z.enum(JURISDICTION_KINDS),
  geojson: GeoJsonAreaSchema,
  isProxy: z.boolean(),
  sourceUrl: OfficialUrlSchema,
  lastVerified: IsoDateSchema,
})

export const ServiceInputSchema: z.ZodType<Omit<Service, 'published'> & { published?: boolean }> = z
  .strictObject({
    id: SlugSchema,
    agencyId: SlugSchema,
    nameTh: nameTh(200),
    synonyms: z.array(nameTh(100)).max(50),
    examplePhrases: z.array(nameTh(200)).max(50),
    officeRule: z.enum(OFFICE_RULES),
    canCompleteOnline: z.boolean(),
    onlineChannelNameTh: optText(200),
    onlineChannelUrl: OfficialUrlSchema.nullable(),
    feeThb: z.number().min(0).max(99999999.99).nullable(),
    feeNoteTh: optText(300),
    durationMin: z.int().min(0).max(1440).nullable(),
    hotline: HotlineSchema.nullable(),
    triageQuestions: z.array(TriageQuestionSchema).max(8),
    sourceUrl: OfficialUrlSchema,
    lastVerified: IsoDateSchema,
    published: z.boolean().optional(),
    i18n: I18nInputSchema,
  })
  .refine((s) => !s.canCompleteOnline || s.onlineChannelUrl !== null, { path: ['onlineChannelUrl'] })

export const RequirementInputSchema: z.ZodType<Omit<ServiceRequirement, 'id'>> = z.strictObject({
  serviceId: SlugSchema,
  kind: z.enum(REQUIREMENT_KINDS),
  textTh: nameTh(500),
  condition: ConditionSchema.nullable(),
  conditionLabelTh: optText(120),
  copyType: z.enum(COPY_TYPES),
  copies: z.int().min(1).max(10).nullable(),
  sortOrder: SortOrderSchema,
  active: z.boolean(),
  i18n: I18nInputSchema,
})

export const ServiceLinkInputSchema: z.ZodType<Omit<ServiceLink, 'id'>> = z
  .strictObject({
    fromServiceId: SlugSchema,
    toServiceId: SlugSchema,
    condition: ConditionSchema.nullable(),
    conditionLabelTh: optText(120),
    sortOrder: SortOrderSchema,
    active: z.boolean(),
    i18n: I18nInputSchema,
  })
  .refine((l) => l.fromServiceId !== l.toServiceId, { path: ['toServiceId'] })

export const HolidayInputSchema: z.ZodType<Omit<Holiday, 'id'>> = z.strictObject({
  date: IsoDateSchema,
  nameTh: nameTh(200),
  closedAgencyKinds: z.array(z.enum(AGENCY_KINDS)).nullable(),
  closedOfficeIds: z.array(SlugSchema).nullable(),
  sourceUrl: OfficialUrlSchema.nullable(),
})
