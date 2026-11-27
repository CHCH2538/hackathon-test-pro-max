import 'server-only'
import { checkLink } from '@/lib/security/links'
import { maskPii } from './pii'

export const MAX_USER_CHARS = 500

const INVISIBLE = /[\u200b-\u200d\u2060\ufeff]/g
const URL_RUN = /https?:\/\/[A-Za-z0-9\-._~:/?#@!$&*+,;=%']+/gi
const TRAILING_PUNCT = /[.,;:!?']+$/

export function guardInput(
  raw: string,
): { ok: true; text: string; masked: number } | { ok: false; reason: 'empty' | 'too_long' } {
  const t = raw.normalize('NFC').replace(INVISIBLE, '').trim()
  if (t.length === 0) return { ok: false, reason: 'empty' }
  if (t.length > MAX_USER_CHARS) return { ok: false, reason: 'too_long' }
  const { text, counts } = maskPii(t)
  const masked = Object.values(counts).reduce((a, b) => a + b, 0)
  return { ok: true, text, masked }
}

export function wrapUserText(text: string): string {
  return `<user_input>\n${text.replace(/</g, '‹').replace(/>/g, '›')}\n</user_input>`
}

export function sanitizeLlmText(text: string): { text: string; removedLinks: number } {
  let removedLinks = 0
  const out = text.replace(URL_RUN, (match) => {
    const tail = TRAILING_PUNCT.exec(match)?.[0] ?? ''
    const url = match.slice(0, match.length - tail.length)
    if (checkLink(url).ok) return match
    removedLinks++
    return tail
  })
  return { text: out, removedLinks }
}
