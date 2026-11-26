import { describe, it, expect, beforeEach, vi } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { db } from '../db'
import { applyIndex, ensureChapter, refreshIndex } from './repo'
import type { ContentSource } from './source'
import type { ChapterPack, ContentIndex } from '../data/content-types'

const index: ContentIndex = JSON.parse(readFileSync('public/content/index.json', 'utf8'))
const packFile = readdirSync('public/content/chapters').find((f) => f.endsWith('.bn.json'))!
const pack: ChapterPack = JSON.parse(readFileSync(`public/content/chapters/${packFile}`, 'utf8'))

const source: ContentSource = { index: vi.fn(async () => index), chapterPack: vi.fn(async () => pack) }

beforeEach(async () => {
  await db.delete(); await db.open(); vi.clearAllMocks()
})

describe('content repo', () => {
  it('caches the index once and skips unchanged versions', async () => {
    expect(await refreshIndex(source)).toBe(true)
    expect(await refreshIndex(source)).toBe(false)
    expect(await db.c_subjects.count()).toBe(25)
    expect(await db.c_chapters.where('subject_code').equals('109').count()).toBe(17)
  })

  it('stores a chapter pack and re-applies it without duplicates', async () => {
    await applyIndex(index)
    await ensureChapter(pack.chapter_id, 'bn', { source, pin: true })
    await ensureChapter(pack.chapter_id, 'bn', { source, pin: true })
    expect(await db.c_questions.count()).toBe(24)
    expect(await db.c_lessons.count()).toBe(1)
    expect(await db.c_scenes.count()).toBe(10)
    expect((await db.c_packs.get(`${pack.chapter_id}.bn`))?.pinned).toBe(true)
    // Up-to-date and not pinning again: no fetch.
    await ensureChapter(pack.chapter_id, 'bn', { source })
    expect(source.chapterPack).toHaveBeenCalledTimes(2)
  })
})
