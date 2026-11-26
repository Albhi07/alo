import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useT } from '../i18n'
import { ENTITIES } from './entities'
import { adminStore, PK } from './store'
import { FieldInput, normalise } from './FieldInput'
import { SceneEditor } from './SceneEditor'

type Row = Record<string, unknown>

export default function EntityEdit() {
  const { entity = '', key = 'new' } = useParams()
  const { t } = useT()
  const nav = useNavigate()
  const def = ENTITIES[entity]
  const isNew = key === 'new'
  const [values, setValues] = useState<Row | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [msg, setMsg] = useState<string | null>(null)
  const store = adminStore()

  useEffect(() => {
    if (!def) return
    if (isNew) {
      setValues(Object.fromEntries(def.fields.map((f) => [f.name, f.type === 'bool' ? false : null])))
      return
    }
    store.list(def.table).then((rows) => {
      const pk = PK[def.table]
      setValues(rows.find((r) => String(r[pk]) === key) ?? null)
    })
  }, [def, key, isNew, store])

  if (!def) return <p>{t('notFound.title')}</p>
  if (values === null) return <p className="text-muted">{isNew ? '' : t('common.loading')}</p>

  async function save() {
    const { row, errors } = normalise(def.fields, values!)
    setErrors(errors)
    if (Object.keys(errors).length) { setMsg(t('admin.fixErrors')); return }
    try {
      const saved = await store.save(def.table, row)
      setMsg(t('admin.saved'))
      if (isNew) nav(`/admin/${entity}/${encodeURIComponent(String(saved[PK[def.table]]))}`, { replace: true })
    } catch (e) {
      setMsg(String((e as Error).message ?? e))
    }
  }

  async function remove() {
    if (!confirm(t('admin.deleteConfirm'))) return
    await store.remove(def.table, values![PK[def.table]] as string)
    nav(`/admin/${entity}`, { replace: true })
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold">{t(`admin.entity.${entity}`)} · {isNew ? t('admin.new') : key}</h2>
      <form className="flex flex-col gap-3" onSubmit={(e) => { e.preventDefault(); void save() }}>
        {def.fields.map((f) => (
          <div key={f.name}>
            <FieldInput field={f} value={values[f.name]} disabled={!isNew && f.readOnlyOnEdit} onChange={(v) => setValues({ ...values, [f.name]: v })} />
            {errors[f.name] && <p role="alert" className="text-sm text-danger">{t(`admin.err.${errors[f.name]}`)}</p>}
          </div>
        ))}
        <div className="sticky bottom-[64px] flex gap-2 bg-bg py-2">
          <button className="btn-primary flex-1">{t('admin.save')}</button>
          {!isNew && <button type="button" className="btn-ghost text-danger" onClick={remove}>{t('admin.delete')}</button>}
        </div>
        {msg && <p role="status" className="font-semibold">{msg}</p>}
      </form>
      {def.table === 'lessons' && !isNew && <SceneEditor lessonId={String(values.id)} />}
    </div>
  )
}
