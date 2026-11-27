import type { RequirementKind } from '@/lib/contracts'

export const KIND_HEADING_TH: Record<RequirementKind, string> = {
  before_go: 'ทำก่อนไป',
  document: 'เอกสารที่ต้องเตรียม',
  step: 'ขั้นตอน',
  remember: 'ข้อมูลที่ต้องจำ',
}

export const KIND_ORDER: RequirementKind[] = ['before_go', 'document', 'step', 'remember']
