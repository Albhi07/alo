import { useEffect } from 'react'
import { useT } from '../i18n'
import { useProfile } from '../state/profile'
import { ensurePlan, useMissed, usePlan, WINDOW } from '../state/plan'
import { todayIso } from '../lib/format'
import { addDays } from '../lib/days'
import { PlanList } from '../components/PlanList'
import { useExamData } from '../state/exam'
import { subjectByCode } from '../data/catalog'

export default function Plan() {
  const { t, lang, date } = useT()
  const profile = useProfile()
  const today = todayIso()
  const items = usePlan(today, WINDOW)
  const missed = useMissed(today)
  const { routine, config } = useExamData()
  useEffect(() => { if (profile) void ensurePlan(profile) }, [profile])
  if (!profile || !items) return <p className="text-muted">{t('common.loading')}</p>

  const days = Array.from({ length: WINDOW }, (_, i) => addDays(today, i))
  const paperOn = (d: string) => routine.find((r) => r.exam_year === config.exam_year && r.date === d)
  const name = (code: string) => { const s = subjectByCode(code); return s ? (lang === 'bn' ? s.name_bn : s.name_en) : code }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">{t('plan.title')}</h1>
      <p className="text-sm text-muted">{t('plan.how')}</p>
      {missed > 0 && <p className="card text-sm" role="status">{t('plan.replanned', { count: missed })}</p>}
      <button className="btn-ghost self-start" onClick={() => void ensurePlan(profile, new Date(), true)}>{t('plan.rebuild')}</button>
      {days.map((d) => {
        const list = items.filter((x) => x.date === d)
        const paper = paperOn(d)
        return (
          <section key={d} aria-labelledby={`d-${d}`} className="flex flex-col gap-2">
            <h2 id={`d-${d}`} className="font-semibold">{d === today ? t('plan.today') : date(d, { weekday: true })}</h2>
            {paper && <p className="card border-2 border-accent font-semibold">{t('plan.exam', { subject: name(paper.subject_code) })}</p>}
            {list.length ? <PlanList items={list} /> : !paper && <p className="text-sm text-muted">{t('plan.empty')}</p>}
          </section>
        )
      })}
    </div>
  )
}
