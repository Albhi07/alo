import type { SupabaseClient } from '@supabase/supabase-js'
import type { Remote } from '../db/sync'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const supabaseConfigured = Boolean(url && anon)

let client: Promise<SupabaseClient | null> | null = null

/** supabase-js is loaded on demand so it never weighs on first load. */
export function getSupabase(): Promise<SupabaseClient | null> {
  if (!supabaseConfigured) return Promise.resolve(null)
  client ??= import('@supabase/supabase-js').then(({ createClient }) =>
    createClient(url!, anon!, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }),
  )
  return client
}

export function supabaseRemote(sb: SupabaseClient): Remote {
  return {
    async upsert(table, rows) {
      const { error } = await sb.from(table).upsert(rows, { onConflict: 'id' })
      if (error) throw new Error(error.message)
    },
  }
}
