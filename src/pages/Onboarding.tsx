import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { setLanguage, useT } from '../i18n'
import { Choice } from '../components/ui/Choice'
import { BOARDS, FOURTH_SUBJECT_OPTIONS, GROUPS, RELIGION_CODES, subjectByCode, type Board, type Group, type Lang, type Medium } from '../data/catalog'
import { saveProfile, useProfile } from '../state/profile'
import { logEvent } from '../state/events'

const STEPS = ['language', 'medium', 'board', 'group', 'fourth', 'target'] as const

/** Six one-tap steps; choosing an option moves on automatically, so it takes well under a minute. */
export default function Onboarding() {
  const { t, lang, n } = useT()
  const nav = useNavigate()
  const existing = useProfile()
  const [step, setStep] = useState(0)
  const [medium, setMedium] = useState<Medium>()
  const [board, setBoard] = useState<Board>()
  const [group, setGroup] = useState<Group>()
  const [religion, setReligion] = useState('111')
  const [fourth, setFourth] = useState<string>()
  const [hours, setHours] = useState(4)
  const [chosenLang, setChosenLang] = useState<Lang>()

  // Editing from Settings: start from the saved answers.
  useEffect(() => {
    if (!existing) return
    setMedium(existing.medium); setBoard(existing.board); setGroup(existing.group)
    setReligion(existing.religion_code); setFourth(existing.fourth_subject_code)
    setHours(Math.round(existing.daily_target_min / 60)); setChosenLang(existing.language)
  }, [existing])

  const name = (code: string) => { const s = subjectByCode(code); return s ? (lang === 'bn' ? s.name_bn : s.name_en) : code }
  const key = STEPS[step]
  const advance = () => setStep((s) => Math.min(STEPS.length - 1, s + 1))
  const canNext = useMemo(() => ({
    language: !!chosenLang, medium: !!medium, board: !!board, group: !!group, fourth: !!fourth, target: true,
  })[key], [key, chosenLang, medium, board, group, fourth])

  async function finish() {
    await saveProfile({
      language: lang, medium: medium!, board: board!, group: group!, religion_code: religion,
      fourth_subject_code: fourth!, daily_target_min: hours * 60,
    })
    await logEvent('onboarding_completed', { group, board })
    nav('/', { replace: true })
  }

  return (
    <div className="flex min-h-[70dvh] flex-col gap-6">
      <div>
        <p className="text-sm font-semibold text-muted">{t('onb.step', { n: step + 1, total: STEPS.length })}</p>
        <div className="mt-2 h-2 rounded-full bg-line" aria-hidden>
          <div className="h-2 rounded-full bg-accent transition-all" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
        </div>
      </div>

      <div className="flex-1">
        {key === 'language' && (
          <Choice<Lang>
            legend={t('onb.language')}
            value={chosenLang}
            options={[{ value: 'bn', label: 'বাংলা' }, { value: 'en', label: 'English' }]}
            onChange={(v) => { setChosenLang(v); void setLanguage(v); advance() }}
          />
        )}
        {key === 'medium' && (
          <Choice<Medium>
            legend={t('onb.medium')}
            value={medium}
            options={[{ value: 'bn', label: t('onb.mediumBn') }, { value: 'en', label: t('onb.mediumEn') }]}
            onChange={(v) => { setMedium(v); advance() }}
          />
        )}
        {key === 'board' && (
          <Choice<Board>
            legend={t('onb.board')} columns={2} value={board}
            options={BOARDS.map((b) => ({ value: b, label: t(`board.${b}`) }))}
            onChange={(v) => { setBoard(v); advance() }}
          />
        )}
        {key === 'group' && (
          <Choice<Group>
            legend={t('onb.group')} value={group}
            options={GROUPS.map((g) => ({ value: g, label: t(`group.${g}`) }))}
            onChange={(v) => { setGroup(v); if (fourth && !FOURTH_SUBJECT_OPTIONS[v].includes(fourth)) setFourth(undefined); advance() }}
          />
        )}
        {key === 'fourth' && group && (
          <div className="flex flex-col gap-6">
            <Choice<string>
              legend={t('onb.fourth')} value={fourth}
              options={FOURTH_SUBJECT_OPTIONS[group].map((c) => ({ value: c, label: name(c) }))}
              onChange={setFourth}
            />
            <p className="text-sm text-muted">{t('onb.fourthHint')}</p>
            <Choice<string>
              legend={t('onb.religion')} columns={2} value={religion}
              options={RELIGION_CODES.map((c) => ({ value: c, label: name(c).replace(/ (ও নৈতিক শিক্ষা|and Moral Education)$/, '') }))}
              onChange={setReligion}
            />
          </div>
        )}
        {key === 'target' && (
          <div className="flex flex-col gap-4">
            <label htmlFor="hours" className="text-xl font-semibold">{t('onb.target')}</label>
            <p className="text-center text-4xl font-semibold" aria-hidden>{t('onb.hours', { n: hours })}</p>
            <input
              id="hours" type="range" min={2} max={8} step={1} value={hours}
              onChange={(e) => setHours(+e.target.value)}
              aria-valuetext={t('onb.hours', { n: hours })}
              className="h-12 w-full accent-[rgb(var(--accent))]"
            />
            <div className="flex justify-between text-sm text-muted" aria-hidden><span>{n(2)}</span><span>{n(8)}</span></div>
            <p className="text-sm text-muted">{t('onb.targetHint')}</p>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        {step > 0 && <button className="btn-ghost flex-1" onClick={() => setStep(step - 1)}>{t('onb.back')}</button>}
        {key === 'target'
          ? <button className="btn-primary flex-[2]" onClick={finish}>{t('onb.finish')}</button>
          : <button className="btn-primary flex-[2]" disabled={!canNext} onClick={advance}>{t('onb.next')}</button>}
      </div>
    </div>
  )
}
