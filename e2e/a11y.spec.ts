import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { ALGEBRA, onboard } from './helpers'

const PAGES = ['/', '/subjects', '/subjects/109', `/chapters/${ALGEBRA}`, `/practice/${ALGEBRA}`, '/exam', '/focus', '/plan', '/notices', '/tutor', '/connect', '/settings']

for (const theme of ['light', 'dark'] as const) {
  test(`no WCAG A/AA violations on the main screens (${theme})`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' })
    await onboard(page)
    const found: string[] = []
    for (const path of PAGES) {
      await page.goto(path)
      await page.locator('main h1').first().waitFor({ timeout: 10_000 })
      await page.waitForTimeout(300)
      const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
      for (const v of r.violations) found.push(`${path} ${v.id} (${v.impact}): ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`)
    }
    expect(found).toEqual([])
  })
}

test('the welcome and lesson screens pass too, in English', async ({ page }) => {
  await page.goto('/welcome')
  let r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
  expect(r.violations.map((v) => v.id)).toEqual([])
  await onboard(page)
  await page.getByRole('button', { name: 'Switch to English' }).click()
  await page.goto(`/chapters/${ALGEBRA}`)
  await page.getByRole('link', { name: /Start|শুরু/ }).first().click()
  await page.locator('main h1').first().waitFor({ timeout: 10_000 })
  r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
  expect(r.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(' | ')}`)).toEqual([])
})
