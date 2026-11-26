// What a student's device publishes for linked parents and class teachers, and helpers the
// parent and teacher screens use to read it. Pure functions, unit-tested.

export interface StudentSummary {
  v: 1
  name: string | null
  exam_year: number
  subjects: string[]
  streak: number
  rest_used: boolean
  target_min: number
  /** Focus minutes for the 7 days ending `as_of`, oldest first. */
  week: number[]
  as_of: string
  readiness: { code: string; score: number | null }[]
  gpa: { low: number; mid: number; high: number; fail: boolean } | null
  updated: string
}

export interface SummaryInput {
  profile: { display_name?: string | null; exam_year: number; daily_target_min: number }
  subjects: string[]
  stats: { week: { date: string; minutes: number }[]; streak: { days: number; restUsedThisWeek: boolean } }
  readiness: { subjects: { code: string; score: number | null }[]; gpa: { low: number; mid: number; high: number; fail: boolean } | null }
  now: Date
}

export function buildSummary(i: SummaryInput): StudentSummary {
  return {
    v: 1,
    name: i.profile.display_name?.trim() || null,
    exam_year: i.profile.exam_year,
    subjects: i.subjects,
    streak: i.stats.streak.days,
    rest_used: i.stats.streak.restUsedThisWeek,
    target_min: i.profile.daily_target_min,
    week: i.stats.week.map((d) => Math.round(d.minutes)),
    as_of: i.stats.week[i.stats.week.length - 1]?.date ?? i.now.toISOString().slice(0, 10),
    readiness: i.readiness.subjects.map((s) => ({ code: s.code, score: s.score === null ? null : Math.round(s.score) })),
    gpa: i.readiness.gpa ? { low: i.readiness.gpa.low, mid: i.readiness.gpa.mid, high: i.readiness.gpa.high, fail: i.readiness.gpa.fail } : null,
    updated: i.now.toISOString(),
  }
}

/** Same numbers, ignoring when they were computed: used to skip uploads that change nothing. */
export const summaryKey = (s: StudentSummary) => JSON.stringify({ ...s, updated: undefined })

/** Next papers for a student's subjects, soonest first. */
export function upcomingPapers<R extends { exam_year: number; date: string; subject_code: string }>(routine: R[], s: Pick<StudentSummary, 'exam_year' | 'subjects'>, today: string, n = 3): R[] {
  const mine = new Set(s.subjects)
  return routine
    .filter((r) => r.exam_year === s.exam_year && r.date >= today && mine.has(r.subject_code))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, n)
}

/** RFC 4180 CSV with a BOM so Excel opens Bangla text correctly. */
export function toCsv(rows: (string | number | null | undefined)[][]): string {
  const cell = (v: string | number | null | undefined) => {
    const s = v === null || v === undefined ? '' : String(v)
    // Neutralise spreadsheet formulas in text cells (=, +, -, @ at the start).
    const safe = typeof v === 'string' && /^[=+\-@\t\r]/.test(s) ? `'${s}` : s
    return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe
  }
  return '﻿' + rows.map((r) => r.map(cell).join(',')).join('\r\n') + '\r\n'
}

export interface MasteryCell { user_id: string; chapter_id: string; score: number }

/** Students × chapters grid; null where a student hasn't touched a chapter. */
export function masteryGrid(members: { user_id: string }[], chapters: { id: string }[], cells: MasteryCell[]) {
  const at = new Map(cells.map((c) => [`${c.user_id}:${c.chapter_id}`, c.score]))
  return members.map((m) => chapters.map((c) => at.get(`${m.user_id}:${c.id}`) ?? null))
}

/** Class average per chapter over students who have started it. */
export function chapterAverages(grid: (number | null)[][], chapters: number): (number | null)[] {
  return Array.from({ length: chapters }, (_, j) => {
    const vals = grid.map((row) => row[j]).filter((v): v is number => v !== null)
    return vals.length ? Math.round(vals.reduce((t, v) => t + v, 0) / vals.length) : null
  })
}
