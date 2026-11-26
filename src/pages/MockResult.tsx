import { Link, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import clsx from 'clsx'
import { useT } from '../i18n'
import { db, kvGet } from '../db'
import { useMock } from '../content/repo'
import { gradeFor } from '../lib/grading'
import { resultPct, type MockResultRow } from '../state/mock'
import { Rich } from '../components/content/Rich'
import { BackIcon } from '../components/icons'

type Row = MockResultRow & { max_total?: number; mcq_max?: number }
interface Review { mcq_answers: Record<string, number> }
const LABELS = { bn: ['ক', 'খ', 'গ', 'ঘ'], en: ['a', 'b', 'c', 'd'] }

export default function MockResult() {
  const { id } = useParams()
  const { t, lang, n, date } = useT()
  const row = useLiveQuery(async () => (id ? ((await db.mock_results.get(id)) as unknown as Row | undefined) ?? null : null), [id])
  const review = useLiveQuery(async () => (id ? kvGet<Review | null>(`mock.review.${id}`, null) : null), [id])
  const mock = useMock(row?.mock_id)

  if (row === undefined) return <p className="text-muted">{t('common.loading')}</p>
  if (!row) return <p>{t('notFound.title')}</p>
  const pct = resultPct(row)
  const g = pct === null ? null : gradeFor(pct)
  const marked = row.total !== null

  return (
    <div className="flex flex-col gap-4">
      <Link to="/exam" className="btn-link -ml-2 self-start"><BackIcon />{t('exam.title')}</Link>
      <h1 className="text-2xl font-semibold leading-tight">{mock?.title ?? t('exam.result')}</h1>
      <section className="card flex flex-col items-center gap-1 text-center" aria-live="polite">
        {marked
          ? <p className="text-4xl font-semibold">{n(Number(row.total))}<span className="text-lg text-muted">/{n(row.max_total ?? 100)}</span></p>
          : <p className="text-lg font-semibold">{t('mock.unmarked')}</p>}
        {g && <p className="text-lg">{t('exam.grade', { grade: g.grade, point: n(g.point.toFixed(2)) })}{!marked && ` (${t('mock.mcqOnly')})`}</p>}
        <p className="text-sm text-muted">
          {t('mock.parts', { mcq: n(Number(row.mcq_score ?? 0)), mcqMax: n(row.mcq_max ?? 30), cq: row.cq_score === null ? '—' : n(Number(row.cq_score)) })}
        </p>
        {row.submitted_at && <p className="text-sm text-muted">{date(row.submitted_at.slice(0, 10))}</p>}
        <Link to="/exam" className="btn-primary mt-2 w-full">{t('exam.seeReadiness')}</Link>
      </section>

      {mock && review && (
        <section className="flex flex-col gap-2" aria-labelledby="mcq-review">
          <h2 id="mcq-review" className="text-lg font-semibold">{t('mock.mcqReview')}</h2>
          {mock.paper_json.mcq.map((q, i) => {
            const given = review.mcq_answers[q.id]
            const right = given === q.answer
            return (
              <details key={q.id} className={clsx('card', right ? 'border-ok/50' : 'border-danger/50')}>
                <summary className="flex cursor-pointer items-start gap-2">
                  <span className={clsx('shrink-0 font-semibold', right ? 'text-ok' : 'text-danger')}>{right ? '✓' : '✗'} {n(i + 1)}.</span>
                  <Rich text={q.stem} className="flex-1 font-read" />
                </summary>
                <div className="mt-2 flex flex-col gap-1 text-sm">
                  <p>{t('mock.yourAnswer')}: {given === undefined ? t('mock.blank') : <><b>{LABELS[lang][given]}</b> <Rich text={q.options[given]} /></>}</p>
                  <p>{t('mock.rightAnswer')}: <b>{LABELS[lang][q.answer]}</b> <Rich text={q.options[q.answer]} /></p>
                  <Rich text={q.explanation} as="div" className="text-muted" />
                </div>
              </details>
            )
          })}
        </section>
      )}
    </div>
  )
}
