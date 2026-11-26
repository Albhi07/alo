/**
 * SSC grading and the readiness formula. Pure functions, so they are easy to test.
 */

export type Grade = 'A+' | 'A' | 'A-' | 'B' | 'C' | 'D' | 'F'

/** SSC scale: 80+ A+ 5.00, 70 A 4.00, 60 A- 3.50, 50 B 3.00, 40 C 2.00, 33 D 1.00, below 33 F 0. */
export const SCALE: { min: number; grade: Grade; point: number }[] = [
  { min: 80, grade: 'A+', point: 5 },
  { min: 70, grade: 'A', point: 4 },
  { min: 60, grade: 'A-', point: 3.5 },
  { min: 50, grade: 'B', point: 3 },
  { min: 40, grade: 'C', point: 2 },
  { min: 33, grade: 'D', point: 1 },
  { min: 0, grade: 'F', point: 0 },
]

export function gradeFor(pct: number): { grade: Grade; point: number } {
  const p = Math.max(0, Math.min(100, pct))
  const row = SCALE.find((s) => p >= s.min)!
  return { grade: row.grade, point: row.point }
}

/** Papers that are graded together as one subject (1st + 2nd paper). */
export const COMBINED: Record<string, string> = { '102': '101', '108': '107' }
export const gpaSubject = (code: string) => COMBINED[code] ?? code

export interface SubjectScore { code: string; fourth: boolean; score: number | null }

/**
 * Predicted GPA from per-subject scores (0-100).
 * Bangla 1st+2nd and English 1st+2nd are averaged into one subject each. Main subjects are
 * averaged; the 4th subject adds only the points above 2.00, and the result is capped at 5.00.
 * An F in any main subject means a fail (an F in the 4th subject does not).
 * Subjects without a score are left out and reported in `missing`.
 */
export function predictGpa(subjects: SubjectScore[]): { gpa: number; fail: boolean; counted: number; total: number; missing: string[] } {
  const groups = new Map<string, { fourth: boolean; scores: (number | null)[] }>()
  for (const s of subjects) {
    const key = gpaSubject(s.code)
    const g = groups.get(key) ?? { fourth: s.fourth, scores: [] }
    g.scores.push(s.score)
    groups.set(key, g)
  }
  let sum = 0, counted = 0, total = 0, fail = false, bonus = 0
  const missing: string[] = []
  for (const [code, g] of groups) {
    if (!g.fourth) total++
    const known = g.scores.filter((x): x is number => x !== null)
    if (known.length < g.scores.length) { missing.push(code); if (!known.length) continue }
    const avg = known.reduce((a, b) => a + b, 0) / known.length
    const { point } = gradeFor(avg)
    if (g.fourth) { bonus = Math.max(0, point - 2); continue }
    counted++
    sum += point
    if (point === 0) fail = true
  }
  if (!counted) return { gpa: 0, fail: false, counted, total, missing }
  const gpa = fail ? 0 : Math.min(5, (sum + bonus) / counted)
  return { gpa: Math.round(gpa * 100) / 100, fail, counted, total, missing }
}

export interface ReadinessInput {
  /** Percent marks of timed mocks for this subject, newest first. */
  mocks: number[]
  /** Whether any mock paper exists for this subject. */
  mockAvailable: boolean
  /** Chapter mastery 0-100 with each chapter's board frequency (last 5 years). */
  chapters: { mastery: number; boardFreq: number }[]
  /** Best accuracy 0-100 per drill template in this subject (templates never tried count 0). */
  drills: number[]
}

export const WEIGHTS = { mock: 0.55, mastery: 0.25, drill: 0.2 }

/**
 * Readiness 0-100 = 55% average of the last 2 timed mocks + 25% chapter mastery weighted by
 * board frequency + 20% best drill scores. A part with no content for this subject (no mock
 * paper, no drills yet) is left out and the other weights are scaled up, so a student isn't
 * marked down for content that doesn't exist. Returns null when the student has done nothing.
 */
export function readiness(input: ReadinessInput): { score: number; parts: { mock: number | null; mastery: number; drill: number | null } } | null {
  const lastTwo = input.mocks.slice(0, 2)
  const mock = input.mockAvailable ? (lastTwo.length ? lastTwo.reduce((a, b) => a + b, 0) / lastTwo.length : 0) : null
  const wsum = input.chapters.reduce((t, c) => t + 1 + c.boardFreq, 0)
  const mastery = wsum ? input.chapters.reduce((t, c) => t + c.mastery * (1 + c.boardFreq), 0) / wsum : 0
  const drill = input.drills.length ? input.drills.reduce((a, b) => a + b, 0) / input.drills.length : null
  const didSomething = lastTwo.length > 0 || input.chapters.some((c) => c.mastery > 0) || input.drills.some((d) => d > 0)
  if (!didSomething) return null
  let w = WEIGHTS.mastery, total = WEIGHTS.mastery * mastery
  if (mock !== null) { w += WEIGHTS.mock; total += WEIGHTS.mock * mock }
  if (drill !== null) { w += WEIGHTS.drill; total += WEIGHTS.drill * drill }
  return { score: Math.round(total / w), parts: { mock: mock === null ? null : Math.round(mock), mastery: Math.round(mastery), drill: drill === null ? null : Math.round(drill) } }
}

/** How sure we are: the range narrows as the student takes timed mocks. */
export const spreadFor = (mocksTaken: number) => (mocksTaken >= 2 ? 6 : mocksTaken === 1 ? 10 : 15)
