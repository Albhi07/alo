import { db, type AloDB, type OutboxItem, type SyncedRow, type SyncedTable } from './index'
import { uuid } from '../lib/id'

/**
 * Offline-first writes: every change lands in IndexedDB and in an outbox in the same
 * transaction. A background flush pushes the outbox to the server when online.
 * Conflicts resolve last-write-wins per record using `updated_at` (enforced again
 * server-side by a trigger), and ids are minted on the device, so a retried upsert
 * can never create a duplicate.
 */

export interface Remote {
  /** Upsert rows into a table. Must be idempotent on `id`. Throws on failure. */
  upsert(table: SyncedTable, rows: SyncedRow[]): Promise<void>
}

export const MAX_BACKOFF_MS = 10 * 60_000

export function backoff(attempts: number): number {
  return Math.min(MAX_BACKOFF_MS, 5_000 * 2 ** Math.max(0, attempts - 1))
}

/** Write a row locally and queue it for sync. Returns the stored row. */
export type RowInput = Partial<SyncedRow> & Record<string, unknown>

export async function saveLocal<T extends RowInput>(
  table: SyncedTable,
  row: T,
  database: AloDB = db,
  now = new Date(),
): Promise<T & SyncedRow> {
  const stamp = now.toISOString()
  const full = {
    ...row,
    id: row.id ?? uuid(),
    user_id: row.user_id ?? (await currentUserId(database)),
    created_at: row.created_at ?? stamp,
    updated_at: stamp,
  } as T & SyncedRow
  await database.transaction('rw', database.table(table), database.outbox, async () => {
    await database.table(table).put(full)
    await enqueue(table, full, database)
  })
  return full
}

/** Add to the outbox, collapsing with a pending entry for the same row. */
export async function enqueue(table: SyncedTable, payload: SyncedRow, database: AloDB = db) {
  const existing = await database.outbox.where('[table+row_id]').equals([table, payload.id]).first()
  const item: OutboxItem = {
    table, row_id: payload.id, payload, updated_at: payload.updated_at, attempts: 0, next_at: 0,
  }
  if (existing) await database.outbox.update(existing.seq!, item)
  else await database.outbox.add(item)
}

export async function pendingCount(database: AloDB = db) {
  return database.outbox.count()
}

async function currentUserId(database: AloDB): Promise<string | null> {
  const row = await database.kv.get('auth.user_id')
  return (row?.value as string | undefined) ?? null
}

let flushing: Promise<FlushResult> | null = null
export interface FlushResult { sent: number; failed: number; skipped: number }

/**
 * Push due outbox items, batched per table. Rows without a user (guest mode) are
 * kept until the student signs in and `adoptGuestRows` stamps them.
 */
export function flush(remote: Remote, database: AloDB = db, now = Date.now()): Promise<FlushResult> {
  if (flushing) return flushing
  flushing = (async () => {
    const res: FlushResult = { sent: 0, failed: 0, skipped: 0 }
    const due = await database.outbox.where('next_at').belowOrEqual(now).sortBy('seq')
    const byTable = new Map<SyncedTable, OutboxItem[]>()
    for (const item of due) {
      if (!item.payload.user_id) { res.skipped++; continue }
      const list = byTable.get(item.table) ?? []
      list.push(item)
      byTable.set(item.table, list)
    }
    for (const [table, items] of byTable) {
      // profiles must land before rows that reference the user; Map keeps insertion order,
      // and a profile is always the first thing written, so no extra sort is needed.
      for (let i = 0; i < items.length; i += 100) {
        const chunk = items.slice(i, i + 100)
        try {
          await remote.upsert(table, chunk.map((c) => c.payload))
          await database.transaction('rw', database.outbox, async () => {
            for (const c of chunk) {
              // Only drop the entry if it wasn't replaced by a newer write while we were sending.
              const cur = await database.outbox.get(c.seq!)
              if (cur && cur.updated_at === c.updated_at) await database.outbox.delete(c.seq!)
            }
          })
          res.sent += chunk.length
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e)
          await database.transaction('rw', database.outbox, async () => {
            for (const c of chunk) {
              const attempts = c.attempts + 1
              await database.outbox.update(c.seq!, { attempts, next_at: now + backoff(attempts), last_error: msg })
            }
          })
          res.failed += chunk.length
        }
      }
    }
    return res
  })().finally(() => { flushing = null })
  return flushing
}

/** After sign-in: give every guest row (and queued payload) the new user id. */
export async function adoptGuestRows(userId: string, database: AloDB = db) {
  const tables = ['profiles', 'attempts', 'srs_cards', 'mastery', 'mock_results', 'focus_sessions', 'plan_items', 'events'] as const
  await database.transaction('rw', [...tables.map((t) => database.table(t)), database.outbox, database.kv], async () => {
    await database.kv.put({ key: 'auth.user_id', value: userId })
    for (const t of tables) {
      await database.table(t).filter((r: SyncedRow) => !r.user_id).modify({ user_id: userId })
    }
    // The profile row's id is the auth user id on the server.
    const guestProfile = await database.profiles.filter((p) => p.id !== userId).first()
    if (guestProfile) {
      await database.profiles.delete(guestProfile.id)
      const outboxEntry = await database.outbox.where('[table+row_id]').equals(['profiles', guestProfile.id]).first()
      if (outboxEntry) await database.outbox.delete(outboxEntry.seq!)
      const moved = { ...guestProfile, id: userId, user_id: userId, updated_at: new Date().toISOString() }
      await database.profiles.put(moved)
      await enqueue('profiles', moved, database)
    }
    await database.outbox.filter((o) => !o.payload.user_id).modify((o) => {
      o.payload = { ...o.payload, user_id: userId }
      o.next_at = 0
    })
  })
}
