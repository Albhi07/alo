import { useEffect, useState } from 'react'
import { useT } from '../i18n'
import { OnlineGate } from '../components/OnlineGate'
import { Rich } from '../components/content/Rich'
import { adminAnalytics, type Analytics as Data, type ConnectError } from '../state/connect'

/** Admin: daily active students, lesson completion, hardest questions. Aggregates only. */
export default function Analytics() {
  const { t } = useT()
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-xl font-semibold">{t('analytics.title')}</h2>
      <OnlineGate><Body /></OnlineGate>
    </div>
  )
}

function Body() {
  const { t, n, date } = useT()
  const [days, setDays] = useState(14)
  const [data, setData] = useState<Data | null>(null)
  const [err, setErr] = useState<ConnectError | null>(null)
  useEffect(() => {
    setData(null)
    void adminAnalytics(days).then((r) => { if ('data' in r) setData(r.data); else setErr(r.error) })
  }, [days])
  if (err) return <p className="card" role="alert">{t(`people.err.${err}`)}</p>
  if (!data) return <p className="text-muted">{t('common.loading')}</p>
  const max = Math.max(1, ...data.daily_active.map((d) => d.students))
  const rate = data.lessons.started ? Math.round((100 * data.lessons.completed) / data.lessons.started) : null
  return (
    <>
      <label className="self-start">
        <span className="label">{t('analytics.period')}</span>
        <select className="field w-auto" value={days} onChange={(e) => setDays(Number(e.target.value))}>
          {[7, 14, 30, 90].map((d) => <option key={d} value={d}>{t('analytics.days', { n: n(d) })}</option>)}
        </select>
      </label>
      <dl className="grid grid-cols-2 gap-3">
        <div className="card"><dt className="text-sm text-muted">{t('analytics.students')}</dt><dd className="text-2xl font-semibold">{n(data.students)}</dd></div>
        <div className="card"><dt className="text-sm text-muted">{t('analytics.completion')}</dt><dd className="text-2xl font-semibold">{rate === null ? '–' : `${n(rate)}%`}</dd>
          <dd className="text-xs text-muted">{t('analytics.lessonCounts', { done: n(data.lessons.completed), started: n(data.lessons.started) })}</dd></div>
      </dl>
      <section className="card" aria-labelledby="dau-h">
        <h3 id="dau-h" className="mb-2 font-semibold">{t('analytics.dau')}</h3>
        {data.daily_active.length ? (
          <table className="w-full text-sm">
            <caption className="sr-only">{t('analytics.dau')}</caption>
            <tbody>
              {data.daily_active.map((d) => (
                <tr key={d.day}>
                  <th scope="row" className="w-24 py-0.5 pr-2 text-left font-normal text-muted">{date(d.day, { year: false })}</th>
                  <td className="py-0.5"><span className="block h-3 rounded-r bg-accent" style={{ width: `${(100 * d.students) / max}%`, minWidth: 2 }} aria-hidden /></td>
                  <td className="w-12 py-0.5 text-right tabular-nums">{n(d.students)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p className="text-sm text-muted">{t('analytics.none')}</p>}
      </section>
      <section className="card" aria-labelledby="hard-h">
        <h3 id="hard-h" className="mb-1 font-semibold">{t('analytics.hardest')}</h3>
        <p className="mb-2 text-xs text-muted">{t('analytics.hardestHint')}</p>
        {data.hardest.length ? (
          <ol className="flex list-decimal flex-col gap-2 pl-5 text-sm">
            {data.hardest.map((q) => (
              <li key={q.question_id}>
                <Rich text={q.stem} />
                <span className="block text-muted">{t('analytics.correctOf', { pct: n(q.correct_pct), n: n(q.attempts) })}</span>
              </li>
            ))}
          </ol>
        ) : <p className="text-sm text-muted">{t('analytics.none')}</p>}
      </section>
    </>
  )
}
