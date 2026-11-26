import { useEffect, useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { useT } from '../i18n'
import { useProfile } from '../state/profile'
import { supabaseConfigured } from '../lib/supabase'
import { adminStore, loadAllForEditing } from './store'

/** Admin area. Remote mode needs an admin profile; local mode (no Supabase yet) is a sandbox in this browser. */
export default function AdminLayout() {
  const { t } = useT()
  const profile = useProfile()
  const [ready, setReady] = useState(false)
  const store = adminStore()
  const allowed = !supabaseConfigured || profile?.role === 'admin'

  useEffect(() => {
    if (!allowed) return
    ;(store.mode === 'local' ? loadAllForEditing() : Promise.resolve()).finally(() => setReady(true))
  }, [allowed, store.mode])

  if (profile === undefined) return null
  if (!allowed) return <p className="card">{t('admin.denied')}</p>
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Link to="/admin" className="text-2xl font-semibold">{t('admin.title')}</Link>
      </div>
      {store.mode === 'local' && <p className="card border-accent text-sm" role="note">{t('admin.localMode')}</p>}
      {ready ? <Outlet /> : <p className="text-muted">{t('common.loading')}</p>}
    </div>
  )
}
