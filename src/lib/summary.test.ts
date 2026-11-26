import { describe, it, expect } from 'vitest'
import { buildSummary, chapterAverages, masteryGrid, summaryKey, toCsv, upcomingPapers } from './summary'

const input = {
  profile: { display_name: '  Rafi ', exam_year: 2027, daily_target_min: 240 },
  subjects: ['101', '109'],
  stats: { week: [0, 30, 60, 0, 90, 120, 45.4].map((minutes, i) => ({ date: `2027-01-0${i + 1}`, minutes })), streak: { days: 5, restUsedThisWeek: true } },
  readiness: { subjects: [{ code: '101', score: 61.6 }, { code: '109', score: null }], gpa: { low: 3.2, mid: 3.6, high: 4.0, fail: false } },
  now: new Date('2027-01-07T10:00:00Z'),
}

describe('student summary', () => {
  it('keeps only what parents and teachers need, rounded', () => {
    const s = buildSummary(input)
    expect(s).toMatchObject({ name: 'Rafi', streak: 5, rest_used: true, as_of: '2027-01-07', week: [0, 30, 60, 0, 90, 120, 45] })
    expect(s.readiness).toEqual([{ code: '101', score: 62 }, { code: '109', score: null }])
    expect(s.gpa).toEqual({ low: 3.2, mid: 3.6, high: 4, fail: false })
  })
  it('skips re-uploading when only the time changed', () => {
    const a = buildSummary(input)
    const b = buildSummary({ ...input, now: new Date('2027-01-07T11:00:00Z') })
    expect(summaryKey(a)).toBe(summaryKey(b))
    expect(summaryKey(buildSummary({ ...input, stats: { ...input.stats, streak: { days: 6, restUsedThisWeek: true } } }))).not.toBe(summaryKey(a))
  })
  it('lists the next papers for the student\'s subjects only', () => {
    const routine = [
      { exam_year: 2027, date: '2027-03-25', subject_code: '109' },
      { exam_year: 2027, date: '2027-03-14', subject_code: '101' },
      { exam_year: 2027, date: '2027-03-16', subject_code: '102' },
      { exam_year: 2026, date: '2027-03-20', subject_code: '109' },
    ]
    expect(upcomingPapers(routine, { exam_year: 2027, subjects: ['101', '109'] }, '2027-03-15').map((r) => r.date)).toEqual(['2027-03-25'])
    expect(upcomingPapers(routine, { exam_year: 2027, subjects: ['101', '109'] }, '2027-01-01').map((r) => r.subject_code)).toEqual(['101', '109'])
  })
})

describe('class dashboard helpers', () => {
  it('builds a students × chapters grid and class averages', () => {
    const grid = masteryGrid([{ user_id: 'a' }, { user_id: 'b' }], [{ id: 'c1' }, { id: 'c2' }], [
      { user_id: 'a', chapter_id: 'c1', score: 80 }, { user_id: 'b', chapter_id: 'c1', score: 41 },
    ])
    expect(grid).toEqual([[80, null], [41, null]])
    expect(chapterAverages(grid, 2)).toEqual([61, null])
  })
  it('writes CSV that Excel reads, with quotes and no formula injection', () => {
    const csv = toCsv([['নাম', 'score'], ['Rafi, "R"', 80], ['=HYPERLINK("x")', null]])
    expect(csv.startsWith('﻿')).toBe(true)
    expect(csv).toContain('"Rafi, ""R""",80\r\n')
    expect(csv).toContain(`"'=HYPERLINK(""x"")",\r\n`)
  })
})
