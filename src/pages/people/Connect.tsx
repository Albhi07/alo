import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useT } from '../../i18n'
import { OnlineGate } from '../../components/OnlineGate'
import { useAllChapters, useMockList } from '../../content/repo'
import { createParentCode, joinClass, leaveClass, myClasses, myParents, publishSummary, removeParent, type Assignment, type ConnectError, type MyClass } from '../../state/connect'

/** Student: let a parent follow along, and join a teacher's class. */
export default function Connect() {
  const { t } = useT()
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">{t('people.connectTitle')}</h1>
      <p className="text-sm text-muted">{t('people.connectIntro')}</p>
      <OnlineGate>
        <ParentSection />
        <ClassSection />
      </OnlineGate>
    </div>
  )
}

function ErrorNote({ err }: { err: ConnectError | null }) {
  const { t } = useT()
  return err ? <p className="text-sm font-semibold text-danger" role="alert">{t(`people.err.${err}`)}</p> : null
}

function ParentSection() {
  const { t, n, date } = useT()
  const [code, setCode] = useState<{ code: string; expires_at: string } | null>(null)
  const [parents, setParents] = useState<{ parent_id: string }[] | null>(null)
  const [err, setErr] = useState<ConnectError | null>(null)
  const load = useCallback(async () => { const r = await myParents(); if ('data' in r) setParents(r.data); else setErr(r.error) }, [])
  useEffect(() => { void load() }, [load])

  const make = async () => {
    setErr(null)
    void publishSummary() // so the parent sees numbers straight away
    const r = await createParentCode()
    if ('data' in r) setCode(r.data); else setErr(r.error)
  }
  return (
    <section className="card flex flex-col gap-3" aria-labelledby="parent-h">
      <h2 id="parent-h" className="text-lg font-semibold">{t('people.parentTitle')}</h2>
      <p className="text-sm text-muted">{t('people.parentHow')}</p>
      {code ? (
        <div className="flex flex-col gap-1">
          <p className="text-sm">{t('people.yourCode')}</p>
          <p className="select-all text-center font-mono text-3xl font-semibold tracking-[0.2em]" aria-label={code.code.split('').join(' ')}>{code.code}</p>
          <p className="text-sm text-muted">{t('people.codeExpires', { date: date(code.expires_at.slice(0, 10)) })}</p>
        </div>
      ) : (
        <button className="btn-primary" onClick={() => void make()}>{t('people.makeCode')}</button>
      )}
      {parents && (
        parents.length
          ? <ul className="flex flex-col gap-2">{parents.map((p, i) => (
              <li key={p.parent_id} className="flex items-center justify-between gap-2">
                <span>{t('people.parentN', { n: n(i + 1) })}</span>
                <button className="btn-ghost px-3" onClick={async () => { const e = await removeParent(p.parent_id); if (e) setErr(e); else void load() }}>{t('people.remove')}</button>
              </li>))}</ul>
          : <p className="text-sm text-muted">{t('people.noParents')}</p>
      )}
      <ErrorNote err={err} />
    </section>
  )
}

function ClassSection() {
  const { t } = useT()
  const [classes, setClasses] = useState<MyClass[] | null>(null)
  const [joinCode, setJoinCode] = useState('')
  const [nick, setNick] = useState('')
  const [err, setErr] = useState<ConnectError | null>(null)
  const [busy, setBusy] = useState(false)
  const load = useCallback(async () => { const r = await myClasses(); if ('data' in r) setClasses(r.data); else setErr(r.error) }, [])
  useEffect(() => { void load() }, [load])

  const join = async (e: FormEvent) => {
    e.preventDefault()
    setErr(null); setBusy(true)
    const r = await joinClass(joinCode, nick)
    setBusy(false)
    if ('error' in r) return setErr(r.error)
    setJoinCode(''); void publishSummary(); void load()
  }
  return (
    <section className="card flex flex-col gap-3" aria-labelledby="class-h">
      <h2 id="class-h" className="text-lg font-semibold">{t('people.classTitle')}</h2>
      {classes?.map((c) => (
        <div key={c.id} className="flex flex-col gap-2 rounded-xl border border-line p-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold">{c.name}</h3>
            <button className="btn-link text-sm" onClick={async () => { const e = await leaveClass(c.id); if (e) setErr(e); else void load() }}>{t('people.leave')}</button>
          </div>
          <p className="text-sm text-muted">{t('people.asNick', { nick: c.nickname ?? '' })}</p>
          <AssignmentList items={c.assignments} />
        </div>
      ))}
      <form className="flex flex-col gap-2" onSubmit={(e) => void join(e)}>
        <label>
          <span className="label">{t('people.joinCode')}</span>
          <input className="field font-mono uppercase" value={joinCode} maxLength={12} autoCapitalize="characters" autoComplete="off" onChange={(e) => setJoinCode(e.target.value)} required />
        </label>
        <label>
          <span className="label">{t('people.nickname')}</span>
          <input className="field" value={nick} maxLength={24} onChange={(e) => setNick(e.target.value)} required />
          <span className="text-xs text-muted">{t('people.nicknameHint')}</span>
        </label>
        <button className="btn-primary" disabled={busy || !joinCode.trim() || !nick.trim()}>{t('people.join')}</button>
      </form>
      <ErrorNote err={err} />
    </section>
  )
}

/** A class's chapters and mocks with due dates, linking to where to do them. */
export function AssignmentList({ items }: { items: Assignment[] }) {
  const { t, lang, date } = useT()
  const chapters = useAllChapters()
  const mocks = useMockList()
  if (!items.length) return <p className="text-sm text-muted">{t('people.noAssignments')}</p>
  return (
    <ul className="flex flex-col gap-1">
      {items.map((a) => {
        const ch = a.kind === 'chapter' ? chapters?.find((c) => c.id === a.ref_id) : undefined
        const mk = a.kind === 'mock' ? mocks?.find((m) => m.id === a.ref_id) : undefined
        const title = ch ? (lang === 'bn' ? ch.title_bn : ch.title_en) : mk ? mk.title : t('people.unknownItem')
        return (
          <li key={a.id} className="flex items-center justify-between gap-2 text-sm">
            <Link className="btn-link px-0 text-left" to={a.kind === 'chapter' ? `/chapters/${a.ref_id}` : `/exam/mock/${a.ref_id}`}>
              {t(`people.kind.${a.kind}`)}: {title}
            </Link>
            {a.due_on && <span className="shrink-0 text-muted">{t('people.due', { date: date(a.due_on) })}</span>}
          </li>
        )
      })}
    </ul>
  )
}
