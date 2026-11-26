import Dexie, { type Table } from 'dexie'
import type { Board, Group, Lang, Medium } from '../data/catalog'

/** Every synced record carries these. `user_id` is null while in guest mode. */
export interface SyncedRow {
  id: string
  user_id: string | null
  updated_at: string
  created_at: string
  deleted?: boolean
}

export interface LocalProfile extends SyncedRow {
  display_name: string | null
  role: 'student' | 'parent' | 'teacher' | 'admin'
  language: Lang
  medium: Medium
  board: Board
  group: Group
  religion_code: string
  fourth_subject_code: string
  daily_target_min: number
  exam_year: number
  onboarded: boolean
}

/** Tables whose rows are written locally first and pushed to Supabase. */
export const SYNCED_TABLES = [
  'profiles', 'attempts', 'srs_cards', 'mastery', 'mock_results', 'focus_sessions', 'plan_items', 'events',
] as const
export type SyncedTable = (typeof SYNCED_TABLES)[number]

export interface OutboxItem {
  seq?: number
  table: SyncedTable
  row_id: string
  payload: SyncedRow
  updated_at: string
  attempts: number
  next_at: number
  last_error?: string
}

export interface KV { key: string; value: unknown }

export class AloDB extends Dexie {
  kv!: Table<KV, string>
  profiles!: Table<LocalProfile, string>
  attempts!: Table<SyncedRow & Record<string, unknown>, string>
  srs_cards!: Table<SyncedRow & Record<string, unknown>, string>
  mastery!: Table<SyncedRow & Record<string, unknown>, string>
  mock_results!: Table<SyncedRow & Record<string, unknown>, string>
  focus_sessions!: Table<SyncedRow & Record<string, unknown>, string>
  plan_items!: Table<SyncedRow & Record<string, unknown>, string>
  events!: Table<SyncedRow & Record<string, unknown>, string>
  outbox!: Table<OutboxItem, number>

  constructor(name = 'alo') {
    super(name)
    this.version(1).stores({
      kv: 'key',
      profiles: 'id, user_id',
      attempts: 'id, user_id, question_id, created_at',
      srs_cards: 'id, user_id, question_id, due_on',
      mastery: 'id, user_id, chapter_id',
      mock_results: 'id, user_id, mock_id, submitted_at',
      focus_sessions: 'id, user_id, started_at',
      plan_items: 'id, user_id, date',
      events: 'id, user_id, created_at',
      outbox: '++seq, [table+row_id], next_at',
    })
  }
}

export const db = new AloDB()

export async function kvGet<T>(key: string, fallback: T): Promise<T> {
  const row = await db.kv.get(key)
  return row ? (row.value as T) : fallback
}
export async function kvSet(key: string, value: unknown): Promise<void> {
  await db.kv.put({ key, value })
}
