import { describe, it, expect, beforeEach } from 'vitest'
import { AloDB } from './index'
import { saveLocal, flush, adoptGuestRows, backoff, type Remote } from './sync'
import type { SyncedRow, SyncedTable } from './index'

let db: AloDB
let n = 0
beforeEach(async () => { db = new AloDB(`test-${n++}`); await db.open() })

/** A fake server that applies last-write-wins by updated_at, like the Postgres trigger. */
function fakeServer() {
  const rows = new Map<string, SyncedRow>()
  let failNext = 0
  const remote: Remote = {
    async upsert(table: SyncedTable, batch: SyncedRow[]) {
      if (failNext > 0) { failNext--; throw new Error('network down') }
      for (const r of batch) {
        const k = `${table}:${r.id}`
        const cur = rows.get(k)
        if (!cur || cur.updated_at <= r.updated_at) rows.set(k, r)
      }
    },
  }
  return { rows, remote, fail: (k: number) => { failNext = k } }
}

describe('sync outbox', () => {
  it('keeps guest rows until sign-in, then sends them once', async () => {
    const s = fakeServer()
    await saveLocal('attempts', { question_id: 'q1', correct: true }, db)
    expect(await flush(s.remote, db)).toEqual({ sent: 0, failed: 0, skipped: 1 })
    await adoptGuestRows('u1', db)
    expect((await flush(s.remote, db)).sent).toBe(1)
    expect(s.rows.size).toBe(1)
    expect([...s.rows.values()][0].user_id).toBe('u1')
    expect(await db.outbox.count()).toBe(0)
  })

  it('collapses repeated edits of one row and never duplicates on retry', async () => {
    const s = fakeServer()
    await db.kv.put({ key: 'auth.user_id', value: 'u1' })
    const r = await saveLocal('focus_sessions', { minutes: 10 }, db, new Date('2027-01-01T10:00:00Z'))
    await saveLocal('focus_sessions', { ...r, minutes: 25 }, db, new Date('2027-01-01T10:25:00Z'))
    expect(await db.outbox.count()).toBe(1)
    s.fail(1)
    const first = await flush(s.remote, db, 1000)
    expect(first.failed).toBe(1)
    // Not due yet because of backoff.
    expect((await flush(s.remote, db, 1000)).sent).toBe(0)
    const second = await flush(s.remote, db, 1000 + backoff(1))
    expect(second.sent).toBe(1)
    await flush(s.remote, db, 1000 + backoff(1)) // a second flush sends nothing new
    expect(s.rows.size).toBe(1)
    expect((s.rows.get(`focus_sessions:${r.id}`) as unknown as { minutes: number }).minutes).toBe(25)
  })

  it('moves the guest profile to the auth user id', async () => {
    await saveLocal('profiles', { id: 'guest-1', onboarded: true }, db)
    await adoptGuestRows('u9', db)
    const p = await db.profiles.toArray()
    expect(p.map((x) => x.id)).toEqual(['u9'])
    const out = await db.outbox.toArray()
    expect(out.map((o) => o.row_id)).toEqual(['u9'])
  })

  it('backs off exponentially with a cap', () => {
    expect(backoff(1)).toBe(5000)
    expect(backoff(2)).toBe(10000)
    expect(backoff(30)).toBe(600000)
  })
})
