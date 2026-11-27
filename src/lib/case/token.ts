import 'server-only'
import { createHash, randomBytes } from 'node:crypto'
import type { CaseToken } from '@/lib/contracts'

export function newCaseToken(): CaseToken {
  return randomBytes(16).toString('base64url') as CaseToken
}

export function hashToken(token: string): Buffer {
  return createHash('sha256').update(token, 'utf8').digest()
}
