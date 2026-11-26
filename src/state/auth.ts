import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { adoptGuestRows, flush } from '../db/sync'
import { getSupabase, supabaseConfigured, supabaseRemote } from '../lib/supabase'

export function useUserId(): string | null | undefined {
  return useLiveQuery(async () => ((await db.kv.get('auth.user_id'))?.value as string | undefined) ?? null, [])
}

let started = false

/** Start auth listening and background sync. Never blocks first paint. */
export function startAuthAndSync() {
  if (started || !supabaseConfigured) return
  started = true
  const kick = () => { void syncNow() }
  // Defer supabase-js until the browser is idle.
  const idle = (cb: () => void) => ('requestIdleCallback' in window ? requestIdleCallback(cb, { timeout: 4000 }) : setTimeout(cb, 1500))
  idle(async () => {
    const sb = await getSupabase()
    if (!sb) return
    sb.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await adoptGuestRows(session.user.id)
        await pullProfile()
        kick()
      }
    })
    const { data } = await sb.auth.getSession()
    if (data.session?.user) {
      await adoptGuestRows(data.session.user.id)
      await pullProfile()
    }
    kick()
  })
  window.addEventListener('online', kick)
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') kick() })
  setInterval(kick, 60_000)
}

export async function syncNow() {
  if (!navigator.onLine) return
  const sb = await getSupabase()
  if (!sb) return
  const { data } = await sb.auth.getSession()
  if (!data.session) return
  await flush(supabaseRemote(sb))
  // Keep the summary that linked parents and class teachers see up to date (skipped when unchanged).
  await import('./connect').then((m) => m.publishSummary()).catch(() => undefined)
}

export async function signOut() {
  const sb = await getSupabase()
  await sb?.auth.signOut()
  await db.kv.delete('auth.user_id')
}

/** Bangladeshi mobile: 01XXXXXXXXX (11 digits, operator digit 3-9) to E.164. */
export function normaliseBdPhone(input: string): string | null {
  const d = input.replace(/[০-৯]/g, (c) => String('০১২৩৪৫৬৭৮৯'.indexOf(c))).replace(/\D/g, '')
  const local = d.startsWith('880') ? d.slice(2) : d
  return /^01[3-9]\d{8}$/.test(local) ? `+88${local}` : null
}

/**
 * Bring down the server copy of the profile. The server decides `role` (only admins can
 * change it); other fields follow last-write-wins like everything else.
 */
export async function pullProfile() {
  const sb = await getSupabase()
  const uid = ((await db.kv.get('auth.user_id'))?.value as string | undefined) ?? null
  if (!sb || !uid || !navigator.onLine) return
  const { data } = await sb.from('profiles').select('*').eq('id', uid).maybeSingle()
  if (!data) return
  const local = await db.profiles.get(uid)
  const merged = !local || data.updated_at > local.updated_at ? { ...local, ...data } : { ...local, role: data.role }
  delete (merged as Record<string, unknown>).user_id
  await db.profiles.put({ ...merged, user_id: uid })
}
