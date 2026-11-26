import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useT } from '../i18n'
import { useProfile } from '../state/profile'
import { useChapter } from '../content/repo'
import type { QuestionRow } from '../data/content-types'
import { buildQueue, recordMcqAnswer } from '../state/practice'
import { McqOptions } from '../components/content/McqOptions'
import { Rich } from '../components/content/Rich'
import { BackIcon } from '../components/icons'

const REQUEUE_GAP = 3

/**
 * One question at a time with instant feedback. A wrong answer is asked again a few
 * questions later in the same round, and spaced repetition brings it back on later days.
 */
export default function Practice() {
  const { chapterId } = useParams()
  const { t, lang } = useT()
  const profile = useProfile()
  const chapter = useChapter(chapterId)
  const medium = profile?.medium ?? 'bn'
  const [queue, setQueue] = useState<QuestionRow[] | null>(null)
  const [pos, setPos] = useState(0)
  const [chosen, setChosen] = useState<number | null>(null)
  const [score, setScore] = useState({ right: 0, answered: 0 })
  const [round, setRound] = useState(0)
  const started = useRef(performance.now())
  const nextBtn = useRef<HTMLButtonElement>(null)
  const requeued = useRef(new Set<string>())

  useEffect(() => {
    if (!chapterId || !profile) return
    buildQueue(chapterId, medium).then((q) => { requeued.current.clear(); setQueue(q); setPos(0); setChosen(null); setScore({ right: 0, answered: 0 }) })
  }, [chapterId, medium, profile, round])

  const q = queue?.[pos]
  useEffect(() => { started.current = performance.now() }, [q?.id, pos])

  async function choose(i: number) {
    if (!q || chosen !== null) return
    setChosen(i)
    const correct = await recordMcqAnswer(q, i, performance.now() - started.current)
    setScore((s) => ({ right: s.right + (correct ? 1 : 0), answered: s.answered + 1 }))
    if (!correct && !requeued.current.has(q.id)) {
      // Ask it again a little later in this round (once; spaced repetition handles the rest).
      requeued.current.add(q.id)
      const copy = [...queue!]
      copy.splice(Math.min(copy.length, pos + 1 + REQUEUE_GAP), 0, q)
      setQueue(copy)
    }
    setTimeout(() => nextBtn.current?.focus(), 50)
  }

  if (!chapter || queue === null) return <p className="text-muted">{t('common.loading')}</p>
  const back = (
    <Link to={`/chapters/${chapter.id}?tab=mcq`} className="btn-link -ml-2 self-start"><BackIcon />{lang === 'bn' ? chapter.title_bn : chapter.title_en}</Link>
  )
  if (!queue.length) return <div className="flex flex-col gap-4">{back}<p className="card">{t('practice.none')}</p></div>

  if (pos >= queue.length) {
    return (
      <div className="flex flex-col gap-4">
        {back}
        <div className="card flex flex-col items-center gap-3 text-center">
          <h1 className="text-2xl font-semibold">{t('practice.roundDone')}</h1>
          <p className="text-lg">{t('practice.result', { right: score.right, total: score.answered })}</p>
          <p className="text-muted">{score.right === score.answered ? t('practice.allRight') : t('practice.reviewHint')}</p>
          <button className="btn-primary w-full" onClick={() => setRound((r) => r + 1)}>{t('practice.another')}</button>
        </div>
      </div>
    )
  }

  const context = q!.options_json?.context
  const subtype = q!.subtype === 'multi_completion' ? t('mcq.multi') : q!.subtype === 'situation' ? t('mcq.situation') : null

  return (
    <div className="flex flex-col gap-4">
      {back}
      <div className="flex items-center justify-between text-sm text-muted">
        <span aria-live="polite">{t('practice.progress', { n: pos + 1, total: queue.length })}</span>
        <span>{t('practice.score', { right: score.right, answered: score.answered })}</span>
      </div>
      <div className="h-2 rounded-full bg-line" aria-hidden><div className="h-2 rounded-full bg-accent" style={{ width: `${(pos / queue.length) * 100}%` }} /></div>

      <article key={`${q!.id}-${pos}`} className="card flex flex-col gap-3">
        {subtype && <p className="text-sm font-semibold text-muted">{subtype}</p>}
        {context && <Rich text={context} mode="blocks" as="div" className="rounded-xl bg-bg p-3 font-read" />}
        <Rich text={q!.stem} mode="blocks" as="div" className="font-read text-[18px] font-semibold" />
        <McqOptions
          options={q!.options_json!.options}
          answer={(q!.answer_json as { index: number }).index}
          chosen={chosen}
          onChoose={choose}
          explanation={q!.explanation}
        />
      </article>

      {chosen !== null && (
        <button ref={nextBtn} className="btn-primary" onClick={() => { setChosen(null); setPos(pos + 1) }}>
          {pos + 1 < queue.length ? t('practice.next') : t('practice.finish')}
        </button>
      )}
    </div>
  )
}
