import { z } from 'zod'
import { CaseTokenSchema, IsoDateTimeSchema, UuidSchema } from '@/lib/security/schemas'

export const CaseActionSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('tick'), token: CaseTokenSchema, itemId: UuidSchema, checked: z.boolean() }).strict(),
  z.object({ action: z.literal('book'), token: CaseTokenSchema, appointmentAt: IsoDateTimeSchema }).strict(),
  z
    .object({ action: z.literal('transition'), token: CaseTokenSchema, to: z.enum(['done', 'postponed', 'cancelled']) })
    .strict(),
  z.object({ action: z.literal('calendar'), token: CaseTokenSchema, kind: z.literal('google') }).strict(),
])

export type CaseAction = z.infer<typeof CaseActionSchema>
