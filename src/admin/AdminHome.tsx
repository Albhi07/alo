import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useT } from '../i18n'
import { ENTITIES } from './entities'
import { adminStore, discardLocalEdits, exportContent } from './store'

export default function AdminHome() {
  const { t, n } = useT()
  const store = adminStore()
  const [counts, setCounts] = useState<Record<string, number>>({})
  useEffect(() => {
    Promise.all(Object.keys(ENTITIES).map(async (k) => [k, (await store.list(ENTITIES[k].table)).length] as const))
      .then((x) => setCounts(Object.fromEntries(x)))
      .catch(() => {})
  }, [store])

  async function download() {
    const data = await exportContent()
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `alo-content-${data.exported_at.slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col gap-3">
      <ul className="grid grid-cols-2 gap-2">
        {Object.keys(ENTITIES).map((k) => (
          <li key={k}>
            <Link to={`/admin/${k}`} className="card flex h-full flex-col hover:border-muted">
              <span className="font-semibold">{t(`admin.entity.${k}`)}</span>
              <span className="text-sm text-muted">{counts[k] === undefined ? '…' : n(counts[k])}</span>
            </Link>
          </li>
        ))}
      </ul>
      <Link to="/admin/import" className="btn-ghost">{t('admin.csvImport')}</Link>
      {store.mode === 'local' && (
        <>
          <button className="btn-ghost" onClick={download}>{t('admin.export')}</button>
          <button className="btn-link self-start text-danger" onClick={async () => { if (confirm(t('admin.discardConfirm'))) { await discardLocalEdits(); location.reload() } }}>
            {t('admin.discard')}
          </button>
        </>
      )}
    </div>
  )
}
