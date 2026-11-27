import { describe, it, expect, beforeEach } from 'vitest'
import { readFileSync } from 'node:fs'
import { db } from '../db'
import { applyIndex, applyPack } from '../content/repo'
import { buildQueue, computeMastery, recordMcqAnswer, dueCount } from './practice'
import type { ChapterPack, QuestionRow } from '../data/content-types'

const index = JSON.parse(readFileSync('public/content/index.json', 'utf8'))
const pack: ChapterPack = JSON.parse(readFileSync(`public/content/chapters/${'2fb8b926-5747-545d-9af6-82cb4940584c.bn.json' /* Mathematics: Algebraic expressions; the counts below are for this pack */}`, 'utf8'))
const cid = pack.chapter_id
const ans = (q: QuestionRow) => (q.answer_json as { index: number }).index

beforeEach(async () => { await db.delete(); await db.open(); await applyIndex(index); await applyPack(pack, false) })

describe('practice', () => {
  it('starts with unseen questions and keeps a passage together', async () => {
    const q = await buildQueue(cid, 'bn', 20)
    expect(q).toHaveLength(20)
    const sit = q.map((x, i) => (x.subtype === 'situation' ? i : -1)).filter((i) => i >= 0)
    expect(sit[2] - sit[0]).toBe(2)
  })

  it('a wrong answer comes back first and lowers mastery; a right one raises it', async () => {
    const [first, second] = await buildQueue(cid, 'bn', 2)
    await recordMcqAnswer(first, (ans(first) + 1) % 4, 5000)
    await recordMcqAnswer(second, ans(second), 5000)
    expect(await dueCount(cid, 'bn')).toBe(1)
    const next = await buildQueue(cid, 'bn', 3)
    expect(next[0].id).toBe(first.id)
    expect(next.map((x) => x.id)).not.toContain(second.id) // not due until tomorrow, unseen come first
    // 1 of 20 MCQs right, lesson not finished: 0.8 * 1/20 = 4%
    expect(await computeMastery(cid, 'bn')).toBe(4)
    const m = await db.mastery.toArray()
    expect(m).toHaveLength(1)
    expect(m[0].score).toBe(4)
  })

  it('queues attempts, cards and mastery for sync', async () => {
    const [q] = await buildQueue(cid, 'bn', 1)
    await recordMcqAnswer(q, ans(q), 3000)
    const tables = (await db.outbox.toArray()).map((o) => o.table).sort()
    expect(tables).toEqual(['attempts', 'events', 'mastery', 'srs_cards'])
  })
})
