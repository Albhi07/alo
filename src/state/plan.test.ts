import { describe, it, expect, beforeEach } from 'vitest'
import { readFileSync } from 'node:fs'
import { db, type LocalProfile } from '../db'
import { applyIndex } from '../content/repo'
import { ensurePlan, setDone, type PlanItem } from './plan'

const index = JSON.parse(readFileSync('public/content/index.json', 'utf8'))
const profile = { id: 'local', medium: 'bn', group: 'science', fourth_subject_code: '126', board: 'dhaka', daily_target_min: 180, onboarded: true } as unknown as LocalProfile
const items = async () => ((await db.plan_items.toArray()) as unknown as PlanItem[]).filter((x) => !x.deleted)

beforeEach(async () => { await db.delete(); await db.open(); await applyIndex(index) })

describe('stored plan', () => {
  it('stores a week, keeps finished tasks and re-plans the next day without duplicates', async () => {
    await ensurePlan(profile, new Date('2027-02-01T09:00:00'))
    const week = await items()
    expect(new Set(week.map((x) => x.date)).size).toBe(7)
    const first = week.find((x) => x.date === '2027-02-01' && x.slot === 0)!
    await setDone(first, true)
    await ensurePlan(profile, new Date('2027-02-01T20:00:00')) // same day: nothing changes
    expect((await items()).length).toBe(week.length)

    await ensurePlan(profile, new Date('2027-02-02T09:00:00')) // next day: window moves on
    const after = await items()
    expect(after.find((x) => x.id === first.id)!.done).toBe(true)
    const keys = after.map((x) => `${x.date}:${x.slot}`)
    expect(new Set(keys).size).toBe(keys.length)
    expect(after.some((x) => x.date === '2027-02-08')).toBe(true)
  })
})
