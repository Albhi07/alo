import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useT } from '../i18n'
import { useOnline } from '../hooks/useOnline'
import { useUserId } from '../state/auth'
import { supabaseConfigured } from '../lib/supabase'

/** Parent, teacher and class screens need the server: say clearly what's missing, else show the screen. */
export function OnlineGate({ children }: { children: ReactNode }) {
  const { t } = useT()
  const online = useOnline()
  const userId = useUserId()
  const loc = useLocation()
  if (!supabaseConfigured) return <p className="card" role="status">{t('people.notConfigured')}</p>
  if (userId === undefined) return null
  if (!userId) {
    return (
      <div className="card flex flex-col gap-2" role="status">
        <p>{t('people.signIn')}</p>
        <Link to={`/signin?next=${encodeURIComponent(loc.pathname)}`} className="btn-primary self-start">{t('people.signInButton')}</Link>
      </div>
    )
  }
  if (!online) return <p className="card border-accent" role="status">{t('net.needsOnline')}</p>
  return <>{children}</>
}
