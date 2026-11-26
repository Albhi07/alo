import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { useT } from '../../i18n'
import { OnlineGate } from '../../components/OnlineGate'
import { WeekChart } from '../../components/WeekChart'
import { useExamData } from '../../state/exam'
import { subjectByCode } from '../../data/catalog'
import { addDays, dayDiff } from '../../lib/days'
import { todayIso } from '../../lib/format'
import { upcomingPapers, type StudentSummary } from '../../lib/summary'
import { linkParent, myChildren, unlinkChild, type Child, type ConnectError } from '../../state/connect'

/** Parent: read-only view of linked children. No chat, no raw answers. */
export default function ParentView() {
  const { t } = useT()
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">{t('people.parentViewTitle')}</h1>
      <p className="text-sm text-muted">{t('people.parentViewIntro')}</p>
      <OnlineGate><Children /></OnlineGate>
    </div>
  )
}

function Children() {
  const { t } = useT()
  const [kids, setKids] = useState<Child[] | null>(null)
  const [code, setCode] = useState('')
  const [err, setErr] = useState<ConnectError | null>(null)
  const [busy, setBusy] = useState(false)
  const load = useCallback(async () => { const r = await myChildren(); if ('data' in r) setKids(r.data); else setErr(r.error) }, [])
  useEffect(() => { void load() }, [load])

  const link = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true); setErr(null)
    const r = await linkParent(code)
    setBusy(false)
    if ('error' in r) return setErr(r.error)
    setCode(''); void load()
  }
  return (
    <>
      {kids?.map((k) => <ChildCard key={k.student_id} child={k} onUnlink={async () => { const e = await unlinkChild(k.student_id); if (e) setErr(e); else void load() }} />)}
      <form className="card flex flex-col gap-2" onSubmit={(e) => void link(e)}>
        <label>
          <span className="label">{kids?.length ? t('people.addChild') : t('people.enterCode')}</span>
          <input className="field font-mono uppercase tracking-widest" value={code} maxLength={12} autoCapitalize="characters" autoComplete="off" onChange={(e) => setCode(e.target.value)} required />
        </label>
        <p className="text-xs text-muted">{t('people.codeFromChild')}</p>
        <button className="btn-primary" disabled={busy || code.replace(/\W/g, '').length < 8}>{t('people.link')}</button>
        {err && <p className="text-sm font-semibold text-danger" role="alert">{t(`people.err.${err}`)}</p>}
      </form>
    </>
  )
}

function ChildCard({ child, onUnlink }: { child: Child; onUnlink: () => void }) {
  const { t, n, date, lang } = useT()
  const { routine } = useExamData()
  const s = child.summary
  const name = (code: string) => { const x = subjectByCode(code); return x ? (lang === 'bn' ? x.name_bn : x.name_en) : code }
  const title = s?.name || t('people.yourChild')
  if (!s) {
    return (
      <section className="card flex flex-col gap-2">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-muted">{t('people.noSummaryYet')}</p>
        <button className="btn-link self-start text-sm" onClick={onUnlink}>{t('people.unlink')}</button>
      </section>
    )
  }
  const today = todayIso()
  const weekHours = s.week.reduce((a, b) => a + b, 0) / 60
  const papers = upcomingPapers(routine, s, today)
  return (
    <section className="card flex flex-col gap-3" aria-label={title}>
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold">{title}</h2>
        <span className="text-xs text-muted">{t('people.updated', { date: date(s.updated.slice(0, 10)) })}</span>
      </div>
      <dl className="grid grid-cols-2 gap-3">
        <div><dt className="text-sm text-muted">{t('home.streak')}</dt><dd className="text-xl font-semibold">{t('home.streakDays', { count: s.streak })}</dd></div>
        <div><dt className="text-sm text-muted">{t('people.weekHours')}</dt><dd className="text-xl font-semibold">{t('focus.hoursShort', { h: n(weekHours.toFixed(1)) })}</dd></div>
        {s.gpa && (
          <div className="col-span-2">
            <dt className="text-sm text-muted">{t('people.predicted')}</dt>
            <dd className="text-xl font-semibold">{s.gpa.fail ? t('people.atRisk') : t('people.gpaRange', { low: n(s.gpa.low.toFixed(2)), high: n(s.gpa.high.toFixed(2)) })}</dd>
            <dd className="text-xs text-muted">{t('people.notPromise')}</dd>
          </div>
        )}
      </dl>
      <div>
        <h3 className="mb-1 text-sm font-semibold text-muted">{t('focus.week')}</h3>
        <WeekChart week={s.week.map((m, i) => ({ date: addDays(s.as_of, i - 6), minutes: m }))} target={s.target_min} />
      </div>
      <Readiness s={s} name={name} />
      <div>
        <h3 className="mb-1 text-sm font-semibold text-muted">{t('people.nextPapers')}</h3>
        {papers.length ? (
          <ul className="flex flex-col gap-1">
            {papers.map((p) => <li key={`${p.date}-${p.subject_code}`} className="flex justify-between gap-2"><span>{name(p.subject_code)}</span><span className="text-muted">{date(p.date)} · {t('people.inDays', { count: dayDiff(today, p.date) })}</span></li>)}
          </ul>
        ) : <p className="text-sm text-muted">{t('people.noPapers')}</p>}
      </div>
      <button className="btn-link self-start text-sm" onClick={onUnlink}>{t('people.unlink')}</button>
    </section>
  )
}

function Readiness({ s, name }: { s: StudentSummary; name: (c: string) => string }) {
  const { t, n } = useT()
  return (
    <div>
      <h3 className="mb-1 text-sm font-semibold text-muted">{t('people.readiness')}</h3>
      <ul className="flex flex-col gap-1">
        {s.readiness.map((r) => (
          <li key={r.code} className="flex items-center gap-2 text-sm">
            <span className="w-32 shrink-0 truncate">{name(r.code)}</span>
            <span className="h-2 flex-1 rounded-full bg-line" aria-hidden><span className="block h-2 rounded-full bg-accent" style={{ width: `${r.score ?? 0}%` }} /></span>
            <span className="w-10 text-right tabular-nums">{r.score === null ? '–' : n(r.score)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
