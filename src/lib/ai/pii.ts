export type PiiKind = 'id13' | 'phone' | 'account' | 'email' | 'coords'

const THAI_DIGIT = /[๐-๙]/g
const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g
const COORDS = /-?\d{1,3}\.\d{3,}\s*,\s*-?\d{1,3}\.\d{3,}/g
const DIGIT_RUN = /\+?\d(?:[\d\s.-]*\d)?/g

export function maskPii(input: string): { text: string; counts: Record<PiiKind, number> } {
  const counts: Record<PiiKind, number> = { id13: 0, phone: 0, account: 0, email: 0, coords: 0 }
  let t = input.replace(THAI_DIGIT, (d) => String(d.charCodeAt(0) - 0x0e50))
  t = t.replace(EMAIL, () => (counts.email++, '[อีเมล]'))
  t = t.replace(COORDS, () => (counts.coords++, '[พิกัด]'))
  t = t.replace(DIGIT_RUN, (run) => {
    const digits = run.replace(/\D/g, '')
    if (digits.length < 9) return run
    if (digits.length === 13) return (counts.id13++, '[เลขบัตร]')
    if (run.startsWith('+66') || (digits.startsWith('0') && digits.length <= 10))
      return (counts.phone++, '[เบอร์โทร]')
    return (counts.account++, '[เลขบัญชี]')
  })
  return { text: t, counts }
}
