import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { CqAnswer, QuestionRow } from '../../data/content-types'
import { useT } from '../../i18n'
import { Rich } from './Rich'

const PART_BN = { a: 'ক', b: 'খ', c: 'গ', d: 'ঘ' } as const

/** Creative question: stem + 4 parts. Write on paper first, then reveal the model answer and rubric. */
export function CqCard({ q, index }: { q: QuestionRow; index: number }) {
  const { t, lang } = useT()
  const [open, setOpen] = useState(false)
  const parts = q.marks_json ?? []
  const answers = q.answer_json as CqAnswer[]
  const label = (p: keyof typeof PART_BN) => (lang === 'bn' ? PART_BN[p] : p)
  return (
    <article className="card flex flex-col gap-3" aria-labelledby={`cq-${q.id}`}>
      <h3 id={`cq-${q.id}`} className="text-sm font-semibold text-muted">{t('cq.title', { n: index + 1 })}</h3>
      <Rich text={q.stem} mode="blocks" as="div" className="rounded-xl bg-bg p-3 font-read" />
      <ol className="flex flex-col gap-2">
        {parts.map((p) => (
          <li key={p.part} className="flex gap-2">
            <span className="font-semibold">{label(p.part)}.</span>
            <Rich text={p.prompt} className="flex-1" />
            <span className="shrink-0 text-sm text-muted">{t('cq.marks', { n: p.marks })}</span>
          </li>
        ))}
      </ol>
      <button className={open ? 'btn-ghost' : 'btn-primary'} aria-expanded={open} onClick={() => setOpen(!open)}>
        {open ? t('cq.hide') : t('cq.reveal')}
      </button>
      {!open && <p className="text-sm text-muted">{t('cq.writeFirst')}</p>}
      <Link to={`/tutor?q=${q.id}`} className="btn-link self-start text-sm">{t('cq.markWithTutor')}</Link>
      {open && (
        <div className="flex flex-col gap-4">
          {answers.map((a) => (
            <section key={a.part} className="border-l-4 border-accent pl-3">
              <h4 className="font-semibold">{t('cq.modelFor', { part: label(a.part) })}</h4>
              <Rich text={a.model} mode="blocks" as="div" className="overflow-x-auto font-read" />
              <h5 className="mt-2 text-sm font-semibold text-muted">{t('cq.rubric')}</h5>
              <ul className="text-sm">
                {a.rubric.map((r, i) => (
                  <li key={i} className="flex gap-2"><span className="shrink-0 font-semibold">{t('cq.points', { n: r.points })}</span><Rich text={r.criterion} /></li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </article>
  )
}
