import { useLiveQuery } from 'dexie-react-hooks'
import { db, kvGet } from '../db'
import type { MockSummary } from '../data/content-types'
import { predictGpa, readiness, spreadFor, type SubjectScore } from '../lib/grading'
import { resultPct, type MockResultRow } from './mock'
import { subjectsFor } from './profile'
import type { LocalProfile as Profile } from '../db'
import type { AttemptRow } from './practice'

export interface SubjectReadiness {
  code: string
  fourth: boolean
  score: number | null
  parts: { mock: number | null; mastery: number; drill: number | null } | null
  mocksTaken: number
  mockAvailable: boolean
  /** Weakest chapters that matter most (low mastery, often asked). */
  focus: { id: string; title_bn: string; title_en: string }[]
}

export interface ReadinessSummary {
  subjects: SubjectReadiness[]
  gpa: { low: number; mid: number; high: number; fail: boolean; counted: number; total: number } | null
}

/** Accuracy over a template's last 10 attempts. */
const DRILL_WINDOW = 10

export async function computeReadiness(profile: Profile): Promise<ReadinessSummary> {
  const subjects = subjectsFor(profile)
  const [chapters, masteryRows, results, drills, attempts, mockList] = await Promise.all([
    db.c_chapters.toArray(),
    db.mastery.toArray(),
    db.mock_results.toArray() as unknown as Promise<(MockResultRow & { deleted?: boolean; max_total?: number; mcq_max?: number })[]>,
    db.c_drills.toArray(),
    db.attempts.where('drill_template_id').above('').toArray() as unknown as Promise<AttemptRow[]>,
    kvGet<MockSummary[]>('content.mocks', []),
  ])
  const mastery = new Map<string, number>()
  for (const m of masteryRows.sort((a, b) => String(a.updated_at).localeCompare(String(b.updated_at)))) mastery.set(m.chapter_id as string, Number(m.score) || 0)

  const out: SubjectReadiness[] = subjects.map(({ code, fourth }) => {
    const chs = chapters.filter((c) => c.subject_code === code)
    const mine = results
      .filter((r) => !r.deleted && r.subject_code === code)
      .sort((a, b) => String(b.submitted_at ?? b.started_at).localeCompare(String(a.submitted_at ?? a.started_at)))
    const pcts = mine.map(resultPct).filter((x): x is number => x !== null)
    const chIds = new Set(chs.map((c) => c.id))
    const drillScores = drills.filter((d) => chIds.has(d.chapter_id)).map((d) => {
      const tries = attempts.filter((a) => a.drill_template_id === d.id).sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, DRILL_WINDOW)
      return tries.length ? (100 * tries.filter((a) => a.correct).length) / tries.length : 0
    })
    const mockAvailable = mockList.some((m) => m.subject_code === code)
    const r = readiness({
      mocks: pcts, mockAvailable,
      chapters: chs.map((c) => ({ mastery: mastery.get(c.id) ?? 0, boardFreq: c.board_freq_5y })),
      drills: drillScores,
    })
    const focus = [...chs]
      .sort((a, b) => ((mastery.get(a.id) ?? 0) - (mastery.get(b.id) ?? 0)) || (b.board_freq_5y - a.board_freq_5y) || (a.sort - b.sort))
      .slice(0, 2)
      .map((c) => ({ id: c.id, title_bn: c.title_bn, title_en: c.title_en }))
    return { code, fourth, score: r?.score ?? null, parts: r?.parts ?? null, mocksTaken: pcts.length, mockAvailable, focus }
  })

  const known = out.filter((s) => s.score !== null)
  if (!known.length) return { subjects: out, gpa: null }
  // The range uses each subject's own uncertainty: wider until timed mocks are taken.
  const at = (shift: -1 | 0 | 1) => predictGpa(out.map((s): SubjectScore => ({
    code: s.code, fourth: s.fourth, score: s.score === null ? null : s.score + shift * spreadFor(s.mocksTaken),
  })))
  const mid = at(0)
  return { subjects: out, gpa: { low: at(-1).gpa, mid: mid.gpa, high: at(1).gpa, fail: mid.fail, counted: mid.counted, total: mid.total } }
}

export function useReadiness(profile: Profile | null | undefined) {
  return useLiveQuery(
    async () => (profile ? computeReadiness(profile) : undefined),
    [profile],
  )
}
