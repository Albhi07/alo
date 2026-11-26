import { useEffect, useState, useSyncExternalStore } from 'react'
import { useT } from '../i18n'

// Service worker registration happens once per page load (module scope), whichever shell mounts.
type SwState = 'none' | 'ready' | 'update'
let swState: SwState = 'none'
let applyUpdate: (() => void) | null = null
const subs = new Set<() => void>()
const set = (s: SwState) => { swState = s; subs.forEach((f) => f()) }

if (typeof window !== 'undefined' && 'serviceWorker' in navigator && !import.meta.env.DEV) {
  window.addEventListener('load', () => {
    import('virtual:pwa-register').then(({ registerSW }) => {
      const update = registerSW({ onNeedRefresh: () => set('update'), onOfflineReady: () => set('ready') })
      applyUpdate = () => void update(true)
    })
  })
}

/** Offers updates instead of forcing them, and says once when the app works offline. */
export function UpdatePrompt({ aboveTabs = false }: { aboveTabs?: boolean }) {
  const { t } = useT()
  const state = useSyncExternalStore((cb) => { subs.add(cb); return () => { subs.delete(cb) } }, () => swState)
  const [, rerender] = useState(0)

  useEffect(() => {
    if (state !== 'ready') return
    const id = setTimeout(() => set('none'), 5000)
    return () => clearTimeout(id)
  }, [state])

  if (state === 'none') return null
  return (
    <div role="status" className={`fixed inset-x-0 ${aboveTabs ? 'bottom-[76px]' : 'top-16'} z-30 mx-auto w-[calc(100%-32px)] max-w-md`}>
      <div className="card flex items-center gap-3 shadow-lg">
        <p className="flex-1 leading-snug">{state === 'update' ? t('settings.update') : t('settings.offlineReady')}</p>
        {state === 'update' && <button className="btn-primary" onClick={() => { applyUpdate?.(); rerender((x) => x + 1) }}>{t('settings.reload')}</button>}
        <button className="btn-link" onClick={() => set('none')}>{t('common.close')}</button>
      </div>
    </div>
  )
}
