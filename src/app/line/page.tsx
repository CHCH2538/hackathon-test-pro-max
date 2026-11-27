import { SlicePlaceholder } from '@/components/shell/SlicePlaceholder'

export const dynamic = 'force-dynamic'

const LINE_ENV = [
  'LINE_CHANNEL_SECRET',
  'LINE_CHANNEL_ACCESS_TOKEN',
  'LINE_LOGIN_CHANNEL_ID',
  'LINE_LOGIN_CHANNEL_SECRET',
  'NEXT_PUBLIC_LIFF_ID',
  'NEXT_PUBLIC_LINE_OA_BASIC_ID',
] as const

export default function LinePage() {
  const status = LINE_ENV.map((name) => ({ name, set: Boolean(process.env[name]) }))
  return (
    <SlicePlaceholder
      spec="21-line-oa"
      probe={
        <ul>
          {status.map(({ name, set }) => (
            <li key={name}>
              {name}: {set ? 'yes' : 'no'}
            </li>
          ))}
        </ul>
      }
    />
  )
}
