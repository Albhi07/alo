import { describe, it, expect, beforeEach } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { db } from '../db'
import { applyIndex } from '../content/repo'
import type { MockRow } from '../data/content-types'
import {
  answerMcq, choiceProblem, enforceDeadlines, finishMarking, getSession, secondsLeft, startMock, submitCq, toggleChosen, toggleRubric,
} from './mock'
import { computeReadiness } from './readiness'
import type { LocalProfile } from '../db'

const index = JSON.parse(readFileSync('public/content/index.json', 'utf8'))
const mock: MockRow = JSON.parse(readFileSync(`public/content/mocks/${readdirSync('public/content/mocks').find((f) => JSON.parse(readFileSync(`public/content/mocks/${f}`, 'utf8')).medium === 'bn')}`, 'utf8'))
const profile = { id: 'local', medium: 'bn', group: 'science', fourth_subject_code: '126', onboarded: true } as unknown as LocalProfile
const T0 = Date.UTC(2027, 0, 10, 4, 0, 0)
const MIN = 60_000

beforeEach(async () => { await db.delete(); await db.open(); await applyIndex(index); await db.c_mocks.put({ ...mock, version: 'x' }) })

describe('mock exam', () => {
  it('auto-submits the MCQ part at 30:00 and the CQ part at 2:30:00 after that, even after the app was closed', async () => {
    await startMock(mock, T0)
    const qs = mock.paper_json.mcq
    for (const q of qs.slice(0, 20)) await answerMcq(q.id, q.answer) // 20 right
    for (const q of qs.slice(20, 25)) await answerMcq(q.id, (q.answer + 1) % 4) // 5 wrong, 5 blank

    let s = await enforceDeadlines(mock, T0 + 29 * MIN + 59_000)
    expect(s!.phase).toBe('mcq')
    expect(secondsLeft(s!, T0 + 29 * MIN + 59_000)).toBe(1)

    s = await enforceDeadlines(mock, T0 + 30 * MIN)
    expect(s!.phase).toBe('cq')
    expect(s!.mcq_score).toBe(20)
    expect(s!.cq_started_at).toBe(T0 + 30 * MIN)
    // The result is saved straight away, so readiness moves before marking.
    const r1 = await computeReadiness(profile)
    expect(r1.subjects.find((x) => x.code === '109')!.mocksTaken).toBe(1)

    // App closed for hours: on reopening, the CQ deadline is applied at exactly 2:30:00 after it started.
    s = await enforceDeadlines(mock, T0 + 10 * 60 * MIN)
    expect(s!.phase).toBe('mark')
    expect(s!.submitted_at).toBe(T0 + 30 * MIN + 150 * MIN)
    const rows = await db.mock_results.toArray()
    expect(rows).toHaveLength(1) // same row updated, never duplicated
  })

  it('checks the CQ choice rule and scores self-marking from the rubric', async () => {
    await startMock(mock, T0)
    await enforceDeadlines(mock, T0 + 30 * MIN)
    const [ka, kha, ga] = mock.paper_json.sections
    for (const c of [...ka.cqs.slice(0, 3), ...kha.cqs.slice(0, 3), ga.cqs[0]]) await toggleChosen(c.id)
    expect(choiceProblem((await getSession())!, mock)).toBe('section') // only 1 from section C
    await toggleChosen(kha.cqs[2].id)
    await toggleChosen(ga.cqs[1].id)
    expect(choiceProblem((await getSession())!, mock)).toBeNull()

    await submitCq(mock, T0 + 60 * MIN)
    const c = ka.cqs[0]
    for (const p of c.parts) for (let i = 0; i < p.rubric.length; i++) await toggleRubric(c.id, p.part, i) // full marks: 10
    const id = await finishMarking(mock)
    const row = (await db.mock_results.get(id!)) as unknown as { total: number; cq_score: number; self_marked: boolean }
    expect(row).toMatchObject({ cq_score: 10, total: 10, self_marked: true })
    expect(await getSession()).toBeNull()
  })
})
