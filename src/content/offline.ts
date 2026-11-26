import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import type { Medium } from '../data/catalog'
import { ensureChapter } from './repo'

/** Same cache name the service worker uses for /content/ (CacheFirst), so it serves these offline. */
export const CONTENT_CACHE = 'alo-content'
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined

/** Where a scene's narration lives: CMS draft in IndexedDB, bundled file, or Supabase Storage. */
export async function audioUrl(path: string): Promise<string> {
  const draft = await db.kv.get(`audio:${path}`)
  if (draft?.value instanceof Blob) return URL.createObjectURL(draft.value)
  if (path.startsWith('content/')) return `${import.meta.env.BASE_URL}${path}`
  return `${SUPABASE_URL}/storage/v1/object/public/lesson-audio/${path}`
}

async function chapterAudioUrls(chapterId: string, medium: Medium) {
  const lessons = await db.c_lessons.where('[chapter_id+medium]').equals([chapterId, medium]).primaryKeys()
  const scenes = await db.c_scenes.where('lesson_id').anyOf(lessons).toArray()
  const urls: string[] = []
  for (const s of scenes) if (s.audio_path && !(await db.kv.get(`audio:${s.audio_path}`))) urls.push(await audioUrl(s.audio_path))
  return urls
}

/** The maths fonts KaTeX needs, so formulas render offline too. */
function katexFontUrls(): string[] {
  const out = new Set<string>()
  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList
    try { rules = sheet.cssRules } catch { continue }
    for (const r of Array.from(rules)) {
      if (r instanceof CSSFontFaceRule && /KaTeX/.test(r.style.getPropertyValue('font-family'))) {
        const m = /url\(["']?([^"')]+\.woff2)["']?\)/.exec(r.style.getPropertyValue('src'))
        if (m) out.add(new URL(m[1], sheet.href ?? location.href).href)
      }
    }
  }
  return [...out]
}

export interface DownloadProgress { done: number; total: number }

/**
 * "Download for offline": lessons, MCQ and CQ packs into IndexedDB, narration audio and
 * maths fonts into Cache Storage. Safe to repeat: anything already cached is skipped.
 */
export async function downloadChapter(chapterId: string, medium: Medium, onProgress?: (p: DownloadProgress) => void) {
  // Pinned only at the end, so the chapter never shows as downloaded while audio is missing.
  await ensureChapter(chapterId, medium, { force: true })
  const cache = await caches.open(CONTENT_CACHE)
  const urls = [...(await chapterAudioUrls(chapterId, medium)), ...katexFontUrls()]
  let done = 0
  let bytes = 0
  onProgress?.({ done, total: urls.length })
  for (const url of urls) {
    let hit = await cache.match(url)
    if (!hit) {
      const res = await fetch(url, { mode: url.startsWith(location.origin) ? 'same-origin' : 'cors' })
      if (!res.ok) throw new Error(`${res.status} ${url}`)
      await cache.put(url, res.clone())
      hit = res
    }
    bytes += Number(hit.headers.get('content-length')) || (await hit.clone().blob()).size
    onProgress?.({ done: ++done, total: urls.length })
  }
  const key = `${chapterId}.${medium}`
  await db.c_packs.update(key, { pinned: true, audio_bytes: bytes })
}

/** Delete a downloaded chapter: its audio and its rows. It downloads again when opened online. */
export async function removeChapter(chapterId: string, medium: Medium) {
  const cache = await caches.open(CONTENT_CACHE)
  for (const url of await chapterAudioUrls(chapterId, medium)) await cache.delete(url)
  await db.transaction('rw', [db.c_lessons, db.c_scenes, db.c_questions, db.c_method_sheets, db.c_packs], async () => {
    const lessons = await db.c_lessons.where('[chapter_id+medium]').equals([chapterId, medium]).primaryKeys()
    await db.c_scenes.where('lesson_id').anyOf(lessons).delete()
    await db.c_lessons.bulkDelete(lessons)
    await db.c_questions.where('[chapter_id+medium]').equals([chapterId, medium]).delete()
    await db.c_method_sheets.where('chapter_id').equals(chapterId).filter((x) => x.medium === medium).delete()
    await db.c_packs.delete(`${chapterId}.${medium}`)
  })
}

export function useDownloads() {
  return useLiveQuery(async () => (await db.c_packs.toArray()).filter((p) => p.pinned), [], [])
}

export async function storageEstimate(): Promise<{ usage: number; quota: number } | null> {
  if (!navigator.storage?.estimate) return null
  const e = await navigator.storage.estimate()
  return { usage: e.usage ?? 0, quota: e.quota ?? 0 }
}

/** Ask the browser not to evict downloads when space runs low. */
export async function requestPersistence() {
  try { if (navigator.storage?.persist && !(await navigator.storage.persisted())) await navigator.storage.persist() } catch { /* ignore */ }
}
