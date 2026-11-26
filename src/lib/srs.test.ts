import { describe, it, expect } from 'vitest'
import { schedule, qualityFrom } from './srs'

describe('SM-2', () => {
  it('grows intervals 1, 6, then by ease', () => {
    const a = schedule(null, 4, '2027-01-01')
    expect(a).toMatchObject({ interval_days: 1, reps: 1, due_on: '2027-01-02' })
    const b = schedule(a, 4, '2027-01-02')
    expect(b).toMatchObject({ interval_days: 6, reps: 2, due_on: '2027-01-08' })
    const c = schedule(b, 5, '2027-01-08')
    expect(c.interval_days).toBe(Math.round(6 * c.ease))
  })
  it('wrong answers reset to due today and lower ease (not below 1.3)', () => {
    let s = schedule(null, 5, '2027-01-01')
    s = schedule(s, 1, '2027-01-02')
    expect(s).toMatchObject({ interval_days: 0, reps: 0, due_on: '2027-01-02' })
    for (let i = 0; i < 20; i++) s = schedule(s, 1, '2027-01-02')
    expect(s.ease).toBeGreaterThanOrEqual(1.3)
  })
  it('maps answer speed to quality', () => {
    expect(qualityFrom(false, 1000)).toBe(1)
    expect(qualityFrom(true, 10_000)).toBe(5)
    expect(qualityFrom(true, 40_000)).toBe(4)
    expect(qualityFrom(true, 90_000)).toBe(3)
  })
})
