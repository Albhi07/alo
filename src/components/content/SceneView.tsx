import { useMemo } from 'react'
import type { SceneRow } from '../../data/content-types'
import { sanitizeSvg } from '../../lib/markup'
import { Rich } from './Rich'
import { McqOptions } from './McqOptions'

/** Renders one lesson scene. Question scenes are interactive through `onAnswer`. */
export function SceneView({ scene, chosen, onAnswer }: {
  scene: SceneRow
  chosen?: number | null
  onAnswer?: (index: number) => void
}) {
  const b = scene.body_json
  const svg = useMemo(() => (b.svg ? sanitizeSvg(b.svg) : ''), [b.svg])
  return (
    <article className="flex flex-col gap-4 font-read text-[18px] leading-relaxed">
      <h2 className="font-ui text-xl font-semibold">{b.title}</h2>
      {svg && <div className="mx-auto w-full max-w-[280px] text-ink" dangerouslySetInnerHTML={{ __html: svg }} />}
      {b.tex && <div className="overflow-x-auto rounded-xl bg-accent/10 px-3 py-4 text-center"><Rich text={b.tex} mode="tex" as="div" /></div>}
      {b.problem && <Rich text={b.problem} as="p" className="font-semibold" />}
      {b.steps && (
        <ol className="flex flex-col gap-2 border-l-4 border-accent pl-4">
          {b.steps.map((s, i) => (
            <li key={i} className="overflow-x-auto">
              {s.text && <Rich text={s.text} as="div" />}
              {s.tex && <Rich text={s.tex} mode="tex" as="div" />}
            </li>
          ))}
        </ol>
      )}
      {b.bullets && b.bullets.length > 0 && (
        <ul className="flex list-disc flex-col gap-2 pl-5">
          {b.bullets.map((t, i) => <li key={i}><Rich text={t} /></li>)}
        </ul>
      )}
      {b.question && (
        <div className="font-ui">
          <Rich text={b.question.stem} as="p" className="mb-3 font-semibold" />
          <McqOptions
            options={b.question.options}
            answer={b.question.answer}
            chosen={chosen ?? null}
            onChoose={(i) => onAnswer?.(i)}
            explanation={b.question.explanation}
          />
        </div>
      )}
    </article>
  )
}
