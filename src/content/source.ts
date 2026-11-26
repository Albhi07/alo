import type { ChapterPack, ContentIndex, MockRow } from '../data/content-types'
import type { Medium } from '../data/catalog'
import { getSupabase } from '../lib/supabase'

/** Where content comes from: static packs shipped with the app, or the Supabase tables. */
export interface ContentSource {
  index(): Promise<ContentIndex>
  chapterPack(chapterId: string, medium: Medium): Promise<ChapterPack>
  mock(id: string): Promise<MockRow>
}

export const staticSource: ContentSource = {
  async index() {
    const r = await fetch(`${import.meta.env.BASE_URL}content/index.json`, { cache: 'no-cache' })
    if (!r.ok) throw new Error(`index ${r.status}`)
    return r.json()
  },
  async chapterPack(chapterId, medium) {
    const r = await fetch(`${import.meta.env.BASE_URL}content/chapters/${chapterId}.${medium}.json`)
    if (r.status === 404) return { chapter_id: chapterId, medium, version: 'empty', lessons: [], questions: [], method_sheets: [], drill_templates: [] }
    if (!r.ok) throw new Error(`pack ${r.status}`)
    return r.json()
  },
  async mock(id) {
    const r = await fetch(`${import.meta.env.BASE_URL}content/mocks/${id}.json`)
    if (!r.ok) throw new Error(`mock ${r.status}`)
    return r.json()
  },
}

/** Reads published content straight from Postgres (RLS limits it to published rows). */
export const supabaseSource: ContentSource = {
  async index() {
    const sb = (await getSupabase())!
    const [subjects, chapters, exam, routine, notices, lessons, questions, mocks] = await Promise.all([
      sb.from('subjects').select('*').order('sort'),
      sb.from('chapters').select('*').order('subject_code').order('sort'),
      sb.from('exam_config').select('*'),
      sb.from('routine').select('*').order('date'),
      sb.from('notices').select('*').order('event_date'),
      sb.from('lessons').select('chapter_id, medium, updated_at'),
      sb.from('questions').select('chapter_id, medium, kind, updated_at'),
      sb.from('mocks').select('id, subject_code, title, medium, exam_year, duration_mcq_min, duration_cq_min, published, updated_at'),
    ])
    for (const r of [subjects, chapters, exam, routine, notices, lessons, questions, mocks]) if (r.error) throw new Error(r.error.message)
    const packs: ContentIndex['packs'] = {}
    const touch = (cid: string, m: Medium, at: string, k?: 'lessons' | 'mcq' | 'cq') => {
      packs[cid] ??= {}
      const p = (packs[cid][m] ??= { version: '', bytes: 0, lessons: 0, mcq: 0, cq: 0 })
      if (at > p.version) p.version = at
      if (k) p[k]++
    }
    for (const l of lessons.data!) touch(l.chapter_id, l.medium, l.updated_at, 'lessons')
    for (const q of questions.data!) touch(q.chapter_id, q.medium, q.updated_at, q.kind === 'mcq' ? 'mcq' : q.kind === 'cq' ? 'cq' : undefined)
    const latest = [subjects, chapters, exam, routine, notices, mocks].flatMap((r) => (r.data as { updated_at: string }[]).map((x) => x.updated_at)).sort().pop() ?? ''
    return {
      version: latest, subjects: subjects.data!, chapters: chapters.data!, packs,
      exam_config: exam.data!, routine: routine.data!.map((r) => ({ ...r, start_time: String(r.start_time).slice(0, 5) })), notices: notices.data!,
      mocks: mocks.data!.map((m) => ({ ...m, version: m.updated_at, bytes: 0, mcq: 0, cq: 0 })),
    }
  },
  async chapterPack(chapterId, medium) {
    const sb = (await getSupabase())!
    const [lessons, questions, sheets, drills] = await Promise.all([
      sb.from('lessons').select('*, scenes:lesson_scenes(*)').eq('chapter_id', chapterId).eq('medium', medium).order('sort'),
      sb.from('questions').select('*').eq('chapter_id', chapterId).eq('medium', medium),
      sb.from('method_sheets').select('*').eq('chapter_id', chapterId).eq('medium', medium),
      sb.from('drill_templates').select('*').eq('chapter_id', chapterId),
    ])
    for (const r of [lessons, questions, sheets, drills]) if (r.error) throw new Error(r.error.message)
    const all = [...lessons.data!, ...questions.data!].map((x) => x.updated_at as string).sort()
    return {
      chapter_id: chapterId, medium, version: all.pop() ?? 'empty',
      lessons: lessons.data!.map((l) => ({ ...l, scenes: [...l.scenes].sort((a, b) => a.idx - b.idx) })),
      questions: questions.data!, method_sheets: sheets.data!, drill_templates: drills.data!,
    }
  },
  async mock(id) {
    const sb = (await getSupabase())!
    const { data, error } = await sb.from('mocks').select('*').eq('id', id).single()
    if (error) throw new Error(error.message)
    return data as MockRow
  },
}
