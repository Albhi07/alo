import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '../db'
import { getTimer, secondsLeft, startFocus, stopFocus, tick } from './focus'

const T0 = Date.UTC(2027, 0, 10, 4, 0, 0)
const MIN = 60_000
beforeEach(async () => { await db.delete(); await db.open() })

describe('focus timer', () => {
  it('saves the work block with its real end time, even if the app was closed', async () => {
    await startFocus('25/5', '109', T0)
    expect(secondsLeft((await getTimer())!, T0 + 10 * MIN)).toBe(15 * 60)
    // App reopened 27 minutes later: work saved at 25:00, now in the break.
    const t = await tick(T0 + 27 * MIN)
    expect(t).toMatchObject({ phase: 'break', started_at: T0 + 25 * MIN })
    const rows = await db.focus_sessions.toArray()
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({ minutes: 25, subject_code: '109', ended_at: new Date(T0 + 25 * MIN).toISOString() })
    // Long after the break: timer cleared, still one session.
    expect(await tick(T0 + 3 * 60 * MIN)).toBeNull()
    expect(await db.focus_sessions.count()).toBe(1)
  })

  it('stopping early keeps whole minutes, and under a minute keeps nothing', async () => {
    await startFocus('50/10', null, T0)
    await stopFocus(T0 + 12 * MIN + 30_000)
    expect((await db.focus_sessions.toArray())[0]).toMatchObject({ minutes: 12 })
    await startFocus('25/5', null, T0)
    await stopFocus(T0 + 30_000)
    expect(await db.focus_sessions.count()).toBe(1)
  })
})
