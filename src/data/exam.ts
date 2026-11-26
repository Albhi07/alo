// Exam configuration is data, not code. This copy is the offline fallback and mirrors
// supabase/seed.sql; when the server has a newer exam_config/routine it replaces this
// (cached in IndexedDB), so changing dates never needs a deploy.
import { parseDay } from '../lib/format'

export const EXAM_YEAR = 2027

export interface ExamConfig {
  exam_year: number
  written_start: string
  written_end: string
  practical_start: string | null
  practical_end: string | null
  results_date: string | null
  status: 'upcoming' | 'running' | 'done'
}

export interface RoutineRow {
  id: string
  exam_year: number
  date: string
  subject_code: string
  paper: string
  start_time: string
  duration_min: number
  verified: boolean
}

export const SEED_EXAM_CONFIG: ExamConfig = {
  exam_year: 2027,
  written_start: '2027-03-14',
  written_end: '2027-04-15',
  practical_start: null,
  practical_end: null,
  results_date: null,
  status: 'upcoming',
}

const r = (date: string, subject_code: string, paper: string, duration_min = 180): RoutineRow => ({
  id: `seed-2027-${subject_code}`,
  exam_year: 2027, date, subject_code, paper, start_time: '10:00', duration_min, verified: false,
})

/** Opening papers only. UNVERIFIED until an admin checks them against the board PDF. */
export const SEED_ROUTINE: RoutineRow[] = [
  r('2027-03-14', '101', '1st'),
  r('2027-03-16', '102', '2nd'),
  r('2027-03-18', '107', '1st'),
  r('2027-03-21', '108', '2nd'),
  r('2027-03-22', '154', 'theory', 120),
  r('2027-03-25', '109', 'single'),
  r('2027-03-28', '150', 'single'),
]

/** Paper start as a Date in Bangladesh time (UTC+6, no DST). */
export function paperStart(row: RoutineRow): Date {
  const d = parseDay(row.date)
  const [h, m] = row.start_time.split(':').map(Number)
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), h - 6, m))
}

export function firstPaper(routine: RoutineRow[]): RoutineRow | undefined {
  return [...routine].sort((a, b) => a.date.localeCompare(b.date))[0]
}

/** The next paper (not yet started) among the student's subjects. */
export function nextPaperFor(routine: RoutineRow[], codes: string[], now = new Date()): RoutineRow | undefined {
  return routine
    .filter((x) => codes.includes(x.subject_code) && paperStart(x) > now)
    .sort((a, b) => paperStart(a).getTime() - paperStart(b).getTime())[0]
}
