import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { useT } from '../i18n'
import type { Field } from './entities'

/** One form control for an entity field. JSON and tags are edited as text and parsed on save. */
export function FieldInput({ field, value, onChange, disabled }: {
  field: Field; value: unknown; onChange: (v: unknown) => void; disabled?: boolean
}) {
  const { t, lang } = useT()
  const chapters = useLiveQuery(() => (field.type === 'chapter' ? db.c_chapters.toArray() : []), [field.type], [])
  const subjects = useLiveQuery(() => (field.type === 'chapter' || field.type === 'subject' ? db.c_subjects.orderBy('code').toArray() : []), [field.type], [])
  const id = `f-${field.name}`
  const label = (
    <label htmlFor={id} className="label">
      {t(`admin.field.${field.name}`, { defaultValue: field.name })}{field.required && ' *'}
    </label>
  )
  const common = { id, disabled, className: 'field' }

  switch (field.type) {
    case 'bool':
      return (
        <label className="flex min-h-tap items-center gap-3">
          <input id={id} type="checkbox" className="h-6 w-6" checked={!!value} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
          <span className="font-semibold">{t(`admin.field.${field.name}`, { defaultValue: field.name })}</span>
        </label>
      )
    case 'textarea':
    case 'json':
      return (
        <div>
          {label}
          <textarea
            {...common} rows={field.type === 'json' ? 8 : 5} className="field py-2 font-mono text-sm" spellCheck={field.type !== 'json'}
            value={typeof value === 'string' ? value : value == null ? '' : JSON.stringify(value, null, 2)}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      )
    case 'select':
      return (
        <div>{label}
          <select {...common} value={String(value ?? '')} onChange={(e) => onChange(e.target.value || null)}>
            {!field.required && !field.options!.includes('') && <option value="">—</option>}
            {field.options!.map((o) => <option key={o} value={o}>{o || '—'}</option>)}
          </select>
        </div>
      )
    case 'subject':
      return (
        <div>{label}
          <select {...common} value={String(value ?? '')} onChange={(e) => onChange(e.target.value || null)}>
            <option value="">—</option>
            {subjects.map((s) => <option key={s.code} value={s.code}>{s.code} · {lang === 'bn' ? s.name_bn : s.name_en}</option>)}
          </select>
        </div>
      )
    case 'chapter':
      return (
        <div>{label}
          <select {...common} value={String(value ?? '')} onChange={(e) => onChange(e.target.value || null)}>
            <option value="">—</option>
            {[...chapters].sort((a, b) => a.subject_code.localeCompare(b.subject_code) || a.number - b.number).map((c) => (
              <option key={c.id} value={c.id}>{c.subject_code} · {c.number}. {lang === 'bn' ? c.title_bn : c.title_en}</option>
            ))}
          </select>
        </div>
      )
    case 'tags':
      return (
        <div>{label}
          <input {...common} value={Array.isArray(value) ? value.join(', ') : String(value ?? '')} onChange={(e) => onChange(e.target.value)} />
        </div>
      )
    case 'number':
      return <div>{label}<input {...common} type="number" inputMode="numeric" value={value == null ? '' : String(value)} onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))} /></div>
    case 'date':
      return <div>{label}<input {...common} type="date" value={String(value ?? '').slice(0, 10)} onChange={(e) => onChange(e.target.value || null)} /></div>
    case 'time':
      return <div>{label}<input {...common} type="time" value={String(value ?? '').slice(0, 5)} onChange={(e) => onChange(e.target.value || null)} /></div>
    default:
      return <div>{label}<input {...common} value={String(value ?? '')} onChange={(e) => onChange(e.target.value)} /></div>
  }
}

/** Convert form values to row values. Returns errors keyed by field name. */
export function normalise(fields: Field[], values: Record<string, unknown>): { row: Record<string, unknown>; errors: Record<string, string> } {
  const row: Record<string, unknown> = { ...values }
  const errors: Record<string, string> = {}
  for (const f of fields) {
    let v = values[f.name]
    if (f.type === 'json' && typeof v === 'string') {
      if (v.trim() === '') v = null
      else try { v = JSON.parse(v) } catch { errors[f.name] = 'json' }
    }
    if (f.type === 'tags' && typeof v === 'string') v = v.split(',').map((s) => s.trim()).filter(Boolean)
    if (f.type === 'tags' && v == null) v = []
    if (f.required && (v === null || v === undefined || v === '')) errors[f.name] = 'required'
    row[f.name] = v
  }
  return { row, errors }
}
