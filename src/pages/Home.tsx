import { Link } from 'react-router-dom'
import { useT } from '../i18n'
import { useProfile, subjectsFor } from '../state/profile'
import { useExamData } from '../state/exam'
import { firstPaper, nextPaperFor, paperStart } from '../data/exam'
import { subjectByCode } from '../data/catalog'
import { daysBetween } from '../lib/format'
import { FlameIcon } from '../components/icons'

export default function Home() {
  const { t, lang, date, n } = useT()
  const profile = useProfile()
  const { routine } = useExamData()
  if (!profile) return null

  const now = new Date()
  const codes = subjectsFor(profile).map((s) => s.code)
  const first = firstPaper(routine)
  const next = nextPaperFor(routine, codes, now)
  const daysToFirst = first ? daysBetween(now, paperStart(first)) : 0
  const name = (code: string) => { const s = subjectByCode(code); return s ? (lang === 'bn' ? s.name_bn : s.name_en) : code }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">{t('home.hello')}</h1>

      {first && daysToFirst >= 0 ? (
        <section className="card bg-navy text-white" aria-labelledby="countdown">
          <p id="countdown" className="text-[28px] font-semibold leading-tight">{t('home.daysToFirst', { count: daysToFirst })}</p>
          <p className="mt-1 opacity-90">{t('home.firstPaper')}: {name(first.subject_code)}, {date(first.date)}</p>
          {next && next.id !== first.id && (
            <p className="mt-1 opacity-90">{t('home.nextPaper')}: {name(next.subject_code)}, {date(next.date)}</p>
          )}
          {!first.verified && <p className="mt-2 inline-block rounded-lg bg-white/15 px-2 py-0.5 text-sm">{t('home.unverified')}</p>}
        </section>
      ) : (
        <section className="card">{t('home.examOver')}</section>
      )}

      <div className="grid grid-cols-2 gap-3">
        <section className="card">
          <h2 className="flex items-center gap-1 text-sm font-semibold text-muted"><FlameIcon className="h-4 w-4" />{t('home.streak')}</h2>
          <p className="text-2xl font-semibold">{t('home.streakDays', { count: 0 })}</p>
        </section>
        <section className="card">
          <h2 className="text-sm font-semibold text-muted">{t('home.target')}</h2>
          <p className="text-2xl font-semibold">{n(0)} / {t('onb.hours', { n: profile.daily_target_min / 60 })}</p>
        </section>
      </div>

      <section className="card">
        <h2 className="text-lg font-semibold">{t('home.todayPlan')}</h2>
        <p className="text-muted">{t('home.planSoon')}</p>
      </section>

      <section className="card">
        <h2 className="text-lg font-semibold">{t('home.continue')}</h2>
        <p className="text-muted">{t('home.nothingYet')}</p>
        <Link to="/subjects" className="btn-primary mt-3 w-full">{t('nav.subjects')}</Link>
      </section>
    </div>
  )
}
