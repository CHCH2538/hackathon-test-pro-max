import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

let browserClient: SupabaseClient<Database> | undefined

export function createBrowserClient(): SupabaseClient<Database> {
  if (browserClient) return browserClient
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) throw new Error('not_configured')
  browserClient = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })
  return browserClient
}
