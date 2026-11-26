import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import clsx from 'clsx'
import { useT } from '../i18n'
import { db } from '../db'
import { subjectByCode } from '../data/catalog'
import { removeItem, setDone, type PlanItem } from '../state/plan'

/** Where a task's "Go" button leads. */
export function taskLink(it: PlanItem): string {
  switch (it.kind) {
    case 'lesson': return `/chapters/${it.ref_id}?tab=learn`
    case 'mcq': return `/practice/${it.ref_id}`
    case 'cq': return `/chapters/${it.ref_id}?tab=cq`
    case 'mock': return `/exam/mock/${it.ref_id}`
    case 'revision': return `/subjects/${it.ref_id}`
    default: return '/focus'
  }
}

export function PlanList({ items, editable = true }: { items: PlanItem[]; editable?: boolean }) {
  const { t, lang, n } = useT()
  const chapters = useLiveQuery(async () => new Map((await db.c_chapters.toArray()).map((c) => [c.id, c])), [], new Map())
  const subj = (code: string | null) => { const s = code ? subjectByCode(code) : null; return s ? (lang === 'bn' ? s.name_bn : s.name_en) : '' }
  const what = (it: PlanItem) => {
    if (it.kind === 'rest') return t('plan.kind.rest')
    const ch = it.ref_id ? chapters.get(it.ref_id) : undefined
    const chTitle = ch ? (lang === 'bn' ? ch.title_bn : ch.title_en) : ''
    if (it.kind === 'revision' || it.kind === 'mock') return `${t(`plan.kind.${it.kind}`)}: ${subj(it.subject_code)}`
    return `${t(`plan.kind.${it.kind}`)}: ${chTitle}`
  }
  return (
    <ul className="flex flex-col gap-2">
      {items.map((it) => (
        <li key={it.id} className={clsx('flex items-center gap-3 rounded-xl border border-line bg-surface p-2', it.done && 'opacity-70')}>
          {it.kind !== 'rest' && (
            <input type="checkbox" className="h-6 w-6 shrink-0" checked={it.done} aria-label={t('plan.markDone', { task: what(it) })}
              onChange={(e) => void setDone(it, e.target.checked)} />
          )}
          <div className="min-w-0 flex-1">
            <p className={clsx('font-semibold leading-snug', it.done && 'line-through')}>{what(it)}</p>
            <p className="text-sm text-muted">
              {it.kind !== 'revision' && it.kind !== 'mock' && it.subject_code ? `${subj(it.subject_code)} · ` : ''}
              {it.minutes > 0 ? t('chapter.minutes', { n: n(it.minutes) }) : t('plan.restHint')}
            </p>
          </div>
          {it.kind !== 'rest' && !it.done && <Link to={taskLink(it)} className="btn-ghost shrink-0 px-3">{t('plan.go')}</Link>}
          {editable && it.kind !== 'rest' && (
            <button type="button" className="btn-link shrink-0 px-1 text-sm" aria-label={t('plan.removeTask', { task: what(it) })} onClick={() => void removeItem(it)}>✕</button>
          )}
        </li>
      ))}
    </ul>
  )
}
