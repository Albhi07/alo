import { Link } from 'react-router-dom'
import clsx from 'clsx'
import { useT } from '../i18n'
import { useProfile, subjectsFor } from '../state/profile'
import { useExamData } from '../state/exam'
import { useMockList } from '../content/repo'
import { useReadiness, type SubjectReadiness } from '../state/readiness'
import { resultPct, useResults, useSession } from '../state/mock'
import { gradeFor } from '../lib/grading'
import { subjectByCode } from '../data/catalog'
import { Ring } from '../components/ui/Ring'

export default function Exam() {
  const { t, lang, n, date, clock } = useT()
  const profile = useProfile()
  const { routine: allRoutine, config } = useExamData()
  const mocks = useMockList()
  const readiness = useReadiness(profile)
  const results = useResults()
  const session = useSession()
  if (!profile) return null

  const codes = subjectsFor(profile).map((s) => s.code)
  const name = (code: string) => { const s = subjectByCode(code); return s ? (lang === 'bn' ? s.name_bn : s.name_en) : code }
  const myMocks = mocks.filter((m) => codes.includes(m.subject_code) && m.medium === profile.medium && m.exam_year === config.exam_year)
  const routine = allRoutine.filter((r) => r.exam_year === config.exam_year && codes.includes(r.subject_code)).sort((a, b) => a.date.localeCompare(b.date))
  const gpa = readiness?.gpa
  const fmt = (x: number) => n(x.toFixed(2))

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between gap-2">
        <h1 className="text-2xl font-semibold">{t('exam.title')}</h1>
        <Link to="/notices" className="text-sm underline underline-offset-4">{t('notices.title')}</Link>
      </div>

      {session && (
        <Link to={`/exam/mock/${session.mock_id}`} className="card flex items-center justify-between gap-3 border-2 border-accent">
          <span className="font-semibold">{session.phase === 'mark' ? t('exam.markPending') : t('exam.inProgress')}</span>
          <span className="btn-primary">{t('mock.continue')}</span>
        </Link>
      )}

      <section className="card flex flex-col gap-3" aria-labelledby="gpa-h">
        <h2 id="gpa-h" className="text-lg font-semibold">{t('exam.predicted')}</h2>
        {!gpa ? (
          <p className="text-muted">{t('exam.noData')}</p>
        ) : (
          <>
            <p className={gpa.fail ? "text-xl font-semibold text-danger" : "text-3xl font-semibold"} aria-live="polite">
              {gpa.fail ? t('exam.atRisk') : gpa.low === gpa.high ? fmt(gpa.mid) : t('exam.range', { low: fmt(gpa.low), high: fmt(gpa.high) })}
            </p>
            <p className="text-sm text-muted">{t('exam.basedOn', { counted: gpa.counted, total: gpa.total })} {t('exam.notPromise')}</p>
          </>
        )}
        {readiness && <Tips subjects={readiness.subjects} name={name} />}
      </section>

      {readiness && (
        <section aria-labelledby="ready-h" className="flex flex-col gap-2">
          <h2 id="ready-h" className="text-lg font-semibold">{t('exam.readiness')}</h2>
          <ul className="grid grid-cols-2 gap-2">
            {readiness.subjects.map((s) => (
              <li key={s.code} className="card flex items-center gap-3 p-3">
                <Ring value={s.score ?? 0} size={44} stroke={5} label={t('exam.readinessOf', { n: s.score ?? 0 })} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{name(s.code)}{s.fourth ? ` (${t('exam.fourth')})` : ''}</p>
                  <p className="text-sm text-muted">{s.score === null ? t('exam.notStarted') : `${n(s.score)} · ${gradeFor(s.score).grade}`}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="mocks-h" className="flex flex-col gap-2">
        <h2 id="mocks-h" className="text-lg font-semibold">{t('exam.mocks')}</h2>
        {myMocks.length === 0 && <p className="card text-muted">{t('exam.noMocks')}</p>}
        {myMocks.map((m) => (
          <div key={m.id} className="card flex flex-col gap-2">
            <p className="font-semibold">{m.title}</p>
            <p className="text-sm text-muted">{name(m.subject_code)} · {t('exam.mockTimes', { mcq: clock(m.duration_mcq_min * 60), cq: clock(m.duration_cq_min * 60) })}</p>
            <Link to={`/exam/mock/${m.id}`} className="btn-primary">{t('exam.openMock')}</Link>
          </div>
        ))}
      </section>

      <section aria-labelledby="hist-h" className="flex flex-col gap-2">
        <h2 id="hist-h" className="text-lg font-semibold">{t('exam.history')}</h2>
        {!results?.length && <p className="card text-muted">{t('exam.noResults')}</p>}
        {!!results?.length && (
          <ul className="card flex flex-col divide-y divide-line p-0">
            {results.map((r) => {
              const pct = resultPct(r)
              return (
                <li key={r.id}>
                  <Link to={`/exam/result/${r.id}`} className="flex min-h-tap items-center justify-between gap-3 px-4 py-2">
                    <span>
                      <span className="block font-semibold">{name(r.subject_code)}</span>
                      <span className="text-sm text-muted">{r.submitted_at ? date(r.submitted_at.slice(0, 10)) : t('exam.inProgress')}</span>
                    </span>
                    <span className="text-right">
                      <span className="block font-semibold">{r.total !== null ? n(Number(r.total)) : t('mock.unmarked')}</span>
                      {pct !== null && <span className="text-sm text-muted">{gradeFor(pct).grade}</span>}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section aria-labelledby="routine-h" className="flex flex-col gap-2">
        <h2 id="routine-h" className="text-lg font-semibold">{t('exam.routine')}</h2>
        <ul className="card flex flex-col divide-y divide-line p-0">
          {routine.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-3 px-4 py-2">
              <span>
                <span className="block font-semibold">{name(r.subject_code)}</span>
                <span className="text-sm text-muted">{date(r.date)} · {n(r.start_time)}</span>
              </span>
              {!r.verified && <span className="rounded-lg bg-accent/20 px-2 py-0.5 text-xs font-semibold">{t('exam.unverified')}</span>}
            </li>
          ))}
          {routine.length === 0 && <li className="px-4 py-3 text-muted">{t('exam.routineSoon')}</li>}
        </ul>
      </section>
    </div>
  )
}

/** A short "what will raise this" list from the weakest subjects. */
function Tips({ subjects, name }: { subjects: SubjectReadiness[]; name: (c: string) => string }) {
  const { t, lang } = useT()
  // Weakest measured subjects first, then ones not started yet.
  const main = subjects.filter((s) => !s.fourth)
  const weakest = [...main.filter((s) => s.score !== null).sort((a, b) => a.score! - b.score!), ...main.filter((s) => s.score === null)].slice(0, 3)
  const tips: { key: string; text: string; to: string }[] = []
  for (const s of weakest) {
    if (s.mockAvailable && s.mocksTaken < 2) tips.push({ key: `m${s.code}`, text: t('exam.tipMock', { subject: name(s.code) }), to: '#mocks-h' })
    const ch = s.focus[0]
    if (ch) tips.push({ key: `c${ch.id}`, text: t('exam.tipChapter', { chapter: lang === 'bn' ? ch.title_bn : ch.title_en, subject: name(s.code) }), to: `/chapters/${ch.id}?tab=mcq` })
  }
  if (!tips.length) return null
  return (
    <div>
      <h3 className="text-sm font-semibold text-muted">{t('exam.raise')}</h3>
      <ul className="mt-1 flex flex-col gap-1">
        {tips.slice(0, 3).map((tip) => (
          <li key={tip.key}>
            {tip.to.startsWith('#')
              ? <a href={tip.to} className={clsx('underline underline-offset-4')}>{tip.text}</a>
              : <Link to={tip.to} className="underline underline-offset-4">{tip.text}</Link>}
          </li>
        ))}
      </ul>
    </div>
  )
}
