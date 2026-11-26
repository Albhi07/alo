import { useEffect, useState } from 'react'
import { useT } from '../i18n'
import { currentSubscription, disablePush, enablePush, pushAvailable } from '../lib/push'

/** Exam reminders by web push. Hidden where push can't work (no server key, unsupported browser). */
export function PushToggle() {
  const { t, lang } = useT()
  const [on, setOn] = useState<boolean | null>(null)
  const [msg, setMsg] = useState<string | null>(null)
  useEffect(() => { void currentSubscription().then((s) => setOn(!!s)) }, [])
  if (!pushAvailable()) return <p className="text-sm text-muted">{t('notices.inAppOnly')}</p>
  return (
    <div className="card flex flex-col gap-2">
      <label className="flex min-h-tap items-center justify-between gap-3">
        <span className="font-semibold">{t('notices.push')}</span>
        <input type="checkbox" className="h-6 w-6" checked={!!on} disabled={on === null} onChange={async (e) => {
          setMsg(null)
          if (e.target.checked) {
            const r = await enablePush(lang)
            setOn(r === 'on')
            if (r !== 'on') setMsg(t(`notices.pushErr.${r}`))
          } else { await disablePush(); setOn(false) }
        }} />
      </label>
      <p className="text-sm text-muted">{msg ?? t('notices.pushHint')}</p>
    </div>
  )
}
