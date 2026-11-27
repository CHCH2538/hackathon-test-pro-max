import 'server-only'
import type { SafeErrorBody, SafeErrorCode } from '@/lib/contracts'
import { log } from './log'

export class AppError extends Error {
  readonly code: SafeErrorCode
  readonly status: number
  readonly retryAfterSec?: number

  constructor(code: SafeErrorCode, status: number, opts: { cause?: unknown; retryAfterSec?: number } = {}) {
    super(code, opts.cause === undefined ? undefined : { cause: opts.cause })
    this.name = 'AppError'
    this.code = code
    this.status = status
    if (opts.retryAfterSec !== undefined) this.retryAfterSec = opts.retryAfterSec
  }
}

export const SAFE_MESSAGES_TH: Readonly<Record<SafeErrorCode, string>> = {
  bad_request: 'ข้อมูลที่ส่งมาไม่ถูกต้อง กรุณาตรวจสอบแล้วลองอีกครั้ง',
  unauthorized: 'กรุณาเข้าสู่ระบบหรือเปิดลิงก์ใหม่อีกครั้ง',
  forbidden: 'คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้',
  not_found: 'ไม่พบข้อมูลที่ต้องการ หรือข้อมูลหมดอายุแล้ว',
  conflict: 'ข้อมูลมีการเปลี่ยนแปลง กรุณาโหลดหน้าใหม่แล้วลองอีกครั้ง',
  rate_limited: 'มีการใช้งานถี่เกินไป กรุณารอสักครู่แล้วลองใหม่',
  upstream_unavailable: 'บริการภายนอกขัดข้องชั่วคราว กรุณาลองใหม่ภายหลัง',
  not_implemented: 'ฟีเจอร์นี้ยังไม่เปิดให้ใช้งาน',
  not_configured: 'ระบบยังตั้งค่าไม่ครบ กรุณาลองใหม่ภายหลัง',
  internal: 'เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่อีกครั้ง',
}

export function toSafeResponse(err: unknown): Response {
  if (err instanceof AppError) {
    const body: SafeErrorBody = { error: err.code, messageTh: SAFE_MESSAGES_TH[err.code] }
    const headers = new Headers()
    if (err.retryAfterSec !== undefined) {
      body.retryAfterSec = err.retryAfterSec
      headers.set('Retry-After', String(Math.max(0, Math.ceil(err.retryAfterSec))))
    }
    return Response.json(body, { status: err.status, headers })
  }
  log.error('unhandled_error', { name: err instanceof Error ? err.name : typeof err })
  const body: SafeErrorBody = { error: 'internal', messageTh: SAFE_MESSAGES_TH.internal }
  return Response.json(body, { status: 500 })
}
