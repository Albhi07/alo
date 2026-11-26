import { useLiveQuery } from 'dexie-react-hooks'
import { db, kvGet, kvSet } from '../db'
import { getSupabase } from '../lib/supabase'
import { uuid } from '../lib/id'
import type { Marking } from '../../supabase/functions/_shared/tutor-logic'

export type { Marking }

/** One line of the conversation as kept on this device (the server keeps the full record). */
export interface TutorLine { role: 'user' | 'assistant'; text: string; marking?: Marking | null; photo?: boolean; at: number }
export interface TutorConversation { thread_id: string | null; subject_code: string | null; lines: TutorLine[] }
export interface TutorQuota { messages_left: number; photos_left: number }

export type TutorError = 'sign_in' | 'offline' | 'not_configured' | 'limit' | 'exam_hours' | 'busy' | 'model' | 'network' | 'too_long' | 'bad_photo' | 'server'

const KEY = 'tutor.conversation'
const QUOTA_KEY = 'tutor.quota'
const empty: TutorConversation = { thread_id: null, subject_code: null, lines: [] }

export function useConversation(): TutorConversation | undefined {
  return useLiveQuery(async () => ((await db.kv.get(KEY))?.value as TutorConversation | undefined) ?? empty, [])
}
export function useQuota(): TutorQuota | null | undefined {
  return useLiveQuery(async () => ((await db.kv.get(QUOTA_KEY))?.value as { day: string; q: TutorQuota } | undefined)?.q ?? null, [])
}

export async function newConversation(subject_code: string | null = null) {
  await kvSet(KEY, { ...empty, subject_code })
}

async function append(lines: TutorLine[], patch: Partial<TutorConversation> = {}) {
  const c = await kvGet<TutorConversation>(KEY, empty)
  await kvSet(KEY, { ...c, ...patch, lines: [...c.lines, ...lines].slice(-60) })
}

const bdDay = () => new Date(Date.now() + 6 * 3600_000).toISOString().slice(0, 10)

/** Today's remaining quota, from the server when signed in. */
export async function refreshQuota(limits = { messages: 20, photos: 5 }) {
  const sb = await getSupabase()
  if (!sb) return
  const { data: s } = await sb.auth.getSession()
  if (!s.session) return
  const { data } = await sb.from('tutor_usage').select('messages, photos').eq('day', bdDay()).maybeSingle()
  await kvSet(QUOTA_KEY, { day: bdDay(), q: { messages_left: Math.max(0, limits.messages - (data?.messages ?? 0)), photos_left: Math.max(0, limits.photos - (data?.photos ?? 0)) } })
}

interface TutorResponse { thread_id: string; reply: string; marking: Marking | null; messages_left: number; photos_left: number }

async function call(body: Record<string, unknown>): Promise<TutorResponse | { error: TutorError }> {
  if (!navigator.onLine) return { error: 'offline' }
  const sb = await getSupabase()
  if (!sb) return { error: 'not_configured' }
  const { data: s } = await sb.auth.getSession()
  if (!s.session) return { error: 'sign_in' }
  const { data, error } = await sb.functions.invoke<TutorResponse>('tutor', { body })
  if (error) {
    const res = (error as { context?: Response }).context
    if (res && typeof res.json === 'function') {
      const j = (await res.json().catch(() => null)) as { error?: string; messages_left?: number; photos_left?: number } | null
      if (j?.error === 'limit') await kvSet(QUOTA_KEY, { day: bdDay(), q: { messages_left: j.messages_left ?? 0, photos_left: j.photos_left ?? 0 } })
      const known: TutorError[] = ['sign_in', 'limit', 'exam_hours', 'busy', 'model', 'too_long', 'bad_photo']
      return { error: known.includes(j?.error as TutorError) ? (j!.error as TutorError) : 'server' }
    }
    return { error: 'network' }
  }
  if (!data) return { error: 'server' }
  await kvSet(QUOTA_KEY, { day: bdDay(), q: { messages_left: data.messages_left, photos_left: data.photos_left } })
  return data
}

/** Ask the tutor. The question shows straight away; the reply is added when it arrives. */
export async function ask(text: string, lang: 'bn' | 'en', subject_code: string | null): Promise<TutorError | null> {
  const c = await kvGet<TutorConversation>(KEY, empty)
  await append([{ role: 'user', text, at: Date.now() }], { subject_code: c.subject_code ?? subject_code })
  const r = await call({ mode: 'chat', text, lang, thread_id: c.thread_id ?? undefined, subject_code: subject_code ?? undefined })
  if ('error' in r) { await dropLastUser(); return r.error }
  await append([{ role: 'assistant', text: r.reply, at: Date.now() }], { thread_id: r.thread_id })
  return null
}

/** Remove the question again when it failed, so the student can resend it. */
async function dropLastUser() {
  const c = await kvGet<TutorConversation>(KEY, empty)
  if (c.lines[c.lines.length - 1]?.role === 'user') await kvSet(KEY, { ...c, lines: c.lines.slice(0, -1) })
}

/** Shrink a photo to at most 1600 px on the long side as JPEG: readable handwriting, small upload. */
export async function compressPhoto(file: Blob, maxSide = 1600): Promise<Blob> {
  const bmp = await createImageBitmap(file)
  const scale = Math.min(1, maxSide / Math.max(bmp.width, bmp.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bmp.width * scale)
  canvas.height = Math.round(bmp.height * scale)
  canvas.getContext('2d')!.drawImage(bmp, 0, 0, canvas.width, canvas.height)
  bmp.close()
  return new Promise((ok, bad) => canvas.toBlob((b) => (b ? ok(b) : bad(new Error('encode'))), 'image/jpeg', 0.8))
}

/** Upload a photo of a handwritten creative answer and have the tutor mark it. */
export async function markPhoto(file: Blob, o: { lang: 'bn' | 'en'; subject_code: string | null; question_id?: string; question_text?: string; label: string }): Promise<TutorError | null> {
  if (!navigator.onLine) return 'offline'
  const sb = await getSupabase()
  if (!sb) return 'not_configured'
  const { data: s } = await sb.auth.getSession()
  const uid = s.session?.user.id
  if (!uid) return 'sign_in'
  let img: Blob
  try { img = await compressPhoto(file) } catch { return 'bad_photo' }
  const path = `${uid}/${uuid()}.jpg`
  const up = await sb.storage.from('tutor-photos').upload(path, img, { contentType: 'image/jpeg', upsert: false })
  if (up.error) return 'network'
  const c = await kvGet<TutorConversation>(KEY, empty)
  await append([{ role: 'user', text: o.question_text || o.label, photo: true, at: Date.now() }])
  const r = await call({ mode: 'mark', image_path: path, lang: o.lang, thread_id: c.thread_id ?? undefined, subject_code: o.subject_code ?? undefined, question_id: o.question_id, question_text: o.question_text })
  if ('error' in r) { await dropLastUser(); return r.error }
  await append([{ role: 'assistant', text: r.marking ? '' : r.reply, marking: r.marking, at: Date.now() }], { thread_id: r.thread_id })
  return null
}
