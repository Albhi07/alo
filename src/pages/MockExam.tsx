import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import clsx from 'clsx'
import { useT } from '../i18n'
import { ensureMock, useMock } from '../content/repo'
import type { MockCq, MockRow } from '../data/content-types'
import {
  abandon, answerMcq, choiceProblem, cqScore, enforceDeadlines, finishMarking, secondsLeft, startMock, submitCq, submitMcq,
  toggleChosen, toggleRubric, useSession, type MockSession,
} from '../state/mock'
import { Rich } from '../components/content/Rich'
import { BackIcon } from '../components/icons'
import { useOnline } from '../hooks/useOnline'

const LABELS = { bn: ['ক', 'খ', 'গ', 'ঘ'], en: ['a', 'b', 'c', 'd'] }
const PART = { bn: { a: 'ক', b: 'খ', c: 'গ', d: 'ঘ' }, en: { a: 'a', b: 'b', c: 'c', d: 'd' } } as const

/** Ticks once a second; the time left is always worked out from stored start times. */
function useNow(active: boolean) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!active) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    const wake = () => setNow(Date.now())
    document.addEventListener('visibilitychange', wake)
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', wake) }
  }, [active])
  return now
}

export default function MockExam() {
  const { id } = useParams()
  const { t } = useT()
  const online = useOnline()
  const mock = useMock(id)
  const session = useSession()
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    if (!id) return
    ensureMock(id).catch(() => setLoadError(true))
  }, [id, online])

  const running = !!session && !!mock && session.mock_id === mock.id && (session.phase === 'mcq' || session.phase === 'cq')
  const now = useNow(running)

  // Auto-submit when a part's time is up (also right after reopening the app).
  useEffect(() => {
    if (mock && session && session.mock_id === mock.id) void enforceDeadlines(mock, now)
  }, [mock, session, now])

  if (mock === undefined || session === undefined) return <p className="text-muted">{t('common.loading')}</p>
  if (!mock) return <div className="flex flex-col gap-4"><BackToExam /><p className="card">{loadError || !online ? t('mock.notDownloaded') : t('common.loading')}</p></div>

  if (!session || session.mock_id !== mock.id) return <StartScreen mock={mock} other={session} />
  if (session.phase === 'mcq') return <McqPart mock={mock} s={session} left={secondsLeft(session, now)} />
  if (session.phase === 'cq') return <CqPart mock={mock} s={session} left={secondsLeft(session, now)} />
  return <MarkPart mock={mock} s={session} />
}

function BackToExam() {
  const { t } = useT()
  return <Link to="/exam" className="btn-link -ml-2 self-start"><BackIcon />{t('exam.title')}</Link>
}

function StartScreen({ mock, other }: { mock: MockRow; other: MockSession | null }) {
  const { t, n, clock } = useT()
  const p = mock.paper_json
  const cqCount = p.sections.reduce((a, s) => a + s.cqs.length, 0)
  return (
    <div className="flex flex-col gap-4">
      <BackToExam />
      <h1 className="text-2xl font-semibold leading-tight">{mock.title}</h1>
      <div className="card flex flex-col gap-2">
        <p>{t('mock.mcqInfo', { n: p.mcq.length, marks: p.marks.mcq, time: clock(mock.duration_mcq_min * 60) })}</p>
        <p>{t('mock.cqInfo', { n: cqCount, answer: p.cq_rules.answer, min: p.cq_rules.min_per_section, marks: p.marks.cq, time: clock(mock.duration_cq_min * 60) })}</p>
        <ul className="list-disc pl-5 text-sm text-muted">
          <li>{t('mock.rule1')}</li>
          <li>{t('mock.rule2')}</li>
          <li>{t('mock.rule3')}</li>
        </ul>
        <p className="text-sm text-muted">{t('mock.total', { marks: n(p.marks.mcq + p.marks.cq + (p.marks.practical ?? 0)) })}</p>
      </div>
      {other
        ? <p className="card border-accent" role="status">{t('mock.otherRunning')} <Link className="underline" to={`/exam/mock/${other.mock_id}`}>{t('mock.continue')}</Link></p>
        : <button className="btn-primary" onClick={() => void startMock(mock)}>{t('mock.start')}</button>}
    </div>
  )
}

function Timer({ left, label }: { left: number; label: string }) {
  const { t, clock } = useT()
  const low = left <= 300
  return (
    <div className={clsx('sticky top-14 z-10 -mx-4 flex items-center justify-between px-4 py-2 font-semibold shadow-sm', low ? 'bg-danger text-white' : 'bg-navy text-white')}>
      <span>{label}</span>
      <span role="timer" aria-label={t('mock.timeLeft')} className="tabular-nums text-lg">{clock(left)}</span>
    </div>
  )
}

/** Two taps to submit early, so a stray tap doesn't end the paper. */
function SubmitButton({ label, confirm, onSubmit }: { label: string; confirm: string; onSubmit: () => void }) {
  const [armed, setArmed] = useState(false)
  useEffect(() => { if (!armed) return; const id = setTimeout(() => setArmed(false), 5000); return () => clearTimeout(id) }, [armed])
  return (
    <button className={clsx('btn w-full', armed ? 'bg-danger text-white' : 'btn-primary')} onClick={() => (armed ? onSubmit() : setArmed(true))}>
      {armed ? confirm : label}
    </button>
  )
}

function McqPart({ mock, s, left }: { mock: MockRow; s: MockSession; left: number }) {
  const { t, lang, n } = useT()
  const qs = mock.paper_json.mcq
  const answered = Object.keys(s.mcq_answers).length
  let lastContext: string | undefined
  return (
    <div className="flex flex-col gap-3">
      <Timer left={left} label={t('mock.mcqPart')} />
      <p className="text-sm text-muted" aria-live="polite">{t('mock.answered', { n: answered, total: qs.length })}</p>
      {qs.map((q, i) => {
        const showContext = q.context && q.context !== lastContext
        lastContext = q.context
        return (
          <article key={q.id} className="card flex flex-col gap-2" aria-label={t('mock.questionN', { n: i + 1 })}>
            {showContext && <Rich text={q.context!} mode="blocks" as="div" className="rounded-xl bg-bg p-3 font-read" />}
            <div className="flex gap-2 font-read font-semibold">
              <span className="shrink-0">{n(i + 1)}.</span>
              <Rich text={q.stem} mode="blocks" as="div" />
            </div>
            <div role="radiogroup" aria-label={t('mock.questionN', { n: i + 1 })} className="grid grid-cols-1 gap-1">
              {q.options.map((o, k) => {
                const on = s.mcq_answers[q.id] === k
                return (
                  <button key={k} type="button" role="radio" aria-checked={on} onClick={() => void answerMcq(q.id, k)}
                    className={clsx('flex min-h-tap items-center gap-3 rounded-xl border-2 px-3 py-1 text-left', on ? 'border-accent bg-accent/15' : 'border-line')}>
                    <span className={clsx('flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold', on ? 'border-accent bg-accent text-accent-ink' : 'border-muted')}>{LABELS[lang][k]}</span>
                    <Rich text={o} className="flex-1" />
                  </button>
                )
              })}
            </div>
          </article>
        )
      })}
      <SubmitButton label={t('mock.submitMcq')} confirm={t('mock.confirmSubmit')} onSubmit={() => void submitMcq(mock)} />
    </div>
  )
}

function CqCardExam({ c, chosen, onToggle }: { c: MockCq; chosen: boolean; onToggle: () => void }) {
  const { t, lang, n } = useT()
  return (
    <article className={clsx('card flex flex-col gap-2', chosen && 'border-2 border-accent')}>
      <Rich text={c.stem} mode="blocks" as="div" className="font-read" />
      <ol className="flex flex-col gap-1">
        {c.parts.map((p) => (
          <li key={p.part} className="flex gap-2 font-read">
            <span className="shrink-0 font-semibold">{PART[lang][p.part]}.</span>
            <Rich text={p.prompt} mode="blocks" as="div" className="flex-1" />
            <span className="shrink-0 text-sm text-muted">{n(p.marks)}</span>
          </li>
        ))}
      </ol>
      <label className="flex min-h-tap cursor-pointer items-center gap-3 font-semibold">
        <input type="checkbox" className="h-5 w-5 accent-[rgb(var(--accent))]" checked={chosen} onChange={onToggle} />
        {t('mock.iAnswered')}
      </label>
    </article>
  )
}

function CqPart({ mock, s, left }: { mock: MockRow; s: MockSession; left: number }) {
  const { t, n } = useT()
  const rules = mock.paper_json.cq_rules
  const problem = choiceProblem(s, mock)
  return (
    <div className="flex flex-col gap-3">
      <Timer left={left} label={t('mock.cqPart')} />
      <p className="card text-sm">{t('mock.cqHow', { answer: n(rules.answer), min: n(rules.min_per_section) })}</p>
      <p className="text-sm text-muted" aria-live="polite">{t('mock.chosen', { n: s.cq_chosen.length, total: rules.answer })}</p>
      {problem && <p className="text-sm font-semibold text-danger" role="alert">{t(`mock.problem.${problem}`, { answer: rules.answer, min: rules.min_per_section })}</p>}
      {mock.paper_json.sections.map((sec) => (
        <section key={sec.key} className="flex flex-col gap-3" aria-labelledby={`sec-${sec.key}`}>
          <h2 id={`sec-${sec.key}`} className="text-lg font-semibold">{sec.title}</h2>
          {sec.cqs.map((c) => <CqCardExam key={c.id} c={c} chosen={s.cq_chosen.includes(c.id)} onToggle={() => void toggleChosen(c.id)} />)}
        </section>
      ))}
      <SubmitButton label={t('mock.submitCq')} confirm={t('mock.confirmSubmit')} onSubmit={() => void submitCq(mock)} />
    </div>
  )
}

function MarkPart({ mock, s }: { mock: MockRow; s: MockSession }) {
  const { t, lang, n } = useT()
  const nav = useNavigate()
  const cqs = mock.paper_json.sections.flatMap((x) => x.cqs)
  const chosen = cqs.filter((c) => s.cq_chosen.includes(c.id))
  const score = cqScore(s, mock)
  const problem = choiceProblem(s, mock)
  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-2xl font-semibold">{t('mock.markTitle')}</h1>
      <div className="card flex flex-col gap-1">
        <p className="text-lg font-semibold">{t('mock.mcqScore', { score: n(s.mcq_score ?? 0), max: n(mock.paper_json.marks.mcq) })}</p>
        <p>{t('mock.cqSoFar', { score: n(score), max: n(mock.paper_json.marks.cq) })}</p>
        <p className="text-sm text-muted">{t('mock.markHow')}</p>
      </div>
      {chosen.length === 0 && (
        <div className="card flex flex-col gap-2">
          <p>{t('mock.pickAnswered')}</p>
          {cqs.map((c, i) => (
            <label key={c.id} className="flex min-h-tap items-center gap-3">
              <input type="checkbox" className="h-5 w-5" checked={s.cq_chosen.includes(c.id)} onChange={() => void toggleChosen(c.id)} />
              <span>{t('mock.cqN', { n: i + 1 })}: <Rich text={c.stem} className="text-sm" /></span>
            </label>
          ))}
        </div>
      )}
      {problem && <p className="text-sm font-semibold text-danger" role="alert">{t(`mock.problem.${problem}`, { answer: mock.paper_json.cq_rules.answer, min: mock.paper_json.cq_rules.min_per_section })}</p>}
      {chosen.map((c) => (
        <article key={c.id} className="card flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <Rich text={c.stem} mode="blocks" as="div" className="font-read font-semibold" />
            <button className="btn-link shrink-0 text-sm" onClick={() => void toggleChosen(c.id)}>{t('mock.remove')}</button>
          </div>
          {c.parts.map((p) => {
            const got = (s.cq_marks[c.id]?.[p.part] ?? []).reduce((a, i) => a + (p.rubric[i]?.points ?? 0), 0)
            return (
              <div key={p.part} className="flex flex-col gap-1 border-t border-line pt-2">
                <p className="font-semibold">{PART[lang][p.part]}. <Rich text={p.prompt} /> <span className="text-sm text-muted">({n(got)}/{n(p.marks)})</span></p>
                <details className="rounded-xl bg-bg p-2">
                  <summary className="cursor-pointer text-sm font-semibold">{t('cq.model')}</summary>
                  <Rich text={p.model} mode="blocks" as="div" className="mt-1 font-read" />
                </details>
                <fieldset className="flex flex-col gap-1">
                  <legend className="sr-only">{t('cq.rubric')}</legend>
                  {p.rubric.map((r, i) => (
                    <label key={i} className="flex min-h-tap cursor-pointer items-center gap-3">
                      <input type="checkbox" className="h-5 w-5 shrink-0" checked={(s.cq_marks[c.id]?.[p.part] ?? []).includes(i)} onChange={() => void toggleRubric(c.id, p.part, i)} />
                      <span className="flex-1"><Rich text={r.criterion} /></span>
                      <span className="shrink-0 text-sm text-muted">+{n(r.points)}</span>
                    </label>
                  ))}
                </fieldset>
              </div>
            )
          })}
        </article>
      ))}
      <button className="btn-primary" disabled={problem === 'tooMany'} onClick={async () => { const rid = await finishMarking(mock); if (rid) nav(`/exam/result/${rid}`, { replace: true }) }}>
        {t('mock.finish')}
      </button>
      <button className="btn-link self-center text-sm" onClick={async () => { const rid = s.result_id; await abandon(); nav(`/exam/result/${rid}`, { replace: true }) }}>
        {t('mock.skipMarking')}
      </button>
    </div>
  )
}
