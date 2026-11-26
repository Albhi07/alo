import { expect, test } from '@playwright/test'
import { ALGEBRA, answerRound, idbAll, onboard } from './helpers'

test('after one online visit, a downloaded chapter works with the network off: lesson, MCQs and Focus', async ({ page, context }) => {
  await page.clock.install({ time: new Date() })
  await onboard(page)
  // The service worker must control the page before we cut the network.
  await page.waitForFunction(() => navigator.serviceWorker?.controller, null, { timeout: 30_000 })
  await page.goto(`/chapters/${ALGEBRA}`)
  await page.getByRole('button', { name: 'অফলাইনের জন্য ডাউনলোড করো' }).click()
  await expect(page.getByText('ডাউনলোড করা আছে')).toBeVisible({ timeout: 30_000 })

  await context.setOffline(true)
  await page.reload()
  await expect(page.getByText(/অফলাইনে আছেন/).first()).toBeVisible()

  // Lesson: every "check yourself" must be answered before moving on.
  await page.getByRole('link', { name: 'শুরু করো' }).first().click()
  await expect(page.getByRole('button', { name: /পরের দৃশ্য|পাঠ শেষ করো/ })).toBeVisible()
  for (let i = 0; i < 15; i++) {
    const next = page.getByRole('button', { name: /পরের দৃশ্য|পাঠ শেষ করো/ })
    if (await next.isDisabled()) await page.getByRole('radio').first().click()
    const last = (await next.innerText()).includes('পাঠ শেষ')
    await next.click()
    if (last) break
  }
  await expect(page.getByRole('button', { name: 'পাঠটি আবার দেখো' })).toBeVisible()
  const events = await idbAll<{ name: string }>(page, 'events')
  expect(events.some((e) => e.name === 'lesson_completed')).toBe(true)

  // MCQ practice.
  await page.goto(`/practice/${ALGEBRA}`)
  await expect(page.locator('article').first()).toBeVisible()
  await answerRound(page)
  const attempts = await idbAll(page, 'attempts')
  expect(attempts.length).toBeGreaterThanOrEqual(5)

  // Focus: start, then let 25 minutes pass with the app closed.
  await page.goto('/focus')
  await page.getByRole('button', { name: 'শুরু করো' }).click()
  await expect(page.getByRole('button', { name: 'থামাও' })).toBeVisible()
  await page.goto('about:blank')
  await page.clock.fastForward('26:00')
  await page.goto('/focus')
  await expect(page.getByRole('button', { name: 'বিরতি বাদ দাও' })).toBeVisible()
  await expect.poll(async () => (await idbAll<{ minutes: number }>(page, 'focus_sessions')).map((f) => f.minutes)).toContain(25)
})
