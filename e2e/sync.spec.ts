import { expect, test } from '@playwright/test'
import { ALGEBRA, answerRound, fakeSupabase, idbAll, onboard, USER } from './helpers'

test('work done offline syncs on reconnect, survives a failed upload, and never duplicates', async ({ page, context }) => {
  const server = await fakeSupabase(context)
  await onboard(page)
  await page.goto(`/chapters/${ALGEBRA}`)
  await expect(page.getByRole('tab', { name: 'বহুনির্বাচনি' })).toBeVisible()
  await page.waitForTimeout(1500) // first sync of the profile

  await page.goto(`/practice/${ALGEBRA}`)
  await expect(page.locator('article').first()).toBeVisible()
  await context.setOffline(true)
  await answerRound(page)
  const local = await idbAll<{ id: string; user_id: string }>(page, 'attempts')
  expect(local.length).toBeGreaterThanOrEqual(5)
  expect(local.every((a) => a.user_id === USER)).toBe(true)
  expect(server.upserts.attempts ?? []).toHaveLength(0)

  // Back online, but the server fails the first upload: rows stay queued and are retried.
  server.failNext(1)
  await context.setOffline(false)
  await page.evaluate(() => window.dispatchEvent(new Event('online')))
  await expect.poll(async () => (await idbAll(page, 'outbox')).length, { timeout: 30_000 }).toBeGreaterThan(0)
  // Retry after the backoff (5 s); the app also syncs when it becomes visible again.
  await page.waitForTimeout(6000)
  await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')))
  await expect.poll(async () => {
    const left = await idbAll<{ table: string; last_error?: string }>(page, 'outbox')
    return left.length ? JSON.stringify(left.map((o) => [o.table, o.last_error])) : 0
  }, { timeout: 30_000 }).toBe(0)

  const sent = server.upserts.attempts ?? []
  const ids = new Set(sent.map((r) => r.id))
  expect(ids).toEqual(new Set(local.map((a) => a.id)))
  // Every row was sent once (an upsert on id would make a resend harmless anyway).
  expect(sent.length).toBe(ids.size)
  expect((server.upserts.events ?? []).length).toBeGreaterThan(0)
})
