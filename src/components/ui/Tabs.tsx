import { useRef } from 'react'
import clsx from 'clsx'

/** Accessible tab bar (arrow keys move focus). Content is rendered by the caller. */
export function Tabs<T extends string>({ tabs, value, onChange, label }: {
  tabs: { id: T; label: string }[]; value: T; onChange: (id: T) => void; label: string
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  return (
    <div role="tablist" aria-label={label} className="-mx-4 flex gap-1 overflow-x-auto border-b border-line px-4">
      {tabs.map((tab, i) => (
        <button
          key={tab.id}
          ref={(el) => { refs.current[i] = el }}
          role="tab"
          id={`tab-${tab.id}`}
          aria-selected={value === tab.id}
          aria-controls={`panel-${tab.id}`}
          tabIndex={value === tab.id ? 0 : -1}
          onClick={() => onChange(tab.id)}
          onKeyDown={(e) => {
            const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
            if (!d) return
            const next = (i + d + tabs.length) % tabs.length
            refs.current[next]?.focus()
            onChange(tabs[next].id)
          }}
          className={clsx(
            'min-h-tap shrink-0 whitespace-nowrap border-b-4 px-3 font-semibold',
            value === tab.id ? 'border-accent text-ink' : 'border-transparent text-muted',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
