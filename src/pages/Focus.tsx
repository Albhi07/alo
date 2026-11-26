import { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import { useT } from '../i18n'
import { useProfile, subjectsFor } from '../state/profile'
import { MODES, secondsLeft, startFocus, stopFocus, tick, useStudyStats, useTimer, type Mode } from '../state/focus'
import { subjectByCode } from '../data/catalog'
import { kvGet, kvSet } from '../db'
import { Ring } from '../components/ui/Ring'
import { WeekChart } from '../components/WeekChart'
import { FlameIcon } from '../components/icons'

export default function Focus() {
  const { t, lang, n, clock } = useT()
  const profile = useProfile()
  const timer = useTimer()
  const stats = useStudyStats()
  const [mode, setMode] = useState<Mode>('25/5')
  const [subject, setSubject] = useState<string>('')
  const [now, setNow] = useState(() => Date.now())
  const [justDone, setJustDone] = useState(false)
  const prevPhase = useRef<string | null>(null)

  useEffect(() => { void kvGet<Mode>('focus.mode', '25/5').then(setMode) }, [])

  // Recompute from the stored start time every second, and straight away when the app comes back.
  useEffect(() => {
    if (!timer) return
    const step = () => { const t = Date.now(); setNow(t); void tick(t) }
    step()
    const id = setInterval(step, 1000)
    document.addEventListener('visibilitychange', step)
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', step) }
  }, [timer])

  useEffect(() => {
    const phase = timer?.phase ?? null
    if (prevPhase.current === 'work' && phase !== 'work') { setJustDone(true); if (navigator.userActivation?.hasBeenActive) navigator.vibrate?.(300) }
    prevPhase.current = phase
  }, [timer?.phase])

  if (!profile || timer === undefined) return null
  const name = (code: string) => { const s = subjectByCode(code); return s ? (lang === 'bn' ? s.name_bn : s.name_en) : code }
  const target = profile.daily_target_min
  const todayMin = stats?.today ?? 0
  const left = timer ? secondsLeft(timer, now) : MODES[mode].work * 60
  const total = timer ? (timer.phase === 'work' ? MODES[timer.mode].work : MODES[timer.mode].rest) * 60 : MODES[mode].work * 60
  const pct = timer ? Math.round(100 * (1 - left / total)) : 0

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">{t('focus.title')}</h1>

      <section className="card flex flex-col items-center gap-3" aria-labelledby="timer-h">
        <h2 id="timer-h" className="sr-only">{t('focus.timer')}</h2>
        {!timer && (
          <div role="radiogroup" aria-label={t('focus.mode')} className="grid w-full grid-cols-2 gap-2">
            {(Object.keys(MODES) as Mode[]).map((m) => (
              <button key={m} type="button" role="radio" aria-checked={mode === m}
                className={clsx('btn border-2', mode === m ? 'border-accent bg-accent/15' : 'border-line')}
                onClick={() => { setMode(m); void kvSet('focus.mode', m) }}>
                {t('focus.modeLabel', { work: n(MODES[m].work), rest: n(MODES[m].rest) })}
              </button>
            ))}
          </div>
        )}
        <div className="relative flex items-center justify-center">
          <Ring value={pct} size={200} stroke={12} color={timer?.phase === 'break' ? 'rgb(var(--ok))' : undefined} label={t('focus.progress', { n: pct })} />
          <div className="absolute flex flex-col items-center">
            <span role="timer" className="text-4xl font-semibold tabular-nums">{clock(left)}</span>
            <span className="text-sm text-muted">{timer ? (timer.phase === 'work' ? t('focus.working') : t('focus.break')) : t('focus.ready')}</span>
          </div>
        </div>
        {timer?.subject_code && <p className="font-semibold">{name(timer.subject_code)}</p>}
        {justDone && !timer && <p role="status" className="font-semibold text-ok">{t('focus.sessionDone')}</p>}
        {!timer && (
          <label className="w-full">
            <span className="label">{t('focus.subject')}</span>
            <select className="field" value={subject} onChange={(e) => setSubject(e.target.value)}>
              <option value="">{t('focus.anySubject')}</option>
              {subjectsFor(profile).map((s) => <option key={s.code} value={s.code}>{name(s.code)}</option>)}
            </select>
          </label>
        )}
        {timer
          ? <button className="btn-ghost w-full" onClick={() => void stopFocus()}>{timer.phase === 'work' ? t('focus.stop') : t('focus.skipBreak')}</button>
          : <button className="btn-primary w-full" onClick={() => { setJustDone(false); void startFocus(mode, subject || null) }}>{t('focus.start')}</button>}
        <p className="text-center text-sm text-muted">{t('focus.keepsRunning')}</p>
      </section>

      <div className="grid grid-cols-2 gap-3">
        <section className="card">
          <h2 className="flex items-center gap-1 text-sm font-semibold text-muted"><FlameIcon className="h-4 w-4" />{t('home.streak')}</h2>
          <p className="text-2xl font-semibold">{t('home.streakDays', { count: stats?.streak.days ?? 0 })}</p>
          {stats?.streak.restUsedThisWeek && <p className="text-xs text-muted">{t('focus.restUsed')}</p>}
        </section>
        <section className="card">
          <h2 className="text-sm font-semibold text-muted">{t('focus.today')}</h2>
          <p className="text-xl font-semibold">{t('focus.ofTarget', { done: n((todayMin / 60).toFixed(1)), target: n((target / 60).toFixed(1)) })}</p>
          <div className="mt-1 h-2 rounded-full bg-line" aria-hidden><div className="h-2 rounded-full bg-accent" style={{ width: `${Math.min(100, (100 * todayMin) / target)}%` }} /></div>
        </section>
      </div>

      {stats && (
        <section className="card" aria-labelledby="week-h">
          <h2 id="week-h" className="mb-2 text-lg font-semibold">{t('focus.week')}</h2>
          <WeekChart week={stats.week} target={target} />
        </section>
      )}
    </div>
  )
}
