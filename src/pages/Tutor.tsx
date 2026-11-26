import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import clsx from 'clsx'
import { useT } from '../i18n'
import { useOnline } from '../hooks/useOnline'
import { useProfile, subjectsFor } from '../state/profile'
import { useUserId } from '../state/auth'
import { supabaseConfigured } from '../lib/supabase'
import { subjectByCode } from '../data/catalog'
import { ask, markPhoto, newConversation, refreshQuota, useConversation, useQuota, type Marking, type TutorError } from '../state/tutor'
import { Rich } from '../components/content/Rich'

const PART_BN = { a: 'ক', b: 'খ', c: 'গ', d: 'ঘ' } as const

export default function Tutor() {
  const { t, lang, n } = useT()
  const online = useOnline()
  const profile = useProfile()
  const userId = useUserId()
  const convo = useConversation()
  const quota = useQuota()
  const [params, setParams] = useSearchParams()
  const questionId = params.get('q') ?? undefined
  const [mode, setMode] = useState<'ask' | 'mark'>(params.get('mark') || questionId ? 'mark' : 'ask')
  const [subject, setSubject] = useState<string>(params.get('subject') ?? '')
  const [text, setText] = useState('')
  const [qText, setQText] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<TutorError | null>(null)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => { if (userId && online) void refreshQuota() }, [userId, online])
  useEffect(() => { endRef.current?.scrollIntoView?.({ block: 'end' }) }, [convo?.lines.length, busy])

  if (!profile || convo === undefined) return null
  const name = (code: string) => { const s = subjectByCode(code); return s ? (lang === 'bn' ? s.name_bn : s.name_en) : code }
  const signedIn = Boolean(userId)
  const ready = supabaseConfigured && signedIn && online

  const send = async (e: { preventDefault(): void }) => {
    e.preventDefault()
    const q = text.trim()
    if (!q || busy) return
    setBusy(true); setErr(null); setText('')
    const r = await ask(q, lang, subject || null)
    if (r) { setErr(r); setText(q) }
    setBusy(false)
  }
  const sendPhoto = async (e: FormEvent) => {
    e.preventDefault()
    if (!photo || busy) return
    setBusy(true); setErr(null)
    const r = await markPhoto(photo, { lang, subject_code: subject || null, question_id: questionId, question_text: qText.trim() || undefined, label: t('tutor.photoSent') })
    if (r) setErr(r)
    else { setPhoto(null); setQText(''); if (questionId) { params.delete('q'); setParams(params, { replace: true }) } }
    setBusy(false)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">{t('tutor.title')}</h1>
        {convo.lines.length > 0 && <button className="btn-ghost px-3" onClick={() => { setErr(null); void newConversation(subject || null) }}>{t('tutor.newChat')}</button>}
      </div>

      {!supabaseConfigured && <p className="card" role="status">{t('tutor.notConfigured')}</p>}
      {supabaseConfigured && !signedIn && (
        <div className="card flex flex-col gap-2" role="status">
          <p>{t('tutor.signIn')}</p>
          <Link to="/signin" className="btn-primary self-start">{t('tutor.signInButton')}</Link>
        </div>
      )}
      {!online && <p className="card border-accent" role="status">{t('net.needsOnline')}</p>}

      <p className="text-sm text-muted">{t('tutor.intro')}</p>

      {ready && quota && (
        <p className="text-sm text-muted">{t('tutor.left', { messages: n(quota.messages_left), photos: n(quota.photos_left) })}</p>
      )}

      <div className="flex flex-col gap-3" aria-live="polite" aria-busy={busy}>
        {convo.lines.length === 0 && <p className="card text-muted">{t('tutor.empty')}</p>}
        {convo.lines.map((l, i) => (
          <div key={i} className={clsx('max-w-[90%] rounded-2xl p-3', l.role === 'user' ? 'self-end bg-accent/15' : 'self-start border border-line bg-surface')}>
            <p className="sr-only">{l.role === 'user' ? t('tutor.you') : t('tutor.tutor')}</p>
            {l.photo && <p className="text-xs font-semibold text-muted">📷 {t('tutor.photo')}</p>}
            {l.marking ? <MarkingCard m={l.marking} /> : l.role === 'assistant' ? <Rich text={l.text} mode="markdown" as="div" className="flex flex-col gap-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5" /> : <p className="whitespace-pre-wrap">{l.text}</p>}
          </div>
        ))}
        {busy && <p className="self-start text-sm text-muted" role="status">{mode === 'mark' ? t('tutor.marking') : t('tutor.thinking')}</p>}
        <div ref={endRef} />
      </div>

      {err && <p className="card border-2 border-accent" role="alert">{t(`tutor.err.${err}`)}</p>}

      <section className="card flex flex-col gap-3" aria-label={t('tutor.compose')}>
        <div role="radiogroup" aria-label={t('tutor.modeLabel')} className="grid grid-cols-2 gap-2">
          {(['ask', 'mark'] as const).map((m) => (
            <button key={m} type="button" role="radio" aria-checked={mode === m}
              className={clsx('btn border-2', mode === m ? 'border-accent bg-accent/15' : 'border-line')}
              onClick={() => setMode(m)}>{t(`tutor.mode.${m}`)}</button>
          ))}
        </div>
        <label>
          <span className="label">{t('tutor.subject')}</span>
          <select className="field" value={subject} onChange={(e) => setSubject(e.target.value)}>
            <option value="">{t('tutor.anySubject')}</option>
            {subjectsFor(profile).map((s) => <option key={s.code} value={s.code}>{name(s.code)}</option>)}
          </select>
        </label>

        {mode === 'ask' ? (
          <form className="flex flex-col gap-2" onSubmit={(e) => void send(e)}>
            <label>
              <span className="label">{t('tutor.question')}</span>
              <textarea className="field min-h-24" value={text} maxLength={2000} onChange={(e) => setText(e.target.value)} placeholder={t('tutor.placeholder')}
                onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) void send(e) }} />
            </label>
            <button className="btn-primary" disabled={!ready || busy || !text.trim()}>{t('tutor.send')}</button>
          </form>
        ) : (
          <form className="flex flex-col gap-2" onSubmit={(e) => void sendPhoto(e)}>
            {questionId && <p className="text-sm font-semibold">{t('tutor.fromQuestion')}</p>}
            <p className="text-sm text-muted">{t('tutor.photoHow')}</p>
            <label>
              <span className="label">{t('tutor.photoPick')}</span>
              <input type="file" accept="image/jpeg,image/png,image/webp" capture="environment" className="field"
                onChange={(e) => setPhoto(e.target.files?.[0] ?? null)} />
            </label>
            {!questionId && (
              <label>
                <span className="label">{t('tutor.questionOptional')}</span>
                <textarea className="field min-h-20" value={qText} maxLength={2000} onChange={(e) => setQText(e.target.value)} placeholder={t('tutor.questionHint')} />
              </label>
            )}
            <button className="btn-primary" disabled={!ready || busy || !photo}>{t('tutor.markIt')}</button>
          </form>
        )}
      </section>

      <p className="text-xs text-muted">{t('tutor.privacy')}</p>
    </div>
  )
}

function MarkingCard({ m }: { m: Marking }) {
  const { t, lang, n } = useT()
  const label = (p: keyof typeof PART_BN) => (lang === 'bn' ? PART_BN[p] : p)
  return (
    <div className="flex flex-col gap-2">
      <p className="text-lg font-semibold">{t('tutor.score', { got: n(m.total), max: n(m.max_total) })}</p>
      {!m.legible && <p className="text-sm font-semibold">{t('tutor.notLegible')}</p>}
      <table className="w-full text-sm">
        <caption className="sr-only">{t('tutor.perPart')}</caption>
        <thead><tr className="text-left text-muted"><th scope="col">{t('tutor.part')}</th><th scope="col">{t('tutor.marks')}</th><th scope="col">{t('tutor.missing')}</th></tr></thead>
        <tbody>
          {m.parts.map((p) => (
            <tr key={p.part} className="border-t border-line align-top">
              <th scope="row" className="py-1 pr-2">({label(p.part)})</th>
              <td className="whitespace-nowrap py-1 pr-2 tabular-nums">{n(p.awarded)}/{n(p.max)}</td>
              <td className="py-1"><Rich text={p.missing || t('tutor.fullMarks')} /></td>
            </tr>
          ))}
        </tbody>
      </table>
      {m.summary && <Rich text={m.summary} as="p" />}
      {m.next_step && <p><strong>{t('tutor.nextStep')}</strong> <Rich text={m.next_step} /></p>}
    </div>
  )
}
