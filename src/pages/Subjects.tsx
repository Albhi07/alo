import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { useT } from '../i18n'
import { useProfile, subjectsFor } from '../state/profile'
import { subjectByCode, type Subject } from '../data/catalog'
import { Ring } from '../components/ui/Ring'
import { db } from '../db'

export const groupColor = (s: Pick<Subject, 'groups' | 'is_compulsory'>) =>
  s.is_compulsory ? 'rgb(var(--g-compulsory))'
    : s.groups.includes('science') ? 'rgb(var(--g-science))'
    : s.groups.includes('business') ? 'rgb(var(--g-business))'
    : s.groups.includes('humanities') ? 'rgb(var(--g-humanities))'
    : 'rgb(var(--accent))'

/** Mastery per subject = mean of its chapters' mastery (chapters not started count as 0). */
export function useSubjectMastery() {
  return useLiveQuery(async () => {
    const [chapters, mastery] = await Promise.all([db.c_chapters.toArray(), db.mastery.toArray()])
    const byChapter = new Map(mastery.map((m) => [m.chapter_id as string, Number(m.score) || 0]))
    const out = new Map<string, number>()
    const counts = new Map<string, number>()
    for (const c of chapters) {
      out.set(c.subject_code, (out.get(c.subject_code) ?? 0) + (byChapter.get(c.id) ?? 0))
      counts.set(c.subject_code, (counts.get(c.subject_code) ?? 0) + 1)
    }
    for (const [k, v] of out) out.set(k, Math.round(v / counts.get(k)!))
    return out
  }, [], new Map<string, number>())
}

export default function Subjects() {
  const { t, lang } = useT()
  const profile = useProfile()
  const mastery = useSubjectMastery()
  if (!profile) return null
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">{t('subjects.title')}</h1>
      <ul className="grid grid-cols-2 gap-3">
        {subjectsFor(profile).map(({ code, fourth }) => {
          const s = subjectByCode(code)!
          const m = mastery.get(code) ?? 0
          const color = groupColor(s)
          return (
            <li key={code}>
              <Link
                to={`/subjects/${code}`}
                className="card flex h-full flex-col items-start gap-2 border-l-4 hover:border-muted"
                style={{ borderLeftColor: color }}
              >
                <span className="relative">
                  <Ring value={m} size={48} color={color} label={t('subjects.mastery', { n: m })} />
                  <span aria-hidden className="absolute inset-0 flex items-center justify-center text-xs font-semibold">{t('common.percent', { n: m })}</span>
                </span>
                <span className="font-semibold leading-snug">{lang === 'bn' ? s.name_bn : s.name_en}</span>
                {fourth && <span className="rounded-md bg-accent/20 px-2 text-sm">{t('subjects.fourth')}</span>}
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
