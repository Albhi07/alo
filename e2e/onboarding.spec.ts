import { expect, test } from '@playwright/test'
import { onboard } from './helpers'

test('onboarding as a guest takes a few taps and lands on Home', async ({ page }) => {
  const start = Date.now()
  await onboard(page)
  expect(Date.now() - start).toBeLessThan(60_000)
  await expect(page.getByRole('heading', { name: 'আজকের পরিকল্পনা' })).toBeVisible()
  // Countdown in Bangla digits.
  await expect(page.locator('#countdown')).toContainText(/[০-৯]/)
})

test('switching language changes text and digits without a reload', async ({ page }) => {
  await onboard(page)
  await page.evaluate(() => { (window as unknown as { marker: number }).marker = 42 })
  await page.getByRole('button', { name: 'Switch to English' }).click()
  await expect(page.getByRole('heading', { name: "Today's plan" })).toBeVisible()
  await expect(page.locator('#countdown')).toContainText(/[0-9]/)
  await expect(page.locator('#countdown')).not.toContainText(/[০-৯]/)
  expect(await page.evaluate(() => (window as unknown as { marker?: number }).marker)).toBe(42)
})
