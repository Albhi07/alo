import { describe, it, expect } from 'vitest'
import { gradeFor, predictGpa, readiness } from './grading'

describe('grading', () => {
  it('uses the SSC scale', () => {
    expect(gradeFor(80)).toEqual({ grade: 'A+', point: 5 })
    expect(gradeFor(79.9).grade).toBe('A')
    expect(gradeFor(60).point).toBe(3.5)
    expect(gradeFor(33).grade).toBe('D')
    expect(gradeFor(32.9).grade).toBe('F')
  })

  it('averages 1st and 2nd papers, adds only 4th-subject points above 2 and caps at 5', () => {
    const r = predictGpa([
      { code: '101', fourth: false, score: 85 }, { code: '102', fourth: false, score: 75 }, // avg 80 -> 5
      { code: '109', fourth: false, score: 72 }, // 4
      { code: '126', fourth: true, score: 82 }, // 5 -> +3
    ])
    expect(r.counted).toBe(2)
    expect(r.gpa).toBe(5) // (5 + 4 + 3) / 2 = 6 -> capped
    const r2 = predictGpa([{ code: '109', fourth: false, score: 65 }, { code: '136', fourth: false, score: 55 }, { code: '126', fourth: true, score: 45 }])
    expect(r2.gpa).toBe(3.25) // (3.5 + 3 + 0) / 2
  })

  it('fails on an F in a main subject but not in the 4th subject', () => {
    expect(predictGpa([{ code: '109', fourth: false, score: 90 }, { code: '136', fourth: false, score: 20 }]).fail).toBe(true)
    const r = predictGpa([{ code: '109', fourth: false, score: 90 }, { code: '126', fourth: true, score: 10 }])
    expect(r.fail).toBe(false)
    expect(r.gpa).toBe(5)
  })

  it('leaves out subjects without data', () => {
    const r = predictGpa([{ code: '109', fourth: false, score: 70 }, { code: '136', fourth: false, score: null }])
    expect(r).toMatchObject({ gpa: 4, counted: 1, total: 2, missing: ['136'] })
  })
})

describe('readiness', () => {
  it('is null before the student has done anything', () => {
    expect(readiness({ mocks: [], mockAvailable: true, chapters: [{ mastery: 0, boardFreq: 3 }], drills: [0] })).toBeNull()
  })

  it('combines 55% mocks, 25% frequency-weighted mastery and 20% drills', () => {
    const r = readiness({
      mocks: [80, 60, 10], mockAvailable: true, // last two -> 70
      chapters: [{ mastery: 100, boardFreq: 3 }, { mastery: 0, boardFreq: 0 }], // (400 + 0) / 5 = 80
      drills: [50, 100], // 75
    })!
    expect(r.parts).toEqual({ mock: 70, mastery: 80, drill: 75 })
    expect(r.score).toBe(Math.round(0.55 * 70 + 0.25 * 80 + 0.2 * 75))
  })

  it('scales up the other weights when a subject has no mock paper or drills', () => {
    const r = readiness({ mocks: [], mockAvailable: false, chapters: [{ mastery: 60, boardFreq: 0 }], drills: [] })!
    expect(r.score).toBe(60)
    expect(r.parts.mock).toBeNull()
  })
})
