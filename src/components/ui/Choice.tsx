import { useId } from 'react'
import clsx from 'clsx'

export interface ChoiceOption<T extends string | number> { value: T; label: string; hint?: string }

/** Large radio-chip list. Arrow keys move between options (native radio behaviour). */
export function Choice<T extends string | number>(props: {
  legend: string
  options: ChoiceOption<T>[]
  value: T | undefined
  onChange: (v: T) => void
  columns?: 1 | 2 | 3
  hideLegend?: boolean
}) {
  const name = useId()
  return (
    <fieldset>
      <legend className={clsx('text-xl font-semibold mb-4', props.hideLegend && 'sr-only')}>{props.legend}</legend>
      <div className={clsx('grid gap-3', props.columns === 2 && 'grid-cols-2', props.columns === 3 && 'grid-cols-3')}>
        {props.options.map((o) => {
          const checked = props.value === o.value
          return (
            <label
              key={String(o.value)}
              className={clsx(
                'flex min-h-tap cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-2 transition-colors',
                checked ? 'border-accent bg-accent/15' : 'border-line bg-surface hover:border-muted',
              )}
            >
              <input
                type="radio"
                name={name}
                className="sr-only"
                checked={checked}
                onChange={() => props.onChange(o.value)}
              />
              <span
                aria-hidden
                className={clsx('h-5 w-5 shrink-0 rounded-full border-2', checked ? 'border-accent bg-accent shadow-[inset_0_0_0_3px_rgb(var(--surface))]' : 'border-muted')}
              />
              <span className="leading-snug">
                <span className="block font-semibold">{o.label}</span>
                {o.hint && <span className="block text-sm text-muted">{o.hint}</span>}
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
