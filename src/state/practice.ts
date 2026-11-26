import { db } from '../db'
import { saveLocal } from '../db/sync'
import type { QuestionRow } from '../data/content-types'
import type { Medium } from '../data/catalog'
import { qualityFrom, schedule } from '../lib/srs'
import { todayIso } from '../lib/format'
import { kvGet } from '../db'
import type { LessonPosition } from './lessonProgress'
import { logEvent } from './events'

export interface AttemptRow {
  id: string; user_id: string | null; question_id?: string | null; drill_template_id?: string | null
  given_json: unknown; correct: boolean; score: number; time_ms: number; device_id: string | null
  created_at: string; updated_at: string
}
interface SrsRow { id: string; question_id: string; ease: number; interval_days: number; reps: number; due_on: string; updated_at: string }

let deviceId: string | null = null
async function device() {
  if (deviceId) return deviceId
  deviceId = await kvGet<string | null>('device.id', null)
  if (!deviceId) { deviceId = crypto.randomUUID?.() ?? String(Math.random()).slice(2); await db.kv.put({ key: 'device.id', value: deviceId }) }
  return deviceId
}

/** Latest SRS card for a question (two devices may each have made one; newest wins). */
async function cardFor(questionId: string): Promise<SrsRow | undefined> {
  const cards = (await db.srs_cards.where('question_id').equals(questionId).toArray()) as unknown as SrsRow[]
  return cards.sort((a, b) => b.updated_at.localeCompare(a.updated_at))[0]
}

/** Save an MCQ answer: attempt, spaced-repetition card, chapter mastery, analytics. All local first. */
export async function recordMcqAnswer(q: QuestionRow, chosen: number, timeMs: number) {
  const correct = chosen === (q.answer_json as { index: number }).index
  await saveLocal('attempts', {
    question_id: q.id, given_json: { index: chosen }, correct, score: correct ? 1 : 0, time_ms: Math.round(timeMs), device_id: await device(),
  })
  const prev = await cardFor(q.id)
  const next = schedule(prev ?? null, qualityFrom(correct, timeMs), todayIso())
  await saveLocal('srs_cards', { ...(prev ?? {}), question_id: q.id, ...next })
  await recomputeMastery(q.chapter_id, q.medium)
  await logEvent('mcq_answered', { correct, subtype: q.subtype })
  return correct
}

/**
 * Chapter mastery (0-100) = 80% MCQ + 20% lessons.
 * MCQ part: share of the chapter's MCQs whose latest attempt was right (unseen count as 0).
 * Lesson part: share of the chapter's lessons finished.
 */
export async function computeMastery(chapterId: string, medium: Medium): Promise<number> {
  const qs = await db.c_questions.where('[chapter_id+medium]').equals([chapterId, medium]).filter((q) => q.kind === 'mcq').toArray()
  const lessons = await db.c_lessons.where('[chapter_id+medium]').equals([chapterId, medium]).toArray()
  let mcq = 0
  if (qs.length) {
    const ids = qs.map((q) => q.id)
    const attempts = (await db.attempts.where('question_id').anyOf(ids).toArray()) as unknown as AttemptRow[]
    const latest = new Map<string, AttemptRow>()
    for (const a of attempts) {
      const cur = latest.get(a.question_id!)
      if (!cur || a.created_at > cur.created_at) latest.set(a.question_id!, a)
    }
    mcq = [...latest.values()].filter((a) => a.correct).length / qs.length
  }
  let les = 0
  if (lessons.length) {
    let done = 0
    for (const l of lessons) if ((await kvGet<LessonPosition | null>(`lesson.pos.${l.id}`, null))?.done) done++
    les = done / lessons.length
  }
  const weightMcq = lessons.length ? 0.8 : 1
  return Math.round(100 * (weightMcq * mcq + (1 - weightMcq) * les))
}

export async function recomputeMastery(chapterId: string, medium: Medium) {
  const score = await computeMastery(chapterId, medium)
  const existing = (await db.mastery.where('chapter_id').equals(chapterId).toArray()).sort((a, b) => b.updated_at.localeCompare(a.updated_at))[0]
  if (existing && Number(existing.score) === score) return score
  await saveLocal('mastery', { ...(existing ?? {}), chapter_id: chapterId, score })
  return score
}

/**
 * A practice round for one chapter: questions due for review first, then ones never seen,
 * then the ones seen longest ago. Situation-based questions sharing a passage stay together.
 */
export async function buildQueue(chapterId: string, medium: Medium, size = 10, today = todayIso()): Promise<QuestionRow[]> {
  const qs = (await db.c_questions.where('[chapter_id+medium]').equals([chapterId, medium]).toArray()).filter((q) => q.kind === 'mcq' && q.published !== false)
  const ids = qs.map((q) => q.id)
  const cards = (await db.srs_cards.where('question_id').anyOf(ids).toArray()) as unknown as SrsRow[]
  const card = new Map<string, SrsRow>()
  for (const c of cards.sort((a, b) => a.updated_at.localeCompare(b.updated_at))) card.set(c.question_id, c)
  const due = qs.filter((q) => card.get(q.id) && card.get(q.id)!.due_on <= today).sort((a, b) => card.get(a.id)!.due_on.localeCompare(card.get(b.id)!.due_on))
  const unseen = qs.filter((q) => !card.get(q.id))
  const later = qs.filter((q) => card.get(q.id) && card.get(q.id)!.due_on > today).sort((a, b) => card.get(a.id)!.due_on.localeCompare(card.get(b.id)!.due_on))
  const ordered = [...due, ...unseen, ...later]
  // Keep passages together: when one situation question is picked, pull its siblings next to it.
  const out: QuestionRow[] = []
  const used = new Set<string>()
  for (const q of ordered) {
    if (used.has(q.id)) continue
    const group = q.subtype === 'situation' && q.options_json?.context
      ? ordered.filter((x) => x.options_json?.context === q.options_json?.context)
      : [q]
    for (const g of group) { if (!used.has(g.id)) { out.push(g); used.add(g.id) } }
    if (out.length >= size) break
  }
  return out
}

export async function dueCount(chapterId: string, medium: Medium, today = todayIso()) {
  const ids = await db.c_questions.where('[chapter_id+medium]').equals([chapterId, medium]).primaryKeys()
  const cards = (await db.srs_cards.where('question_id').anyOf(ids).toArray()) as unknown as SrsRow[]
  const latest = new Map<string, SrsRow>()
  for (const c of cards.sort((a, b) => a.updated_at.localeCompare(b.updated_at))) latest.set(c.question_id, c)
  return [...latest.values()].filter((c) => c.due_on <= today).length
}

/** Save a drill answer. Drills don't use spaced repetition: every attempt has fresh numbers. */
export async function recordDrillAnswer(templateId: string, given: (number | null)[], correct: boolean, timeMs: number, seed: number) {
  await saveLocal('attempts', {
    drill_template_id: templateId, given_json: { values: given, seed }, correct, score: correct ? 1 : 0, time_ms: Math.round(timeMs), device_id: await device(),
  })
  await logEvent('drill_answered', { correct })
}
