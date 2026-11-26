import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useOnline } from '../hooks/useOnline'
import { useT } from '../i18n'
import { db } from '../db'
import { OfflineIcon } from './icons'
import { useUserId } from '../state/auth'

/** Clear offline notice plus a count of changes waiting to sync. */
export function OfflineBanner() {
  const online = useOnline()
  const { t } = useT()
  // Guest changes stay on the phone until sign-in, so only count them for signed-in students.
  const userId = useUserId()
  const pending = useLiveQuery(() => (userId ? db.outbox.count() : 0), [userId], 0)
  const [justBack, setJustBack] = useState(false)
  const [wasOffline, setWasOffline] = useState(!online)

  useEffect(() => {
    if (!online) { setWasOffline(true); return }
    if (wasOffline) {
      setJustBack(true)
      setWasOffline(false)
      const id = setTimeout(() => setJustBack(false), 4000)
      return () => clearTimeout(id)
    }
  }, [online, wasOffline])

  if (online && !justBack) return <div role="status" aria-live="polite" className="sr-only" />
  return (
    <div role="status" aria-live="polite" className={online ? 'bg-ok/15 text-ink' : 'bg-accent text-accent-ink'}>
      <div className="mx-auto flex max-w-xl items-start gap-2 px-4 py-2 text-[15px] leading-snug">
        {!online && <OfflineIcon className="mt-0.5 shrink-0" />}
        <p>
          {online ? t('net.back') : t('net.offline')}
          {!online && pending > 0 && <span className="block font-semibold">{t('net.pending', { count: pending })}</span>}
        </p>
      </div>
    </div>
  )
}
