import { getSupabase, supabaseConfigured } from './supabase'

const VAPID = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined

/** Push needs a service worker, the Push API, a server key and a signed-in account. */
export function pushAvailable() {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window && !!VAPID && supabaseConfigured
}

function keyBytes(b64: string) {
  const s = atob((b64 + '='.repeat((4 - (b64.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/'))
  return Uint8Array.from(s, (c) => c.charCodeAt(0))
}

export async function currentSubscription() {
  if (!pushAvailable()) return null
  const reg = await navigator.serviceWorker.ready
  return reg.pushManager.getSubscription()
}

/** Ask permission, subscribe, and store the subscription for this account. */
export async function enablePush(lang: string): Promise<'on' | 'denied' | 'signin' | 'error'> {
  if (!pushAvailable()) return 'error'
  const sb = await getSupabase()
  const { data } = await sb!.auth.getUser()
  if (!data.user) return 'signin'
  if ((await Notification.requestPermission()) !== 'granted') return 'denied'
  try {
    const reg = await navigator.serviceWorker.ready
    const sub = (await reg.pushManager.getSubscription()) ?? await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(VAPID!) })
    const j = sub.toJSON()
    const { error } = await sb!.from('push_subscriptions').upsert({
      endpoint: j.endpoint, p256dh: j.keys?.p256dh, auth: j.keys?.auth, user_id: data.user.id, lang,
    }, { onConflict: 'endpoint' })
    return error ? 'error' : 'on'
  } catch { return 'error' }
}

export async function disablePush() {
  const sub = await currentSubscription()
  if (!sub) return
  const sb = await getSupabase()
  await sb?.from('push_subscriptions').delete().eq('endpoint', sub.endpoint)
  await sub.unsubscribe()
}
