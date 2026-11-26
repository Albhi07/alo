import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { OfflineBanner } from './OfflineBanner'
import { BottomNav } from './BottomNav'
import { useT } from '../i18n'
import { UpdatePrompt } from './UpdatePrompt'

export function PageFallback() {
  const { t } = useT()
  return <p className="p-6 text-muted" role="status">{t('common.loading')}</p>
}

/** Main app layout: header, offline banner, content, bottom tabs. */
export function AppShell() {
  const { t } = useT()
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-surface focus:p-2">
        {t('app.skip')}
      </a>
      <Header />
      <OfflineBanner />
      <main id="main" className="mx-auto max-w-xl px-4 pb-28 pt-4">
        <Suspense fallback={<PageFallback />}>
          <Outlet />
        </Suspense>
      </main>
      <BottomNav />
      <UpdatePrompt aboveTabs />
    </>
  )
}

/** Layout for welcome, sign-in and onboarding (no tabs). */
export function BareShell() {
  return (
    <>
      <Header showSettings={false} />
      <OfflineBanner />
      <main id="main" className="mx-auto max-w-xl px-4 pb-10 pt-6">
        <Suspense fallback={<PageFallback />}>
          <Outlet />
        </Suspense>
      </main>
      <UpdatePrompt />
    </>
  )
}
