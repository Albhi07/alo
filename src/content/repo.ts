import { useLiveQuery } from 'dexie-react-hooks'
import { db, kvGet, kvSet } from '../db'
import type { Medium } from '../data/catalog'
import type { ChapterPack, ContentIndex } from '../data/content-types'
import { supabaseConfigured } from '../lib/supabase'
import { staticSource, supabaseSource, type ContentSource } from './source'

/**
 * Students always read content from IndexedDB, so every screen works offline.
 * This module refreshes that cache from the content source when online.
 */

export function activeSource(): ContentSource {
  return supabaseConfigured ? supabaseSource : staticSource
}

/** Content edited in the local admin CMS must not be overwritten by a refresh. */
async function localCmsMode() {
  return kvGet('cms.local', false)
}

let refreshing: Promise<boolean> | null = null

/** Fetch the content index (subjects, chapters, exam data). Returns true if it changed. */
export function refreshIndex(source = activeSource()): Promise<boolean> {
  refreshing ??= (async () => {
    try {
      if (await localCmsMode()) return false
      const idx = await source.index()
      const current = await kvGet<string>('content.index_version', '')
      if (idx.version === current) return false
      await applyIndex(idx)
      return true
    } finally {
      refreshing = null
    }
  })()
  return refreshing
}

export async function applyIndex(idx: ContentIndex) {
  await db.transaction('rw', [db.c_subjects, db.c_chapters, db.c_notices, db.kv], async () => {
    await db.c_subjects.clear()
    await db.c_subjects.bulkPut(idx.subjects)
    await db.c_chapters.clear()
    await db.c_chapters.bulkPut(idx.chapters)
    await db.c_notices.clear()
    await db.c_notices.bulkPut(idx.notices)
    await kvSet('exam.config', idx.exam_config.find((c) => c.status !== 'done') ?? idx.exam_config[idx.exam_config.length - 1])
    await kvSet('exam.all_configs', idx.exam_config)
    await kvSet('exam.routine', idx.routine)
    await kvSet('content.packs', idx.packs)
    await kvSet('content.index_version', idx.version)
  })
}

/** Store a chapter pack in IndexedDB, replacing that chapter+medium's previous rows. */
export async function applyPack(pack: ChapterPack, pinned: boolean) {
  const key = `${pack.chapter_id}.${pack.medium}`
  await db.transaction('rw', [db.c_lessons, db.c_scenes, db.c_questions, db.c_method_sheets, db.c_drills, db.c_packs], async () => {
    const oldLessons = await db.c_lessons.where('[chapter_id+medium]').equals([pack.chapter_id, pack.medium]).primaryKeys()
    await db.c_scenes.where('lesson_id').anyOf(oldLessons).delete()
    await db.c_lessons.bulkDelete(oldLessons)
    await db.c_questions.where('[chapter_id+medium]').equals([pack.chapter_id, pack.medium]).delete()
    await db.c_method_sheets.where('chapter_id').equals(pack.chapter_id).filter((m) => m.medium === pack.medium).delete()
    await db.c_drills.where('chapter_id').equals(pack.chapter_id).delete()
    await db.c_lessons.bulkPut(pack.lessons.map(({ scenes: _s, ...l }) => l))
    await db.c_scenes.bulkPut(pack.lessons.flatMap((l) => l.scenes))
    await db.c_questions.bulkPut(pack.questions)
    await db.c_method_sheets.bulkPut(pack.method_sheets)
    await db.c_drills.bulkPut(pack.drill_templates)
    const prev = await db.c_packs.get(key)
    await db.c_packs.put({
      key, chapter_id: pack.chapter_id, medium: pack.medium, version: pack.version,
      bytes: new Blob([JSON.stringify(pack)]).size, pinned: pinned || !!prev?.pinned, fetched_at: new Date().toISOString(),
      audio_bytes: prev?.audio_bytes,
    })
  })
}

/** Make sure a chapter's content is cached; fetches it when online and missing or stale. */
export async function ensureChapter(chapterId: string, medium: Medium, opts: { pin?: boolean; force?: boolean; source?: ContentSource } = {}) {
  if (await localCmsMode()) return
  const key = `${chapterId}.${medium}`
  const have = await db.c_packs.get(key)
  const packs = await kvGet<ContentIndex['packs']>('content.packs', {})
  const want = packs[chapterId]?.[medium]?.version
  if (have && (!want || have.version === want) && !opts.pin && !opts.force) return
  if (!navigator.onLine) return
  const pack = await (opts.source ?? activeSource()).chapterPack(chapterId, medium)
  await applyPack(pack, !!opts.pin)
}

// ------------------------------------------------------------------ hooks

export function useSubjectsMap() {
  return useLiveQuery(async () => new Map((await db.c_subjects.toArray()).map((s) => [s.code, s])), [])
}

export function useChapters(subjectCode: string | undefined) {
  return useLiveQuery(
    () => (subjectCode ? db.c_chapters.where('subject_code').equals(subjectCode).sortBy('sort') : []),
    [subjectCode],
  )
}

export function useChapter(id: string | undefined) {
  return useLiveQuery(() => (id ? db.c_chapters.get(id) : undefined), [id])
}

export function usePackInfo() {
  return useLiveQuery(() => kvGet<ContentIndex['packs']>('content.packs', {}), [], {} as ContentIndex['packs'])
}

export function useChapterContent(chapterId: string | undefined, medium: Medium) {
  return useLiveQuery(async () => {
    if (!chapterId) return undefined
    const [lessons, questions, sheets, pack] = await Promise.all([
      db.c_lessons.where('[chapter_id+medium]').equals([chapterId, medium]).sortBy('sort'),
      db.c_questions.where('[chapter_id+medium]').equals([chapterId, medium]).toArray(),
      db.c_method_sheets.where('chapter_id').equals(chapterId).filter((m) => m.medium === medium).toArray(),
      db.c_packs.get(`${chapterId}.${medium}`),
    ])
    return { lessons, questions, sheets, pack }
  }, [chapterId, medium])
}
