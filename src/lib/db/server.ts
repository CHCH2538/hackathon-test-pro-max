import 'server-only'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { AppError } from '@/lib/security/errors'
import type { Database } from './database.types'

let serviceClient: SupabaseClient<Database> | undefined
let catalogClient: SupabaseClient<Database> | undefined

function build(url: string | undefined, key: string | undefined): SupabaseClient<Database> {
  if (!url || !key) throw new AppError('not_configured', 503)
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })
}

export function createServiceClient(): SupabaseClient<Database> {
  serviceClient ??= build(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY)
  return serviceClient
}

export function createCatalogClient(): SupabaseClient<Database> {
  catalogClient ??= build(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  )
  return catalogClient
}
