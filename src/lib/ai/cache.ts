import 'server-only'
import type { Json } from '@/lib/db/database.types'
import { createServiceClient } from '@/lib/db/server'
import { AppError } from '@/lib/security/errors'
import { log } from '@/lib/security/log'
const CACHE_KEY = /^[a-z0-9][a-z0-9:._-]{0,199}$/
export async function cachedAnswer<T>(key: string, ttlSec: number, compute: () => Promise<T>): Promise<T> {
  if (!CACHE_KEY.test(key) || !(ttlSec > 0)) throw new AppError('internal', 500)
  const db = createServiceClient()
  try {
    const { data, error } = await db
      .from('cache_entries')
      .select('value')
      .eq('key', key)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle()
    if (error) log.warn('cache_read_failed', { code: error.code })
    else if (data) return data.value as T
  } catch (err) {
    log.warn('cache_read_failed', { error: err instanceof Error ? err.name : typeof err })
  }
  const value = await compute()
  try {
    const { error } = await db.from('cache_entries').upsert({
      key,
      value: value as Json,
      expires_at: new Date(Date.now() + ttlSec * 1000).toISOString(),
    })
    if (error) log.warn('cache_write_failed', { code: error.code })
  } catch (err) {
    log.warn('cache_write_failed', { error: err instanceof Error ? err.name : typeof err })
  }
  return value
}
