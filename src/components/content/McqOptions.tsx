import clsx from 'clsx'
import { useT } from '../../i18n'
import { Rich } from './Rich'

const LABELS_BN = ['ক', 'খ', 'গ', 'ঘ']
const LABELS_EN = ['a', 'b', 'c', 'd']

/** Four options (ক/খ/গ/ঘ). After a choice: locks, marks right/wrong and shows the explanation. */
export function McqOptions({ options, answer, chosen, onChoose, explanation }: {
  options: string[]; answer: number; chosen: number | null; onChoose: (i: number) => void; explanation?: string | null
}) {
  const { t, lang } = useT()
  const labels = lang === 'bn' ? LABELS_BN : LABELS_EN
  const done = chosen !== null
  return (
    <div className="flex flex-col gap-2">
      <div role="radiogroup" className="flex flex-col gap-2">
        {options.map((o, i) => {
          const right = done && i === answer
          const wrong = done && i === chosen && i !== answer
          return (
            <button
              key={i} type="button" role="radio" aria-checked={chosen === i} disabled={done}
              onClick={() => onChoose(i)}
              className={clsx(
                'flex min-h-tap items-center gap-3 rounded-xl border-2 px-3 py-2 text-left disabled:cursor-default',
                right ? 'border-ok bg-ok/15' : wrong ? 'border-danger bg-danger/10' : 'border-line bg-surface hover:border-muted',
              )}
            >
              <span className={clsx('flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 font-semibold', right ? 'border-ok' : wrong ? 'border-danger' : 'border-muted')}>
                {labels[i]}
              </span>
              <Rich text={o} className="flex-1" />
              {right && <span className="sr-only">{t('mcq.correctMark')}</span>}
              {wrong && <span className="sr-only">{t('mcq.wrongMark')}</span>}
            </button>
          )
        })}
      </div>
      {done && (
        <div role="status" className={clsx('rounded-xl p-3', chosen === answer ? 'bg-ok/10' : 'bg-danger/10')}>
          <p className="font-semibold">{chosen === answer ? t('mcq.correct') : t('mcq.wrong', { label: labels[answer] })}</p>
          {explanation && <Rich text={explanation} as="div" className="mt-1" />}
        </div>
      )}
    </div>
  )
}
