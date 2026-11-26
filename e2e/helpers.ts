import { readFileSync, readdirSync } from 'node:fs'
import type { BrowserContext, Page, Route } from '@playwright/test'

export const ALGEBRA = '2fb8b926-5747-545d-9af6-82cb4940584c' // Mathematics: Algebraic expressions

/** The 60-second onboarding as a Bangla-version science student (Higher Maths as 4th subject). */
export async function onboard(page: Page) {
  await page.goto('/welcome')
  await page.getByText('লগইন ছাড়াই শুরু করুন').click()
  await page.getByText('বাংলা', { exact: true }).click()
  await page.getByText('বাংলা ভার্সন').click()
  await page.getByText('ঢাকা').click()
  await page.getByText('বিজ্ঞান', { exact: true }).click()
  await page.getByText('উচ্চতর গণিত').click()
  await page.getByRole('button', { name: 'পরের ধাপ' }).click()
  await page.getByRole('button', { name: 'শুরু করি' }).click()
  await page.waitForURL((u) => u.pathname === '/' || u.pathname.endsWith('/'))
}

/** Rows in an IndexedDB store of the app's database. */
export function idbAll<T = Record<string, unknown>>(page: Page, store: string): Promise<T[]> {
  return page.evaluate((s) => new Promise<T[]>((ok, bad) => {
    const r = indexedDB.open('alo')
    r.onerror = () => bad(r.error)
    r.onsuccess = () => { const q = r.result.transaction(s).objectStore(s).getAll(); q.onsuccess = () => ok(q.result as T[]) }
  }), store)
}

/** Answer every MCQ in a practice round (first option each time) until the round summary shows. */
export async function answerRound(page: Page, max = 40) {
  for (let i = 0; i < max; i++) {
    const next = page.getByRole('button', { name: /পরের প্রশ্ন|ফল দেখো/ })
    const option = page.locator('article [role="radio"], article button').first()
    if (!(await option.count())) break
    await option.click()
    if (!(await next.count())) break
    await next.click()
  }
}

// ---------------------------------------------------------------------------
// Fake Supabase for the sync test
// ---------------------------------------------------------------------------
const CONTENT = 'public/content'
const index = JSON.parse(readFileSync(`${CONTENT}/index.json`, 'utf8'))
const packs = readdirSync(`${CONTENT}/chapters`).map((f) => JSON.parse(readFileSync(`${CONTENT}/chapters/${f}`, 'utf8')))
const stamp = '2026-11-01T00:00:00Z'
const tables: Record<string, unknown[]> = {
  subjects: index.subjects, chapters: index.chapters, exam_config: index.exam_config, routine: index.routine, notices: index.notices,
  mocks: index.mocks.map((m: Record<string, unknown>) => ({ ...m, updated_at: stamp })),
}

export const USER = '0b5e1c9a-1111-4222-8333-944455556666'

export interface FakeServer {
  /** Every row the app upserted, by table, in order (a retried row appears again). */
  upserts: Record<string, { id: string }[]>
  /** Make the next N upserts fail with a server error. */
  failNext(n: number): void
}

export async function fakeSupabase(ctx: BrowserContext): Promise<FakeServer> {
  await ctx.addInitScript((uid) => {
    const exp = Math.floor(Date.now() / 1000) + 36_000
    localStorage.setItem('sb-sb-auth-token', JSON.stringify({
      access_token: 'e2e.token.x', refresh_token: 'r', token_type: 'bearer', expires_in: 36_000, expires_at: exp,
      user: { id: uid, aud: 'authenticated', role: 'authenticated', app_metadata: {}, user_metadata: {}, created_at: '2026-01-01T00:00:00Z' },
    }))
  }, USER)
  const server: FakeServer = { upserts: {}, failNext(n) { failing = n } }
  let failing = 0
  const json = (route: Route, body: unknown, status = 200) =>
    route.fulfill({ status, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify(body) })
  await ctx.route('http://sb.test/**', async (route) => {
    const req = route.request()
    const url = new URL(req.url())
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 200, headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' } })
    if (url.pathname.startsWith('/auth/v1/user')) return json(route, { id: USER })
    const table = url.pathname.match(/^\/rest\/v1\/(\w+)/)?.[1]
    if (!table || url.pathname.includes('/rpc/')) return json(route, null)
    const eq = (k: string) => url.searchParams.get(k)?.replace(/^eq\./, '')
    if (req.method() === 'GET') {
      const chapter = eq('chapter_id'), medium = eq('medium')
      const pack = packs.find((p) => p.chapter_id === chapter && p.medium === medium)
      if (table === 'lessons') return json(route, chapter ? (pack?.lessons ?? []).map((l: Record<string, unknown>) => ({ updated_at: stamp, ...l })) : packs.flatMap((p) => p.lessons.map((l: Record<string, unknown>) => ({ chapter_id: p.chapter_id, medium: p.medium, updated_at: stamp, ...l }))))
      if (table === 'questions') return json(route, chapter ? (pack?.questions ?? []) : packs.flatMap((p) => p.questions.map((q: Record<string, unknown>) => ({ updated_at: stamp, ...q }))))
      if (table === 'method_sheets') return json(route, pack?.method_sheets ?? [])
      if (table === 'drill_templates') return json(route, pack?.drill_templates ?? [])
      if (tables[table]) return json(route, tables[table].map((r) => ({ updated_at: stamp, ...(r as object) })))
      if (req.headers()['accept']?.includes('vnd.pgrst.object')) return json(route, { code: 'PGRST116', message: 'no rows', details: '', hint: '' }, 406)
      return json(route, [])
    }
    if (failing > 0) { failing--; return json(route, { message: 'temporarily unavailable' }, 503) }
    const rows = req.postDataJSON()
    for (const r of Array.isArray(rows) ? rows : [rows]) (server.upserts[table] ??= []).push(r)
    return json(route, [], 201)
  })
  return server
}
