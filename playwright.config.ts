import { defineConfig, devices } from '@playwright/test'

// Two builds of the app: a guest-only one (no server), and one wired to a fake Supabase
// at http://sb.test that the sync test answers itself with page.route().
const plain = 4300
const synced = 4301
const phone = { ...devices['Pixel 5'], viewport: { width: 360, height: 760 }, deviceScaleFactor: 1 }

export default defineConfig({
  testDir: 'e2e',
  timeout: 90_000,
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: { trace: 'off', locale: 'bn-BD', timezoneId: 'Asia/Dhaka' },
  projects: [
    { name: 'guest', testIgnore: /sync\.spec/, use: { ...phone, baseURL: `http://localhost:${plain}` } },
    { name: 'sync', testMatch: /sync\.spec/, use: { ...phone, baseURL: `http://localhost:${synced}` } },
  ],
  webServer: [
    {
      command: `npx vite build --outDir dist-e2e/plain && npx vite preview --outDir dist-e2e/plain --port ${plain} --strictPort`,
      port: plain, reuseExistingServer: !process.env.CI, timeout: 180_000,
      env: { VITE_SUPABASE_URL: '', VITE_SUPABASE_ANON_KEY: '' },
    },
    {
      command: `npx vite build --outDir dist-e2e/synced && npx vite preview --outDir dist-e2e/synced --port ${synced} --strictPort`,
      port: synced, reuseExistingServer: !process.env.CI, timeout: 180_000,
      env: { VITE_SUPABASE_URL: 'http://sb.test', VITE_SUPABASE_ANON_KEY: 'e2e-anon' },
    },
  ],
})
