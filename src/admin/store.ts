import { db, kvGet, kvSet } from '../db'
import { getSupabase, supabaseConfigured } from '../lib/supabase'
import { activeSource, applyPack, refreshIndex } from '../content/repo'
import type { ContentIndex } from '../data/content-types'
import type { ExamConfig, RoutineRow } from '../data/exam'
import { uuid } from '../lib/id'

/**
 * The admin CMS writes through this store.
 * - remote: Supabase tables (RLS allows admins only), then the local cache is refreshed.
 * - local: no Supabase project yet. Edits live in this browser's content cache so they can
 *   be previewed in the student screens, and can be exported as JSON for the repo.
 */
export type AdminTable =
  | 'subjects' | 'chapters' | 'lessons' | 'lesson_scenes' | 'questions' | 'drill_templates'
  | 'method_sheets' | 'notices' | 'exam_config' | 'routine'

type Row = Record<string, unknown>

const LOCAL: Partial<Record<AdminTable, () => import('dexie').Table<Row, string>>> = {
  subjects: () => db.c_subjects as never,
  chapters: () => db.c_chapters as never,
  lessons: () => db.c_lessons as never,
  lesson_scenes: () => db.c_scenes as never,
  questions: () => db.c_questions as never,
  drill_templates: () => db.c_drills as never,
  method_sheets: () => db.c_method_sheets as never,
  notices: () => db.c_notices as never,
}
const KV_TABLES = { exam_config: 'exam.all_configs', routine: 'exam.routine' } as const

export const PK: Record<AdminTable, string> = {
  subjects: 'code', exam_config: 'exam_year', chapters: 'id', lessons: 'id', lesson_scenes: 'id', questions: 'id',
  drill_templates: 'id', method_sheets: 'id', notices: 'id', routine: 'id',
}

export interface AdminStore {
  mode: 'local' | 'remote'
  list(table: AdminTable): Promise<Row[]>
  save(table: AdminTable, row: Row): Promise<Row>
  remove(table: AdminTable, key: string | number): Promise<void>
  uploadAudio(path: string, file: Blob): Promise<string>
}

async function localList(table: AdminTable): Promise<Row[]> {
  if (table === 'exam_config' || table === 'routine') return kvGet<Row[]>(KV_TABLES[table], [])
  return LOCAL[table]!().toArray()
}

async function localPut(table: AdminTable, row: Row) {
  if (table === 'exam_config' || table === 'routine') {
    const pk = PK[table]
    const list = (await kvGet<Row[]>(KV_TABLES[table], [])).filter((r) => r[pk] !== row[pk])
    list.push(row)
    await kvSet(KV_TABLES[table], list)
    if (table === 'exam_config') {
      const cfgs = list as unknown as ExamConfig[]
      await kvSet('exam.config', cfgs.find((c) => c.status !== 'done') ?? cfgs[cfgs.length - 1])
    }
    return
  }
  await LOCAL[table]!().put(row)
}

async function localDelete(table: AdminTable, key: string | number) {
  if (table === 'exam_config' || table === 'routine') {
    const pk = PK[table]
    await kvSet(KV_TABLES[table], (await kvGet<Row[]>(KV_TABLES[table], [])).filter((r) => r[pk] !== key))
    return
  }
  await LOCAL[table]!().delete(key as string)
  if (table === 'lessons') await db.c_scenes.where('lesson_id').equals(key as string).delete()
}

function withDefaults(table: AdminTable, row: Row): Row {
  const out: Row = { ...row, updated_at: new Date().toISOString() }
  if (PK[table] === 'id' && !out.id) out.id = uuid()
  return out
}

export const localStore: AdminStore = {
  mode: 'local',
  list: localList,
  async save(table, row) {
    await kvSet('cms.local', true)
    const r = withDefaults(table, row)
    await localPut(table, r)
    return r
  },
  async remove(table, key) {
    await kvSet('cms.local', true)
    await localDelete(table, key)
  },
  async uploadAudio(path, file) {
    await kvSet('cms.local', true)
    await db.kv.put({ key: `audio:${path}`, value: file })
    return path
  },
}

export const remoteStore: AdminStore = {
  mode: 'remote',
  async list(table) {
    const sb = (await getSupabase())!
    const { data, error } = await sb.from(table).select('*').limit(5000)
    if (error) throw new Error(error.message)
    return data
  },
  async save(table, row) {
    const sb = (await getSupabase())!
    const r = withDefaults(table, row)
    delete r.search // generated column
    const { data, error } = await sb.from(table).upsert(r, { onConflict: PK[table] }).select().single()
    if (error) throw new Error(error.message)
    await localPut(table, data) // show the change straight away
    return data
  },
  async remove(table, key) {
    const sb = (await getSupabase())!
    const { error } = await sb.from(table).delete().eq(PK[table], key)
    if (error) throw new Error(error.message)
    await localDelete(table, key)
  },
  async uploadAudio(path, file) {
    const sb = (await getSupabase())!
    const { error } = await sb.storage.from('lesson-audio').upload(path, file, { upsert: true, contentType: file.type || 'audio/ogg' })
    if (error) throw new Error(error.message)
    return path
  },
}

export function adminStore(): AdminStore {
  return supabaseConfigured ? remoteStore : localStore
}

/** Local mode: pull every chapter pack (both versions) so all content can be edited. */
export async function loadAllForEditing() {
  if (!navigator.onLine) return
  if (!(await kvGet('cms.local', false))) await refreshIndex()
  const packs = await kvGet<ContentIndex['packs']>('content.packs', {})
  const src = activeSource()
  for (const [chapterId, media] of Object.entries(packs)) {
    for (const m of Object.keys(media) as ('bn' | 'en')[]) {
      if (await db.c_packs.get(`${chapterId}.${m}`)) continue
      await applyPack(await src.chapterPack(chapterId, m), false)
    }
  }
}

/** Throw away local edits and reload published content. */
export async function discardLocalEdits() {
  await kvSet('cms.local', false)
  await kvSet('content.index_version', '')
  await db.c_packs.clear()
  await refreshIndex()
}

/** Everything in the local content cache, in the same shape as public/content. */
export async function exportContent() {
  const [subjects, chapters, lessons, scenes, questions, sheets, drills, notices, exam_config, routine] = await Promise.all([
    db.c_subjects.toArray(), db.c_chapters.toArray(), db.c_lessons.toArray(), db.c_scenes.toArray(), db.c_questions.toArray(),
    db.c_method_sheets.toArray(), db.c_drills.toArray(), db.c_notices.toArray(),
    kvGet<ExamConfig[]>('exam.all_configs', []), kvGet<RoutineRow[]>('exam.routine', []),
  ])
  return {
    exported_at: new Date().toISOString(), subjects, chapters, exam_config, routine, notices,
    lessons: lessons.map((l) => ({ ...l, scenes: scenes.filter((s) => s.lesson_id === l.id).sort((a, b) => a.idx - b.idx) })),
    questions, method_sheets: sheets, drill_templates: drills,
  }
}
