import 'server-only'
import type Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import type { Service, ServiceId } from '@/lib/contracts'
import { SlugSchema } from '@/lib/security/schemas'

const SelectServicesSchema = z.strictObject({
  serviceIds: z.array(SlugSchema).min(1).max(5),
  confidence: z.enum(['high', 'low']),
})

export function catalogTools(
  services: readonly Pick<Service, 'id' | 'nameTh' | 'synonyms'>[],
): Anthropic.Tool[] {
  const ids = services.map((s) => s.id)
  const list = services
    .map((s) => `- ${s.id}: ${s.nameTh}${s.synonyms.length ? ` (${s.synonyms.join(', ')})` : ''}`)
    .join('\n')
  return [
    {
      name: 'select_services',
      description: `เลือกบริการจากแคตตาล็อกที่ตรงกับสิ่งที่ผู้ใช้ต้องการทำ (1–5 รายการ เรียงตามลำดับที่ควรทำ) ใช้ confidence "low" เมื่อไม่แน่ใจ เครื่องมือนี้อ่านอย่างเดียว ไม่ยื่นคำร้องหรือส่งข้อมูลใด ๆ\nบริการที่มี:\n${list}`,
      input_schema: {
        type: 'object',
        properties: {
          serviceIds: {
            type: 'array',
            items: { type: 'string', enum: ids },
            minItems: 1,
            maxItems: 5,
            uniqueItems: true,
          },
          confidence: { type: 'string', enum: ['high', 'low'] },
        },
        required: ['serviceIds', 'confidence'],
        additionalProperties: false,
      },
    },
    {
      name: 'get_service_details',
      description:
        'อ่านรายละเอียดบริการจากแคตตาล็อกที่ตรวจสอบแล้ว (เอกสาร สำนักงาน ค่าธรรมเนียม ช่องทางออนไลน์) เครื่องมือนี้อ่านอย่างเดียว',
      input_schema: {
        type: 'object',
        properties: { serviceId: { type: 'string', enum: ids } },
        required: ['serviceId'],
        additionalProperties: false,
      },
    },
  ]
}

export function parseSelectServices(
  input: unknown,
  validIds: ReadonlySet<ServiceId>,
): { ok: true; serviceIds: ServiceId[]; confidence: 'high' | 'low' } | { ok: false } {
  const r = SelectServicesSchema.safeParse(input)
  if (!r.success) return { ok: false }
  const serviceIds = [...new Set(r.data.serviceIds)]
  if (!serviceIds.every((id) => validIds.has(id))) return { ok: false }
  return { ok: true, serviceIds, confidence: r.data.confidence }
}
