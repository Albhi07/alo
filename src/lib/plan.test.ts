import { describe, it, expect } from 'vitest'
import { generatePlan, type PlanInput } from './plan'
import { weekday } from './days'

const ch = (id: string, mastery = 0, boardFreq = 0, lessonPending = false) => ({ id, mastery, boardFreq, lessonPending })
const base: PlanInput = {
  today: '2027-02-01',
  papers: [
    { date: '2027-03-14', subject_code: '101' },
    { date: '2027-03-25', subject_code: '109' },
  ],
  subjects: [
    { code: '101', chapters: [ch('b1', 90), ch('b2', 80)] },
    { code: '109', chapters: [ch('m1', 10, 4, true), ch('m2', 60), ch('m3', 0)], mockId: 'mock-109' },
  ],
  dailyMinutes: 180,
}

describe('study plan', () => {
  const plan = generatePlan(base)
  const on = (d: string) => plan.filter((t) => t.date === d)

  it('puts a revision block the day before each paper and nothing on paper days', () => {
    expect(on('2027-03-13')).toEqual([expect.objectContaining({ kind: 'revision', subject_code: '101', minutes: 180 })])
    expect(on('2027-03-24')[0]).toMatchObject({ kind: 'revision', subject_code: '109' })
    expect(on('2027-03-14')).toEqual([])
    expect(plan.some((t) => t.date > '2027-03-25')).toBe(false)
  })

  it('has one rest day a week (Friday), but not right before a paper', () => {
    const rests = plan.filter((t) => t.kind === 'rest')
    expect(rests.length).toBeGreaterThan(4)
    expect(rests.every((t) => weekday(t.date) === 5)).toBe(true)
    expect(rests.some((t) => t.date === '2027-03-12')).toBe(false) // Friday, 2 days before Bangla 1st
  })

  it('gives 3-5 tasks on study days, weak and often-asked chapters first, lessons before practice', () => {
    const day1 = on('2027-02-01')
    expect(day1.length).toBeGreaterThanOrEqual(3)
    expect(day1.length).toBeLessThanOrEqual(5)
    expect(day1.reduce((t, x) => t + x.minutes, 0)).toBeGreaterThanOrEqual(170)
    expect(day1[0]).toMatchObject({ ref_id: 'm1', kind: 'lesson' }) // weak, asked 4 times
    expect(new Set(day1.map((t) => t.ref_id)).size).toBe(day1.length)
    expect(new Set(day1.map((t) => t.subject_code)).size).toBeGreaterThan(1) // subjects are mixed
  })

  it('schedules timed mocks for subjects that have one', () => {
    expect(plan.filter((t) => t.kind === 'mock').every((t) => t.ref_id === 'mock-109')).toBe(true)
    expect(plan.filter((t) => t.kind === 'mock').length).toBeGreaterThanOrEqual(2)
  })

  it('between papers, study days go to the next paper only', () => {
    const between = plan.filter((t) => t.date > '2027-03-14' && t.date < '2027-03-24' && t.subject_code)
    expect(between.length).toBeGreaterThan(0)
    expect(between.every((t) => t.subject_code === '109')).toBe(true)
  })

  it('is deterministic, and re-planning from a later day starts there', () => {
    expect(generatePlan(base)).toEqual(plan)
    const later = generatePlan({ ...base, today: '2027-02-10', days: 7 })
    expect(later[0].date).toBe('2027-02-10')
    expect(later.every((t) => t.date <= '2027-02-16')).toBe(true)
  })
})
