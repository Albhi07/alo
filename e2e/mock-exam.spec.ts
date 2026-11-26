import { expect, test } from '@playwright/test'
import { onboard } from './helpers'

test('a timed mock auto-submits MCQ at 30:00 and CQ at 2:30:00, and the result reaches readiness', async ({ page }) => {
  await page.clock.install({ time: new Date('2027-01-10T10:00:00+06:00') })
  await onboard(page)
  await page.getByRole('navigation').getByRole('link', { name: 'পরীক্ষা' }).click()
  await page.getByRole('link', { name: 'খোলো' }).first().click()
  await page.getByRole('button', { name: 'পরীক্ষা শুরু করো' }).click()

  const groups = page.getByRole('radiogroup')
  for (let i = 0; i < 10; i++) await groups.nth(i).getByRole('radio').first().click()
  await page.clock.fastForward('29:50')
  await expect(page.getByRole('timer')).toContainText(/০০:[০-৯]{2}/)
  await page.clock.fastForward('00:15')
  // MCQ handed in by itself: now choosing creative questions.
  await expect(page.getByRole('checkbox').first()).toBeVisible()

  const boxes = page.getByRole('checkbox')
  for (const i of [0, 1, 4, 5, 6, 8, 9]) await boxes.nth(i).click()
  await page.clock.fastForward('02:30:00')
  await expect(page.getByRole('heading', { name: 'নিজের উত্তরে নম্বর দাও' })).toBeVisible()

  const first = page.locator('article').first().getByRole('checkbox')
  for (let i = 0; i < await first.count(); i++) await first.nth(i).click()
  await page.getByRole('button', { name: 'নম্বর দেওয়া শেষ' }).click()
  await page.waitForURL(/exam\/result/)

  const t0 = Date.now()
  await page.getByRole('link', { name: 'প্রস্তুতি ও সম্ভাব্য জিপিএ দেখো' }).click()
  await expect(page.getByRole('heading', { name: 'সম্ভাব্য জিপিএ' })).toBeVisible()
  expect(Date.now() - t0).toBeLessThan(1000)
})
