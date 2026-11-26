import { useLiveQuery } from 'dexie-react-hooks'
import { db, kvGet, kvSet } from '../db'
import { saveLocal } from '../db/sync'
import { todayIso } from '../lib/format'
import { addDays } from '../lib/days'
import { computeStreak } from '../lib/streak'
import { logEvent } from './events'

/**
 * Pomodoro focus timer. Only the start time is stored, so the timer is right after the app
 * is closed or the phone sleeps: on return, finished work time is saved with its real end.
 */
export const MODES = { '25/5': { work: 25, rest: 5 }, '50/10': { work: 50, rest: 10 } } as const
export type Mode = keyof typeof MODES

export interface FocusTimer { mode: Mode; subject_code: string | null; phase: 'work' | 'break'; started_at: number }
export interface FocusRow { id: string; subject_code: string | null; started_at: string; ended_at: string | null; minutes: number; deleted?: boolean }

const KEY = 'focus.active'
const MIN = 60_000

export const getTimer = () => kvGet<FocusTimer | null>(KEY, null)
export function useTimer() {
  return useLiveQuery(() => getTimer(), [], undefined as FocusTimer | null | undefined)
}

export async function startFocus(mode: Mode, subject_code: string | null, now = Date.now()) {
  await kvSet(KEY, { mode, subject_code, phase: 'work', started_at: now } satisfies FocusTimer)
}

async function record(t: FocusTimer, endMs: number) {
  const minutes = Math.floor((endMs - t.started_at) / MIN)
  if (minutes < 1) return
  await saveLocal('focus_sessions', {
    subject_code: t.subject_code, started_at: new Date(t.started_at).toISOString(), ended_at: new Date(endMs).toISOString(),
    minutes: Math.min(minutes, MODES[t.mode].work), device_id: await kvGet('device.id', null),
  })
  await logEvent('focus_completed', { minutes })
}

/** Stop now. Work time done so far (whole minutes) is kept. */
export async function stopFocus(now = Date.now()) {
  const t = await getTimer()
  if (t?.phase === 'work') await record(t, now)
  await kvSet(KEY, null)
}

/** Move the timer on if its phase ended (also hours later). Returns the current timer. */
export async function tick(now = Date.now()): Promise<FocusTimer | null> {
  const t = await getTimer()
  if (!t) return null
  const m = MODES[t.mode]
  if (t.phase === 'work') {
    const end = t.started_at + m.work * MIN
    if (now < end) return t
    await record(t, end)
    const brk: FocusTimer = { ...t, phase: 'break', started_at: end }
    if (now >= end + m.rest * MIN) { await kvSet(KEY, null); return null }
    await kvSet(KEY, brk)
    return brk
  }
  if (now >= t.started_at + m.rest * MIN) { await kvSet(KEY, null); return null }
  return t
}

export function secondsLeft(t: FocusTimer, now = Date.now()) {
  const len = (t.phase === 'work' ? MODES[t.mode].work : MODES[t.mode].rest) * MIN
  return Math.max(0, Math.ceil((t.started_at + len - now) / 1000))
}

/** Days with any study: a focus session, an answered question or drill. */
async function activeDays(): Promise<Set<string>> {
  const [focus, attempts] = await Promise.all([db.focus_sessions.toArray(), db.attempts.toArray()])
  const s = new Set<string>()
  for (const f of focus as unknown as FocusRow[]) if (!f.deleted && f.minutes > 0) s.add(todayIso(new Date(f.started_at)))
  for (const a of attempts) s.add(todayIso(new Date(a.created_at as string)))
  return s
}

/** Streak, today's minutes and the last 7 days of focus minutes (oldest first). */
export function useStudyStats() {
  return useLiveQuery(async () => {
    const today = todayIso()
    const focus = ((await db.focus_sessions.toArray()) as unknown as FocusRow[]).filter((f) => !f.deleted)
    const byDay = new Map<string, number>()
    for (const f of focus) { const d = todayIso(new Date(f.started_at)); byDay.set(d, (byDay.get(d) ?? 0) + f.minutes) }
    const week = Array.from({ length: 7 }, (_, i) => { const d = addDays(today, i - 6); return { date: d, minutes: byDay.get(d) ?? 0 } })
    const streak = computeStreak(await activeDays(), today)
    return { today: byDay.get(today) ?? 0, week, streak }
  }, [])
}
