import { addDays, dayDiff, weekday } from './days'

/**
 * Day-by-day study plan from today to the last paper. Pure and deterministic: the same
 * inputs give the same plan, so re-planning after a missed day simply runs it again with
 * today's date and the student's current mastery.
 *
 * - The day before each paper is a revision block for that paper's subject.
 * - One rest day a week (Friday by default), except within 2 days of a paper.
 * - Before the exams, other days are 3-5 tasks across subjects, picked by weakness
 *   (low mastery), how often a chapter is asked in boards, and how soon its paper is.
 * - Between papers, study days go to the next paper's subject.
 * - Every 14 days, a timed mock for a subject that has one.
 */

export type PlanKind = 'lesson' | 'mcq' | 'cq' | 'mock' | 'revision' | 'rest'

export interface PlanChapter { id: string; mastery: number; boardFreq: number; lessonPending: boolean }
export interface PlanSubject { code: string; chapters: PlanChapter[]; mockId?: string }
export interface PlanInput {
  today: string
  papers: { date: string; subject_code: string }[]
  subjects: PlanSubject[]
  dailyMinutes: number
  /** 0 = Sunday … 6 = Saturday. Default Friday. */
  restWeekday?: number
  /** Only build this many days (the rest can be previewed by calling again later). */
  days?: number
}
export interface PlanTask { date: string; slot: number; kind: PlanKind; subject_code: string | null; ref_id: string | null; minutes: number }

const round5 = (n: number) => Math.max(15, Math.round(n / 5) * 5)

export function generatePlan(input: PlanInput): PlanTask[] {
  const rest = input.restWeekday ?? 5
  const papers = [...input.papers].sort((a, b) => a.date.localeCompare(b.date))
  if (!papers.length) return []
  const last = papers[papers.length - 1].date
  const first = papers[0].date
  const span = Math.min(dayDiff(input.today, last) + 1, input.days ?? Infinity)
  if (span <= 0) return []

  // Working copy of mastery: each scheduled session nudges it up, so tasks rotate.
  const virt = new Map<string, number>()
  for (const s of input.subjects) for (const c of s.chapters) virt.set(c.id, c.mastery)
  const lessonDone = new Set<string>()
  const kindCount = new Map<string, number>()
  const paperOf = new Map<string, string>()
  for (const p of papers) if (!paperOf.has(p.subject_code)) paperOf.set(p.subject_code, p.date)
  const subjects = input.subjects.filter((s) => paperOf.has(s.code) && s.chapters.length)
  const paperDates = new Set(papers.map((p) => p.date))

  const out: PlanTask[] = []
  let sinceMock = 7 // first mock about a week in

  for (let i = 0; i < span; i++) {
    const date = addDays(input.today, i)
    if (paperDates.has(date)) continue // exam day: nothing else planned
    const tomorrow = papers.find((p) => p.date === addDays(date, 1))
    if (tomorrow) {
      out.push({ date, slot: 0, kind: 'revision', subject_code: tomorrow.subject_code, ref_id: tomorrow.subject_code, minutes: input.dailyMinutes })
      continue
    }
    const nearPaper = papers.some((p) => { const d = dayDiff(date, p.date); return d >= 0 && d <= 2 })
    if (weekday(date) === rest && !nearPaper) {
      out.push({ date, slot: 0, kind: 'rest', subject_code: null, ref_id: null, minutes: 0 })
      continue
    }

    // Which subjects compete today: all of them before the exams, then only the next paper's.
    const inExams = date >= first
    const next = papers.find((p) => p.date > date)
    const pool = inExams && next ? subjects.filter((s) => s.code === next.subject_code || paperOf.get(s.code) === next.date) : subjects.filter((s) => paperOf.get(s.code)! > date)
    if (!pool.length) continue

    sinceMock++
    const withMock = pool.filter((s) => s.mockId)
    if (sinceMock >= 14 && withMock.length && input.dailyMinutes >= 120 && !inExams) {
      const s = withMock.sort((a, b) => avg(a, virt) - avg(b, virt))[0]
      out.push({ date, slot: 0, kind: 'mock', subject_code: s.code, ref_id: s.mockId!, minutes: Math.min(180, input.dailyMinutes) })
      sinceMock = 0
      continue
    }

    const n = Math.min(5, Math.max(3, Math.round(input.dailyMinutes / 40)))
    const minutes = round5(input.dailyMinutes / n)
    const usedToday = new Set<string>()
    // Mix subjects: at most 2 tasks a day from one subject when there's a choice.
    const perSubject = new Map<string, number>()
    const cap = Math.max(2, Math.ceil(n / pool.length))
    for (let slot = 0; slot < n; slot++) {
      let best: { s: PlanSubject; c: PlanChapter; w: number } | null = null
      for (const s of pool) {
        if ((perSubject.get(s.code) ?? 0) >= cap) continue
        const daysLeft = Math.max(1, dayDiff(date, paperOf.get(s.code)!))
        const urgency = 1 + 20 / daysLeft
        for (const c of s.chapters) {
          if (usedToday.has(c.id)) continue
          const w = (105 - (virt.get(c.id) ?? 0)) * (1 + c.boardFreq) * urgency
          if (!best || w > best.w || (w === best.w && c.id < best.c.id)) best = { s, c, w }
        }
      }
      if (!best) break
      const { s, c } = best
      usedToday.add(c.id)
      perSubject.set(s.code, (perSubject.get(s.code) ?? 0) + 1)
      let kind: PlanKind
      if (c.lessonPending && !lessonDone.has(c.id)) { kind = 'lesson'; lessonDone.add(c.id) } else {
        const k = kindCount.get(c.id) ?? 0
        kind = k % 3 === 2 ? 'cq' : 'mcq'
        kindCount.set(c.id, k + 1)
      }
      virt.set(c.id, Math.min(100, (virt.get(c.id) ?? 0) + (kind === 'lesson' ? 15 : 8)))
      out.push({ date, slot, kind, subject_code: s.code, ref_id: c.id, minutes })
    }
  }
  return out
}

function avg(s: PlanSubject, virt: Map<string, number>) {
  return s.chapters.reduce((t, c) => t + (virt.get(c.id) ?? 0), 0) / s.chapters.length
}
