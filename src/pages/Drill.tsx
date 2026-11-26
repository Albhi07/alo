import { useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useT } from '../i18n'
import { useDrill } from '../content/repo'
import { drillTitle, fmtNum, generate, isCorrect, parseAnswer, type DrillTemplate } from '../lib/drill'
import { recordDrillAnswer } from '../state/practice'
import { Rich } from '../components/content/Rich'
import { BackIcon } from '../components/icons'

/** Fresh numbers every time; the student types answers, then sees the worked solution with the same numbers. */
export default function Drill() {
  const { id } = useParams()
  const { t, lang } = useT()
  const row = useDrill(id)
  const [seed, setSeed] = useState(() => Date.now())
  const [inputs, setInputs] = useState<string[]>([])
  const [checked, setChecked] = useState<boolean[] | null>(null)
  const [tally, setTally] = useState({ right: 0, done: 0 })
  const started = useRef(performance.now())
  const firstInput = useRef<HTMLInputElement>(null)

  const inst = useMemo(() => {
    if (!row) return null
    try { return generate(row as unknown as DrillTemplate, lang, seed) } catch { return null }
  }, [row, lang, seed])

  if (row === undefined) return <p className="text-muted">{t('common.loading')}</p>
  const back = row && (
    <Link to={`/chapters/${row.chapter_id}?tab=mcq`} className="btn-link -ml-2 self-start"><BackIcon />{t('drill.back')}</Link>
  )
  if (!row || !inst) return <div className="flex flex-col gap-4">{back}<p className="card">{t('drill.broken')}</p></div>

  async function check() {
    if (!inst || !row) return
    const given = inst.answers.map((_, i) => parseAnswer(inputs[i] ?? ''))
    const results = inst.answers.map((a, i) => isCorrect(given[i], a.value, a.tolerance))
    const allRight = results.every(Boolean)
    setChecked(results)
    setTally((s) => ({ right: s.right + (allRight ? 1 : 0), done: s.done + 1 }))
    await recordDrillAnswer(row.id, given, allRight, performance.now() - started.current, seed)
  }

  function another() {
    setSeed((s) => s + 7919)
    setInputs([]); setChecked(null)
    started.current = performance.now()
    setTimeout(() => firstInput.current?.focus(), 50)
  }

  const bad = (i: number) => (inputs[i] ?? '').trim() !== '' && parseAnswer(inputs[i]) === null

  return (
    <div className="flex flex-col gap-4">
      {back}
      <div className="flex items-baseline justify-between gap-2">
        <h1 className="text-xl font-semibold leading-tight">{drillTitle(row, lang)}</h1>
        {tally.done > 0 && <span className="shrink-0 text-sm text-muted">{t('practice.score', { right: tally.right, answered: tally.done })}</span>}
      </div>

      <form
        className="card flex flex-col gap-3"
        onSubmit={(e) => { e.preventDefault(); if (!checked) void check(); else another() }}
      >
        <Rich text={inst.question} mode="blocks" as="div" className="font-read text-[18px]" />
        {inst.answers.map((a, i) => {
          const state = checked?.[i]
          return (
            <label key={i} className="flex flex-col gap-1">
              <span className="font-semibold"><Rich text={a.label} mode="inline" /></span>
              <span className="flex items-center gap-2">
                <input
                  ref={i === 0 ? firstInput : undefined}
                  inputMode="decimal"
                  autoComplete="off"
                  className={`field flex-1 ${state === true ? 'border-ok' : state === false ? 'border-danger' : ''}`}
                  value={inputs[i] ?? ''}
                  readOnly={!!checked}
                  aria-invalid={state === false || bad(i)}
                  onChange={(e) => { const c = [...inputs]; c[i] = e.target.value; setInputs(c) }}
                />
                {a.unit && <span className="text-muted"><Rich text={a.unit} mode="inline" /></span>}
              </span>
              {bad(i) && <span className="text-sm text-danger">{t('drill.notNumber')}</span>}
              {state === true && <span className="text-sm font-semibold text-ok">{t('drill.right')}</span>}
              {state === false && (
                <span className="text-sm font-semibold text-danger">{t('drill.wrong', { answer: fmtNum(Math.round(a.value * 1e4) / 1e4, lang) })}</span>
              )}
            </label>
          )
        })}
        <button type="submit" className="btn-primary" disabled={!checked && inst.answers.some((_, i) => parseAnswer(inputs[i] ?? '') === null)}>
          {checked ? t('drill.another') : t('drill.check')}
        </button>
        <p className="text-sm text-muted">{t('drill.hint')}</p>
      </form>

      {checked && (
        <section className="card flex flex-col gap-2" aria-labelledby="sol-h">
          <h2 id="sol-h" className="font-semibold">{t('drill.solution')}</h2>
          <ol className="flex list-decimal flex-col gap-2 pl-5">
            {inst.steps.map((s, i) => <li key={i}><Rich text={s} mode="inline" className="font-read" /></li>)}
          </ol>
        </section>
      )}
    </div>
  )
}
