import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useT } from '../i18n'
import { ENTITIES } from './entities'
import { adminStore, PK } from './store'

type Row = Record<string, unknown>

export default function EntityList() {
  const { entity = '' } = useParams()
  const { t, n } = useT()
  const def = ENTITIES[entity]
  const [rows, setRows] = useState<Row[] | null>(null)
  const [q, setQ] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!def) return
    setRows(null)
    adminStore().list(def.table).then(setRows).catch((e) => setError(String(e.message ?? e)))
  }, [def])

  const shown = useMemo(() => {
    if (!rows || !def) return []
    const needle = q.trim().toLowerCase()
    const filtered = needle ? rows.filter((r) => def.search.some((f) => String(r[f] ?? '').toLowerCase().includes(needle))) : rows
    return [...filtered].sort((a, b) => {
      for (const s of def.sort) {
        const x = a[s] as never, y = b[s] as never
        if (x < y) return -1
        if (x > y) return 1
      }
      return 0
    }).slice(0, 200)
  }, [rows, q, def])

  if (!def) return <p>{t('notFound.title')}</p>
  const pk = PK[def.table]
  const cols = def.fields.filter((f) => f.list).map((f) => f.name)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <h2 className="flex-1 text-xl font-semibold">{t(`admin.entity.${entity}`)}</h2>
        <Link to={`/admin/${entity}/new`} className="btn-primary">{t('admin.new')}</Link>
      </div>
      <label className="sr-only" htmlFor="admin-q">{t('admin.search')}</label>
      <input id="admin-q" className="field" placeholder={t('admin.search')} value={q} onChange={(e) => setQ(e.target.value)} />
      {error && <p role="alert" className="text-danger">{error}</p>}
      {rows === null && !error && <p className="text-muted">{t('common.loading')}</p>}
      {rows && <p className="text-sm text-muted">{t('admin.showing', { shown: shown.length, total: rows.length })}</p>}
      <ul className="flex flex-col gap-2">
        {shown.map((r) => (
          <li key={String(r[pk])}>
            <Link to={`/admin/${entity}/${encodeURIComponent(String(r[pk]))}`} className="card block hover:border-muted">
              {cols.map((c) => (
                <span key={c} className="mr-3 inline-block max-w-full truncate align-bottom text-sm">
                  <span className="text-muted">{t(`admin.field.${c}`, { defaultValue: c })}: </span>
                  {typeof r[c] === 'boolean' ? (r[c] ? '✓' : '✗') : typeof r[c] === 'number' ? n(r[c] as number) : String(r[c] ?? '').slice(0, 80)}
                </span>
              ))}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
