import { useLiveQuery } from 'dexie-react-hooks'
import { db, kvGet, kvSet } from '../db'
import { saveLocal } from '../db/sync'
import type { MockRow } from '../data/content-types'
import { uuid } from '../lib/id'
import { logEvent } from './events'

/**
 * A running mock exam. Only start times are stored (never a ticking counter), so the
 * timer is right after the app is closed, the phone sleeps or the tab is reloaded.
 * The MCQ part auto-submits at its deadline and the CQ part starts from that moment;
 * the CQ part auto-submits at its own deadline and moves on to self-marking.
 */
export interface MockSession {
  result_id: string
  mock_id: string
  subject_code: string
  phase: 'mcq' | 'cq' | 'mark'
  started_at: number
  cq_started_at: number | null
  submitted_at: number | null
  mcq_minutes: number
  cq_minutes: number
  mcq_answers: Record<string, number>
  /** CQs the student answered on paper. */
  cq_chosen: string[]
  /** Self-marking: cq id -> part -> indexes of rubric points earned. */
  cq_marks: Record<string, Record<string, number[]>>
  mcq_score: number | null
}

export interface MockResultRow {
  id: string; user_id: string | null; mock_id: string; subject_code: string
  mcq_score: number | null; cq_score: number | null; practical_score: number | null; total: number | null
  self_marked: boolean; ai_marked: boolean; started_at: string; submitted_at: string | null
  created_at: string; updated_at: string
}

const KEY = 'mock.active'
const iso = (ms: number) => new Date(ms).toISOString()

export const getSession = () => kvGet<MockSession | null>(KEY, null)
const put = (s: MockSession | null) => kvSet(KEY, s)

export function useSession() {
  return useLiveQuery(() => getSession(), [], undefined as MockSession | null | undefined)
}

export async function startMock(mock: MockRow, now = Date.now()): Promise<MockSession> {
  const s: MockSession = {
    result_id: uuid(), mock_id: mock.id, subject_code: mock.subject_code, phase: 'mcq',
    started_at: now, cq_started_at: null, submitted_at: null,
    mcq_minutes: mock.duration_mcq_min, cq_minutes: mock.duration_cq_min,
    mcq_answers: {}, cq_chosen: [], cq_marks: {}, mcq_score: null,
  }
  await put(s)
  await logEvent('mock_started', { mock_id: mock.id })
  return s
}

export async function update(fn: (s: MockSession) => MockSession | void) {
  const s = await getSession()
  if (!s) return null
  const copy = structuredClone(s)
  const next = fn(copy) ?? copy
  await put(next)
  return next
}

export const answerMcq = (qid: string, idx: number) =>
  update((s) => { if (s.phase === 'mcq') s.mcq_answers[qid] = idx })

export const mcqScore = (s: MockSession, mock: MockRow) =>
  mock.paper_json.mcq.filter((q) => s.mcq_answers[q.id] === q.answer).length

/** Save the result row as it stands. The same id is reused, so later saves update it. */
async function saveResult(s: MockSession, mock: MockRow, cqScore: number | null, selfMarked: boolean) {
  const total = cqScore === null ? null : (s.mcq_score ?? 0) + cqScore
  await saveLocal('mock_results', {
    id: s.result_id, mock_id: s.mock_id, subject_code: s.subject_code,
    mcq_score: s.mcq_score, cq_score: cqScore, practical_score: null, total,
    self_marked: selfMarked, ai_marked: false, started_at: iso(s.started_at),
    submitted_at: s.submitted_at ? iso(s.submitted_at) : null,
    // Percentage the readiness score can use before the CQ part is marked.
    mcq_max: mock.paper_json.marks.mcq, max_total: mock.paper_json.marks.mcq + mock.paper_json.marks.cq + (mock.paper_json.marks.practical ?? 0),
  })
}

export async function submitMcq(mock: MockRow, at = Date.now()) {
  const s = await update((s) => {
    if (s.phase !== 'mcq') return
    s.mcq_score = mcqScore(s, mock)
    s.phase = 'cq'
    s.cq_started_at = at
  })
  if (s?.phase === 'cq') { await saveResult(s, mock, null, false); await logEvent('mock_mcq_submitted', { score: s.mcq_score }) }
  return s
}

export const toggleChosen = (cqid: string) =>
  update((s) => {
    s.cq_chosen = s.cq_chosen.includes(cqid) ? s.cq_chosen.filter((x) => x !== cqid) : [...s.cq_chosen, cqid]
  })

export async function submitCq(mock: MockRow, at = Date.now()) {
  const s = await update((s) => {
    if (s.phase !== 'cq') return
    s.phase = 'mark'
    s.submitted_at = at
  })
  if (s?.phase === 'mark') { await saveResult(s, mock, null, false); await logEvent('mock_submitted', {}) }
  return s
}

export const toggleRubric = (cqid: string, part: string, idx: number) =>
  update((s) => {
    const parts = (s.cq_marks[cqid] ??= {})
    const cur = parts[part] ?? []
    parts[part] = cur.includes(idx) ? cur.filter((x) => x !== idx) : [...cur, idx]
  })

export function cqScore(s: MockSession, mock: MockRow): number {
  let total = 0
  for (const c of mock.paper_json.sections.flatMap((x) => x.cqs)) {
    if (!s.cq_chosen.includes(c.id)) continue
    for (const p of c.parts) for (const i of s.cq_marks[c.id]?.[p.part] ?? []) total += p.rubric[i]?.points ?? 0
  }
  return total
}

/** Check the CQ choice against the paper's rule (e.g. 7 in all, at least 2 from each section). */
export function choiceProblem(s: MockSession, mock: MockRow): 'tooMany' | 'section' | null {
  const { answer, min_per_section } = mock.paper_json.cq_rules
  if (s.cq_chosen.length > answer) return 'tooMany'
  if (s.cq_chosen.length === answer && mock.paper_json.sections.some((sec) => sec.cqs.filter((c) => s.cq_chosen.includes(c.id)).length < min_per_section)) return 'section'
  return null
}

export async function finishMarking(mock: MockRow) {
  const s = await getSession()
  if (!s || s.phase !== 'mark') return null
  const score = cqScore(s, mock)
  await saveResult(s, mock, score, true)
  // Kept on this device for the answer review on the result page.
  await kvSet(`mock.review.${s.result_id}`, { mock_id: s.mock_id, mcq_answers: s.mcq_answers, cq_chosen: s.cq_chosen, cq_marks: s.cq_marks })
  await put(null)
  await logEvent('mock_marked', { total: (s.mcq_score ?? 0) + score })
  return s.result_id
}

/** Leave without (finishing) self-marking: the result keeps the MCQ marks only. */
export async function abandon() {
  const s = await getSession()
  if (s?.phase === 'mark') await kvSet(`mock.review.${s.result_id}`, { mock_id: s.mock_id, mcq_answers: s.mcq_answers, cq_chosen: s.cq_chosen, cq_marks: {} })
  await put(null)
}

/** Apply any deadline that has passed (also after the app was closed for hours). */
export async function enforceDeadlines(mock: MockRow, now = Date.now()) {
  let s = await getSession()
  if (!s || s.mock_id !== mock.id) return s
  const mcqEnd = s.started_at + s.mcq_minutes * 60_000
  if (s.phase === 'mcq' && now >= mcqEnd) s = await submitMcq(mock, mcqEnd)
  if (s && s.phase === 'cq' && s.cq_started_at !== null) {
    const cqEnd = s.cq_started_at + s.cq_minutes * 60_000
    if (now >= cqEnd) s = await submitCq(mock, cqEnd)
  }
  return s
}

/** Seconds left in the current timed part. */
export function secondsLeft(s: MockSession, now = Date.now()) {
  if (s.phase === 'mcq') return Math.max(0, Math.ceil((s.started_at + s.mcq_minutes * 60_000 - now) / 1000))
  if (s.phase === 'cq' && s.cq_started_at !== null) return Math.max(0, Math.ceil((s.cq_started_at + s.cq_minutes * 60_000 - now) / 1000))
  return 0
}

/** Percentage for a result: the full total once marked, else the MCQ part alone. */
export function resultPct(r: MockResultRow & { max_total?: number; mcq_max?: number }): number | null {
  if (r.total !== null && r.total !== undefined) return (Number(r.total) / (r.max_total ?? 100)) * 100
  if (r.mcq_score !== null && r.mcq_max) return (Number(r.mcq_score) / r.mcq_max) * 100
  return null
}

export function useResults(subject?: string) {
  return useLiveQuery(async () => {
    const all = (await db.mock_results.toArray()) as unknown as (MockResultRow & { max_total?: number; mcq_max?: number; deleted?: boolean })[]
    return all.filter((r) => !r.deleted && (!subject || r.subject_code === subject)).sort((a, b) => String(b.submitted_at ?? b.started_at).localeCompare(String(a.submitted_at ?? a.started_at)))
  }, [subject])
}
