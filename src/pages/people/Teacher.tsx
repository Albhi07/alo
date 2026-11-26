import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useT } from '../../i18n'
import { OnlineGate } from '../../components/OnlineGate'
import { createClass, teacherClasses, type ConnectError, type TeacherClass } from '../../state/connect'

/** Teacher / coaching centre: their classes, and a form to make one. */
export default function Teacher() {
  const { t } = useT()
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">{t('people.teacherTitle')}</h1>
      <p className="text-sm text-muted">{t('people.teacherIntro')}</p>
      <OnlineGate><Classes /></OnlineGate>
    </div>
  )
}

function Classes() {
  const { t } = useT()
  const [list, setList] = useState<TeacherClass[] | null>(null)
  const [name, setName] = useState('')
  const [err, setErr] = useState<ConnectError | null>(null)
  const [busy, setBusy] = useState(false)
  const load = useCallback(async () => { const r = await teacherClasses(); if ('data' in r) setList(r.data); else setErr(r.error) }, [])
  useEffect(() => { void load() }, [load])

  const make = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true); setErr(null)
    const r = await createClass(name)
    setBusy(false)
    if ('error' in r) return setErr(r.error)
    setName(''); void load()
  }
  return (
    <>
      {list && (list.length ? (
        <ul className="flex flex-col gap-2">
          {list.map((c) => (
            <li key={c.id}>
              <Link to={`/teacher/${c.id}`} className="card flex items-center justify-between gap-2">
                <span className="font-semibold">{c.name}</span>
                <span className="font-mono text-sm text-muted">{c.join_code}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : <p className="card text-muted">{t('people.noClasses')}</p>)}
      <form className="card flex flex-col gap-2" onSubmit={(e) => void make(e)}>
        <label>
          <span className="label">{t('people.newClass')}</span>
          <input className="field" value={name} maxLength={60} placeholder={t('people.classNameHint')} onChange={(e) => setName(e.target.value)} required />
        </label>
        <button className="btn-primary" disabled={busy || !name.trim()}>{t('people.create')}</button>
        {err && <p className="text-sm font-semibold text-danger" role="alert">{t(`people.err.${err}`)}</p>}
      </form>
    </>
  )
}
