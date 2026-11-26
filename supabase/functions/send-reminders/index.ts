// Daily exam reminders by web push.
// Sends each verified notice twice: 3 days before its date and on the day before.
// Schedule it once a day (e.g. 08:00 Bangladesh time) with Supabase scheduled functions / pg_cron.
// Secrets (Supabase dashboard, never the client): VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT,
// plus the built-in SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
import { createClient } from 'npm:@supabase/supabase-js@2.45.4'
import webpush from 'npm:web-push@3.6.7'

const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
webpush.setVapidDetails(Deno.env.get('VAPID_SUBJECT') ?? 'mailto:admin@example.org', Deno.env.get('VAPID_PUBLIC_KEY')!, Deno.env.get('VAPID_PRIVATE_KEY')!)

// Bangladesh is UTC+6 all year.
function bdDate(offsetDays: number) {
  const d = new Date(Date.now() + 6 * 3600_000 + offsetDays * 86_400_000)
  return d.toISOString().slice(0, 10)
}

Deno.serve(async (req) => {
  // Only the scheduler (service role) may trigger sends.
  if (req.headers.get('Authorization') !== `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`) return new Response('forbidden', { status: 403 })
  const windows = [{ kind: 'd3', date: bdDate(3) }, { kind: 'd1', date: bdDate(1) }]
  let sent = 0, removed = 0
  for (const w of windows) {
    const { data: notices } = await sb.from('notices').select('id, title_bn, title_en, event_date, board').eq('verified', true).eq('event_date', w.date)
    for (const n of notices ?? []) {
      const { error: dup } = await sb.from('notice_pushes').insert({ notice_id: n.id, kind: w.kind })
      if (dup) continue // already sent
      // Students on the notice's boards (all students when it has none).
      const { data: all } = await sb.from('push_subscriptions').select('endpoint, p256dh, auth, lang, user_id')
      let subs = all ?? []
      if (n.board?.length && subs.length) {
        const { data: profs } = await sb.from('profiles').select('id, board').in('id', [...new Set(subs.map((s) => s.user_id))])
        const ok = new Set((profs ?? []).filter((p) => n.board.includes(p.board)).map((p) => p.id))
        subs = subs.filter((s) => ok.has(s.user_id))
      }
      for (const s of subs) {
        const bn = s.lang === 'bn'
        const when = w.kind === 'd1' ? (bn ? 'আগামীকাল' : 'Tomorrow') : (bn ? '৩ দিন পর' : 'In 3 days')
        const payload = JSON.stringify({ title: bn ? n.title_bn : n.title_en, body: when, url: './notices', lang: s.lang, tag: `notice-${n.id}` })
        try {
          await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload, { TTL: 86_400 })
          sent++
        } catch (e) {
          const code = (e as { statusCode?: number }).statusCode
          if (code === 404 || code === 410) { await sb.from('push_subscriptions').delete().eq('endpoint', s.endpoint); removed++ }
        }
      }
    }
  }
  return Response.json({ sent, removed })
})
