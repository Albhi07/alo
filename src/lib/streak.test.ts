import { describe, it, expect } from 'vitest'
import { computeStreak } from './streak'
import { addDays, weekStart, weekday } from './days'

const run = (end: string, n: number) => Array.from({ length: n }, (_, i) => addDays(end, -i))

describe('days', () => {
  it('starts the week on Saturday', () => {
    expect(weekday('2027-01-09')).toBe(6) // Saturday
    expect(weekStart('2027-01-09')).toBe('2027-01-09')
    expect(weekStart('2027-01-15')).toBe('2027-01-09') // Friday
    expect(weekStart('2027-01-16')).toBe('2027-01-16')
  })
})

describe('streak', () => {
  it('counts consecutive days and does not break before today is over', () => {
    const s = new Set(run('2027-01-14', 4))
    expect(computeStreak(s, '2027-01-14').days).toBe(4)
    expect(computeStreak(s, '2027-01-15')).toMatchObject({ days: 4, studiedToday: false })
  })

  it('forgives one missed day a week, but not two', () => {
    // Week of Sat 9 Jan: studied 9, 10, (miss 11), 12, 13, 14
    const s = new Set(['2027-01-09', '2027-01-10', '2027-01-12', '2027-01-13', '2027-01-14'])
    expect(computeStreak(s, '2027-01-14')).toMatchObject({ days: 5, restUsedThisWeek: true })
    s.delete('2027-01-13') // second miss in the same week: 13 is the rest day, 11 breaks it
    expect(computeStreak(s, '2027-01-14').days).toBe(2)
  })

  it('a rest day in each of two weeks is fine', () => {
    // Miss Thu 7 Jan (week of 2 Jan) and Mon 11 Jan (week of 9 Jan)
    const s = new Set([...run('2027-01-14', 10)].filter((d) => d !== '2027-01-07' && d !== '2027-01-11'))
    expect(computeStreak(s, '2027-01-14').days).toBe(8)
  })

  it('is 0 with no study', () => {
    expect(computeStreak(new Set(), '2027-01-14').days).toBe(0)
  })
})
