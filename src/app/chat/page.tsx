import { SlicePlaceholder } from '@/components/shell/SlicePlaceholder'
import { listServices } from '@/lib/catalog'
import { AppError } from '@/lib/security/errors'

export const dynamic = 'force-dynamic'

async function probe(): Promise<string> {
  try {
    const services = await listServices()
    return `listServices().length = ${services.length}`
  } catch (err) {
    return `listServices() failed: ${err instanceof AppError ? err.code : 'internal'}`
  }
}

export default async function ChatPage() {
  return <SlicePlaceholder spec="11-chat-triage" probe={await probe()} />
}
