import { useLiveQuery } from 'dexie-react-hooks'
import { db, kvGet, kvSet, type LocalProfile } from '../db'
import { saveLocal } from '../db/sync'
import type { ContentIndex, MockSummary } from '../data/content-types'
import type { RoutineRow, ExamConfig } from '../data/exam'
import { SEED_EXAM_CONFIG, SEED_ROUTINE } from '../data/exam'
import { generatePlan, type PlanKind, type PlanTask } from '../lib/plan'
import { addDays } from '../lib/days'
import { todayIso } from '../lib/format'
import { subjectsFor } from './profile'
import type { LessonPosition } from './lessonProgress'

export interface PlanItem {
  id: string; user_id: string | null; date: string; slot: number; kind: PlanKind
  subject_code: string | null; ref_id: string | null; minutes: number; done: boolean; edited: boolean; deleted?: boolean
  created_at: string; updated_at: string
}

/** How many days ahead are stored (the rest is worked out again as days pass). */
export const WINDOW = 7

async function planInputs(profile: LocalProfile, today: string) {
  const config = await kvGet<ExamConfig>('exam.config', SEED_EXAM_CONFIG)
  const routineAll = await kvGet<RoutineRow[]>('exam.routine', [])
  const routine = (routineAll.length ? routineAll : SEED_ROUTINE).filter((r) => r.exam_year === config.exam_year)
  const codes = subjectsFor(profile).map((s) => s.code)
  const papers = routine.filter((r) => codes.includes(r.subject_code)).map((r) => ({ date: r.date, subject_code: r.subject_code }))
  const [chapters, masteryRows, packs, mocks, positions] = await Promise.all([
    db.c_chapters.toArray(),
    db.mastery.toArray(),
    kvGet<ContentIndex['packs']>('content.packs', {}),
    kvGet<MockSummary[]>('content.mocks', []),
    db.kv.where('key').startsWith('lesson.pos.').toArray(),
  ])
  const mastery = new Map<string, number>()
  for (const m of masteryRows.sort((a, b) => String(a.updated_at).localeCompare(String(b.updated_at)))) mastery.set(m.chapter_id as string, Number(m.score) || 0)
  const doneChapters = new Set(positions.map((p) => p.value as LessonPosition).filter((p) => p?.done).map((p) => p.chapter_id))
  const subjects = codes.map((code) => ({
    code,
    mockId: mocks.find((m) => m.subject_code === code && m.medium === profile.medium && m.exam_year === config.exam_year)?.id,
    chapters: chapters.filter((c) => c.subject_code === code).map((c) => ({
      id: c.id, mastery: mastery.get(c.id) ?? 0, boardFreq: c.board_freq_5y,
      lessonPending: (packs[c.id]?.[profile.medium]?.lessons ?? 0) > 0 && !doneChapters.has(c.id),
    })),
  }))
  return { today, papers, subjects, dailyMinutes: profile.daily_target_min, days: WINDOW }
}

const live = (rows: unknown[]) => (rows as PlanItem[]).filter((r) => !r.deleted)

/**
 * Make sure the next WINDOW days are planned. Runs again each new day, so a missed day is
 * re-planned around automatically. Finished and edited items are never touched.
 */
export async function ensurePlan(profile: LocalProfile, now = new Date(), force = false) {
  const today = todayIso(now)
  const stamp = `${today}:${await kvGet('content.index_version', '')}:${profile.daily_target_min}:${profile.group}:${profile.fourth_subject_code}:${profile.medium}`
  if (!force && (await kvGet('plan.stamp', '')) === stamp) return
  const tasks = generatePlan(await planInputs(profile, today))
  const end = addDays(today, WINDOW - 1)
  const existing = live(await db.plan_items.where('date').between(today, end, true, true).toArray())
  const keep = existing.filter((x) => x.done || x.edited)
  const free = existing.filter((x) => !x.done && !x.edited)
  const taken = new Set(keep.map((x) => `${x.date}:${x.slot}`))
  const reuse = new Map(free.map((x) => [`${x.date}:${x.slot}`, x]))
  const written = new Set<string>()
  for (const t of tasks) {
    const key = `${t.date}:${t.slot}`
    if (taken.has(key)) continue
    const old = reuse.get(key)
    const same = old && old.kind === t.kind && old.ref_id === t.ref_id && old.minutes === t.minutes
    if (!same) await saveLocal('plan_items', { ...(old ? { id: old.id, created_at: old.created_at } : {}), ...toRow(t), done: false, edited: false, deleted: false })
    written.add(key)
  }
  for (const x of free) if (!written.has(`${x.date}:${x.slot}`)) await saveLocal('plan_items', { ...x, deleted: true })
  await kvSet('plan.stamp', stamp)
}

const toRow = (t: PlanTask) => ({ date: t.date, slot: t.slot, kind: t.kind, subject_code: t.subject_code, ref_id: t.ref_id, minutes: t.minutes })

export async function setDone(item: PlanItem, done: boolean) {
  await saveLocal('plan_items', { ...item, done })
}

/** Remove a task the student doesn't want; re-planning won't bring it back that day. */
export async function removeItem(item: PlanItem) {
  await saveLocal('plan_items', { ...item, deleted: true, edited: true })
}

/** Tick today's matching task when the student does the work from anywhere in the app. */
export async function completeMatching(kind: PlanKind | PlanKind[], refId: string, now = new Date()) {
  const kinds = Array.isArray(kind) ? kind : [kind]
  const items = live(await db.plan_items.where('date').equals(todayIso(now)).toArray())
  for (const it of items) if (!it.done && kinds.includes(it.kind) && it.ref_id === refId) await setDone(it, true)
}

export function usePlan(from: string, days = WINDOW) {
  return useLiveQuery(async () => {
    const rows = live(await db.plan_items.where('date').between(from, addDays(from, days - 1), true, true).toArray())
    return rows.sort((a, b) => a.date.localeCompare(b.date) || a.slot - b.slot)
  }, [from, days])
}

/** Tasks from earlier days that were left undone. */
export function useMissed(today: string) {
  return useLiveQuery(async () => live(await db.plan_items.where('date').below(today).toArray()).filter((x) => !x.done && x.kind !== 'rest').length, [today], 0)
}
