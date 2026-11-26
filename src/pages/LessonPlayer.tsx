import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import clsx from 'clsx'
import { db, kvGet } from '../db'
import type { ContentIndex } from '../data/content-types'
import { useT } from '../i18n'
import { usePrefs } from '../state/prefs'
import { SceneView } from '../components/content/SceneView'
import { audioUrl } from '../content/offline'
import { ensureChapter } from '../content/repo'
import { getPosition, loadSpeed, saveSpeed, savePosition, SPEEDS, type Speed } from '../state/lessonProgress'
import { logEvent } from '../state/events'
import { BackIcon, ReplayIcon } from '../components/icons'

/**
 * Narrated scene player. One scene at a time with captions; speed 0.75x-1.5x; replay;
 * a "check yourself" scene must be answered before moving on. Data Saver: no autoplay.
 */
export default function LessonPlayer() {
  const { id } = useParams()
  const { t, n, lang } = useT()
  const nav = useNavigate()
  const { dataSaver } = usePrefs()
  const lesson = useLiveQuery(() => (id ? db.c_lessons.get(id) : undefined), [id], null)
  const scenes = useLiveQuery(async () => (id ? (await db.c_scenes.where('lesson_id').equals(id).toArray()).sort((a, b) => a.idx - b.idx) : []), [id])
  const [idx, setIdx] = useState<number | null>(null)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState<Speed>(loadSpeed)
  const [showCaptions, setShowCaptions] = useState(true)
  const [audioError, setAudioError] = useState(false)
  const [finished, setFinished] = useState(false)
  const audio = useRef<HTMLAudioElement | null>(null)
  const urlRef = useRef<string | null>(null)
  const heading = useRef<HTMLDivElement>(null)

  // Resume where the student stopped.
  useEffect(() => {
    if (!id || idx !== null || !scenes?.length) return
    getPosition(id).then((p) => setIdx(p && !p.done && p.idx < scenes.length ? p.idx : 0))
    void logEvent('lesson_started', { lesson_id: id })
  }, [id, scenes, idx])

  const scene = scenes && idx !== null ? scenes[idx] : undefined
  const isQuestion = scene?.type === 'question'
  const answered = scene ? answers[scene.id] !== undefined : false
  const locked = isQuestion && !answered

  // Load the scene's narration. Autoplay unless Data Saver is on.
  useEffect(() => {
    if (!scene || !audio.current) return
    const el = audio.current
    let cancelled = false
    setAudioError(false)
    setPlaying(false)
    el.pause()
    if (!scene.audio_path) { el.removeAttribute('src'); return }
    audioUrl(scene.audio_path).then((url) => {
      if (cancelled) return
      if (urlRef.current?.startsWith('blob:')) URL.revokeObjectURL(urlRef.current)
      urlRef.current = url
      el.src = url
      el.playbackRate = speed
      if (!dataSaver) el.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
    })
    return () => { cancelled = true }
    // speed is applied separately so changing it doesn't restart the scene
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene?.id, dataSaver])

  useEffect(() => { if (audio.current) audio.current.playbackRate = speed; saveSpeed(speed) }, [speed])
  useEffect(() => () => { audio.current?.pause(); if (urlRef.current?.startsWith('blob:')) URL.revokeObjectURL(urlRef.current) }, [])

  // Save position on every scene change; move focus to the new scene for screen readers.
  useEffect(() => {
    if (!lesson || !scenes || idx === null) return
    void savePosition({ lesson_id: lesson.id, chapter_id: lesson.chapter_id, idx, total: scenes.length, done: false })
    heading.current?.focus()
  }, [idx, lesson, scenes])

  const toggle = useCallback(() => {
    const el = audio.current
    if (!el || !scene?.audio_path) return
    if (el.paused) el.play().then(() => setPlaying(true)).catch(() => setAudioError(true))
    else { el.pause(); setPlaying(false) }
  }, [scene])

  const replay = () => {
    const el = audio.current
    if (!el || !scene?.audio_path) return
    el.currentTime = 0
    el.play().then(() => setPlaying(true)).catch(() => setAudioError(true))
  }

  async function next() {
    if (!scenes || idx === null || locked) return
    if (idx < scenes.length - 1) { setIdx(idx + 1); return }
    audio.current?.pause()
    await savePosition({ lesson_id: lesson!.id, chapter_id: lesson!.chapter_id, idx, total: scenes.length, done: true })
    const qs = scenes.filter((s) => s.type === 'question')
    const right = qs.filter((s) => answers[s.id] === s.body_json.question?.answer).length
    await logEvent('lesson_completed', { lesson_id: lesson!.id, checks: qs.length, right })
    setFinished(true)
  }

  if (lesson === null || scenes === undefined) return <p className="text-muted">{t('common.loading')}</p>
  if (!lesson) {
    return <MissingLesson />
  }
  const total = scenes.length
  const title = lang === 'bn' ? lesson.title_bn : lesson.title_en

  if (finished) {
    const qs = scenes.filter((s) => s.type === 'question')
    const right = qs.filter((s) => answers[s.id] === s.body_json.question?.answer).length
    return (
      <div className="flex flex-col items-center gap-4 pt-6 text-center">
        <img src={`${import.meta.env.BASE_URL}icon.svg`} alt="" width="72" height="72" />
        <h1 className="text-2xl font-semibold">{t('player.done')}</h1>
        <p>{t('player.checks', { right, total: qs.length })}</p>
        <p className="text-muted">{t('player.doneHint')}</p>
        <Link to={`/chapters/${lesson.chapter_id}?tab=mcq`} className="btn-primary w-full">{t('player.practise')}</Link>
        <button className="btn-ghost w-full" onClick={() => { setFinished(false); setAnswers({}); setIdx(0) }}>{t('player.again')}</button>
        <Link to={`/chapters/${lesson.chapter_id}`} className="btn-link">{t('player.backToChapter')}</Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <button className="btn-link -ml-2 px-1" onClick={() => nav(`/chapters/${lesson.chapter_id}`)} aria-label={t('player.backToChapter')}><BackIcon /></button>
        <p className="flex-1 truncate text-sm font-semibold text-muted">{title}</p>
        <p className="text-sm text-muted" aria-live="polite">{t('player.sceneOf', { n: (idx ?? 0) + 1, total })}</p>
      </div>
      <div className="flex gap-1" aria-hidden>
        {scenes.map((s, i) => (
          <span key={s.id} className={clsx('h-1.5 flex-1 rounded-full', i <= (idx ?? 0) ? 'bg-accent' : 'bg-line', s.type === 'question' && 'h-2.5')} />
        ))}
      </div>

      {scene && (
        <div ref={heading} tabIndex={-1} className="card outline-none">
          <SceneView scene={scene} chosen={answers[scene.id] ?? null} onAnswer={(i) => setAnswers({ ...answers, [scene.id]: i })} />
        </div>
      )}

      {scene?.captions && showCaptions && (
        <p className="rounded-xl bg-navy px-4 py-3 text-[16px] leading-relaxed text-white" lang={lesson.medium}>{scene.captions}</p>
      )}

      <audio ref={audio} preload={dataSaver ? 'none' : 'auto'} onEnded={() => setPlaying(false)} onPause={() => setPlaying(false)} onPlay={() => setPlaying(true)} onError={() => scene?.audio_path && setAudioError(true)} />
      {audioError && <p role="status" className="text-sm text-muted">{t('player.audioUnavailable')}</p>}

      <div className="sticky bottom-[64px] z-10 -mx-4 flex flex-col gap-2 border-t border-line bg-bg px-4 py-3">
        <div className="flex items-center gap-2">
          <button className="btn-ghost min-w-tap px-3" onClick={() => idx && setIdx(idx - 1)} disabled={!idx} aria-label={t('player.prev')}>‹</button>
          <button className="btn-ghost flex-1" onClick={toggle} disabled={!scene?.audio_path} aria-pressed={playing}>
            {playing ? t('player.pause') : t('player.play')}
          </button>
          <button className="btn-ghost px-3" onClick={replay} disabled={!scene?.audio_path} aria-label={t('player.replay')}><ReplayIcon /></button>
          <button className="btn-primary flex-1" onClick={next} disabled={locked} aria-describedby={locked ? 'locked-hint' : undefined}>
            {idx === total - 1 ? t('player.finish') : t('player.next')}
          </button>
        </div>
        {locked && <p id="locked-hint" className="text-center text-sm text-muted">{t('player.answerToContinue')}</p>}
        <div className="flex items-center justify-between gap-2 text-sm">
          <div role="group" aria-label={t('player.speed')} className="flex gap-1">
            {SPEEDS.map((s) => (
              <button key={s} className={clsx('min-h-[40px] rounded-lg px-2 font-semibold', speed === s ? 'bg-accent text-accent-ink' : 'text-muted')} aria-pressed={speed === s} onClick={() => setSpeed(s)}>
                {n(s)}×
              </button>
            ))}
          </div>
          <button className="min-h-[40px] rounded-lg px-2 font-semibold text-muted" aria-pressed={showCaptions} onClick={() => setShowCaptions(!showCaptions)}>
            {showCaptions ? t('player.captionsOn') : t('player.captionsOff')}
          </button>
        </div>
      </div>
    </div>
  )
}

function MissingLesson() {
  const { t } = useT()
  const { id } = useParams()
  // The lesson may belong to a chapter not cached yet (e.g. a shared link): try to fetch it.
  useEffect(() => {
    if (!id || !navigator.onLine) return
    kvGet<ContentIndex['packs']>('content.packs', {}).then(async (packs) => {
      for (const [chapterId, media] of Object.entries(packs)) {
        for (const m of Object.keys(media) as ('bn' | 'en')[]) {
          if (!media[m]?.lessons) continue
          await ensureChapter(chapterId, m).catch(() => {})
          if (await db.c_lessons.get(id)) return
        }
      }
    })
  }, [id])
  return <p className="card">{navigator.onLine ? t('common.loading') : t('chapter.offlineNotDownloaded')}</p>
}
