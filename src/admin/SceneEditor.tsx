import { useCallback, useEffect, useState } from 'react'
import { useT } from '../i18n'
import type { SceneBody, SceneRow, SceneType } from '../data/content-types'
import { SceneView } from '../components/content/SceneView'
import { adminStore } from './store'

const TYPES: SceneType[] = ['text', 'formula', 'diagram', 'worked_step', 'question']

/** Edit, reorder, preview and attach narration audio to a lesson's scenes. */
export function SceneEditor({ lessonId }: { lessonId: string }) {
  const { t, n } = useT()
  const store = adminStore()
  const [scenes, setScenes] = useState<SceneRow[]>([])
  const [open, setOpen] = useState<string | null>(null)
  const reload = useCallback(async () => {
    const all = (await store.list('lesson_scenes')) as unknown as SceneRow[]
    setScenes(all.filter((s) => s.lesson_id === lessonId).sort((a, b) => a.idx - b.idx))
  }, [lessonId, store])
  useEffect(() => { void reload() }, [reload])

  async function save(s: SceneRow) { await store.save('lesson_scenes', s as never); await reload() }
  async function add() {
    const idx = scenes.length ? scenes[scenes.length - 1].idx + 1 : 0
    const s = await store.save('lesson_scenes', { lesson_id: lessonId, idx, type: 'text', body_json: { title: '', bullets: [] }, audio_path: null, captions: '' })
    await reload()
    setOpen(String(s.id))
  }
  async function move(i: number, d: -1 | 1) {
    const a = scenes[i], b = scenes[i + d]
    if (!b) return
    // Swap via a temporary index so the (lesson_id, idx) unique key never collides.
    await store.save('lesson_scenes', { ...a, idx: -1 - a.idx } as never)
    await store.save('lesson_scenes', { ...b, idx: a.idx } as never)
    await store.save('lesson_scenes', { ...a, idx: b.idx } as never)
    await reload()
  }

  return (
    <section className="flex flex-col gap-3" aria-labelledby="scenes-h">
      <h3 id="scenes-h" className="text-lg font-semibold">{t('admin.scenes')} ({n(scenes.length)})</h3>
      {scenes.map((s, i) => (
        <div key={s.id} className="card flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{n(i + 1)}.</span>
            <span className="flex-1 truncate">{s.body_json.title || '—'} <span className="text-sm text-muted">({s.type})</span></span>
            <button className="btn-link" aria-label={t('admin.moveUp')} onClick={() => move(i, -1)} disabled={i === 0}>↑</button>
            <button className="btn-link" aria-label={t('admin.moveDown')} onClick={() => move(i, 1)} disabled={i === scenes.length - 1}>↓</button>
            <button className="btn-link" aria-expanded={open === s.id} onClick={() => setOpen(open === s.id ? null : s.id)}>{open === s.id ? t('common.close') : t('admin.edit')}</button>
          </div>
          {open === s.id && <SceneForm scene={s} onSave={save} onDelete={async () => { await store.remove('lesson_scenes', s.id); await reload() }} />}
        </div>
      ))}
      <button className="btn-ghost" onClick={add}>{t('admin.addScene')}</button>
    </section>
  )
}

function SceneForm({ scene, onSave, onDelete }: { scene: SceneRow; onSave: (s: SceneRow) => Promise<void>; onDelete: () => Promise<void> }) {
  const { t } = useT()
  const store = adminStore()
  const [s, setS] = useState<SceneRow>(scene)
  const [chosen, setChosen] = useState<number | null>(null)
  const [msg, setMsg] = useState('')
  const b = s.body_json
  const setB = (patch: Partial<SceneBody>) => setS({ ...s, body_json: { ...b, ...patch } })
  const lines = (v?: string[]) => (v ?? []).join('\n')
  const toLines = (v: string) => v.split('\n').map((x) => x.trim()).filter(Boolean)
  const L = (k: string) => t(`admin.scene.${k}`)

  async function upload(file: File) {
    const ext = file.name.split('.').pop() || 'ogg'
    const path = `${s.lesson_id}/${s.idx}-${Date.now()}.${ext}`
    await store.uploadAudio(path, file)
    setS({ ...s, audio_path: path })
    setMsg(t('admin.audioUploaded'))
  }

  return (
    <div className="flex flex-col gap-3">
      <label className="label" htmlFor={`st-${s.id}`}>{L('type')}</label>
      <select id={`st-${s.id}`} className="field" value={s.type} onChange={(e) => setS({ ...s, type: e.target.value as SceneType })}>
        {TYPES.map((x) => <option key={x}>{x}</option>)}
      </select>
      <label className="label" htmlFor={`stt-${s.id}`}>{L('title')}</label>
      <input id={`stt-${s.id}`} className="field" value={b.title} onChange={(e) => setB({ title: e.target.value })} />
      {s.type !== 'question' && s.type !== 'worked_step' && (
        <><label className="label" htmlFor={`sb-${s.id}`}>{L('bullets')}</label>
          <textarea id={`sb-${s.id}`} rows={4} className="field py-2" value={lines(b.bullets)} onChange={(e) => setB({ bullets: toLines(e.target.value) })} /></>
      )}
      {s.type === 'formula' && (
        <><label className="label" htmlFor={`stx-${s.id}`}>{L('tex')}</label>
          <input id={`stx-${s.id}`} className="field font-mono" value={b.tex ?? ''} onChange={(e) => setB({ tex: e.target.value })} /></>
      )}
      {(s.type === 'diagram' || s.type === 'text') && (
        <><label className="label" htmlFor={`ssv-${s.id}`}>{L('svg')}</label>
          <textarea id={`ssv-${s.id}`} rows={4} className="field py-2 font-mono text-xs" value={b.svg ?? ''} onChange={(e) => setB({ svg: e.target.value || undefined })} /></>
      )}
      {s.type === 'worked_step' && (
        <><label className="label" htmlFor={`sp-${s.id}`}>{L('problem')}</label>
          <input id={`sp-${s.id}`} className="field" value={b.problem ?? ''} onChange={(e) => setB({ problem: e.target.value })} />
          <label className="label" htmlFor={`sst-${s.id}`}>{L('steps')}</label>
          <textarea
            id={`sst-${s.id}`} rows={5} className="field py-2 font-mono text-sm"
            value={(b.steps ?? []).map((x) => (x.tex ? `tex: ${x.tex}` : x.text ?? '')).join('\n')}
            onChange={(e) => setB({ steps: toLines(e.target.value).map((l) => (l.startsWith('tex:') ? { tex: l.slice(4).trim() } : { text: l })) })}
          /></>
      )}
      {s.type === 'question' && (
        <>
          <label className="label" htmlFor={`sq-${s.id}`}>{L('stem')}</label>
          <input id={`sq-${s.id}`} className="field" value={b.question?.stem ?? ''} onChange={(e) => setB({ question: { ...emptyQ(b), stem: e.target.value } })} />
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <input type="radio" name={`ans-${s.id}`} aria-label={L('correct')} checked={b.question?.answer === i} onChange={() => setB({ question: { ...emptyQ(b), answer: i } })} />
              <input className="field" aria-label={`${L('option')} ${i + 1}`} value={b.question?.options[i] ?? ''} onChange={(e) => {
                const options = [...emptyQ(b).options]; options[i] = e.target.value; setB({ question: { ...emptyQ(b), options } })
              }} />
            </div>
          ))}
          <label className="label" htmlFor={`sx-${s.id}`}>{L('explanation')}</label>
          <textarea id={`sx-${s.id}`} rows={2} className="field py-2" value={b.question?.explanation ?? ''} onChange={(e) => setB({ question: { ...emptyQ(b), explanation: e.target.value } })} />
        </>
      )}
      <label className="label" htmlFor={`sc-${s.id}`}>{L('captions')}</label>
      <textarea id={`sc-${s.id}`} rows={4} className="field py-2" value={s.captions ?? ''} onChange={(e) => setS({ ...s, captions: e.target.value })} />
      <label className="label" htmlFor={`sa-${s.id}`}>{L('audio')}</label>
      <input id={`sa-${s.id}`} type="file" accept="audio/ogg,audio/opus,audio/webm,audio/mp4,audio/aac,audio/mpeg" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
      {s.audio_path && <p className="break-all text-sm text-muted">{s.audio_path}</p>}

      <details className="rounded-xl border border-line p-3">
        <summary className="cursor-pointer font-semibold">{L('preview')}</summary>
        <div className="mt-3"><SceneView scene={s} chosen={chosen} onAnswer={setChosen} /></div>
      </details>

      <div className="flex gap-2">
        <button className="btn-primary flex-1" onClick={async () => { await onSave(s); setMsg(t('admin.saved')) }}>{t('admin.save')}</button>
        <button className="btn-ghost text-danger" onClick={() => confirm(t('admin.deleteConfirm')) && onDelete()}>{t('admin.delete')}</button>
      </div>
      {msg && <p role="status">{msg}</p>}
    </div>
  )
}

const emptyQ = (b: SceneBody) => b.question ?? { stem: '', options: ['', '', '', ''], answer: 0, explanation: '' }
