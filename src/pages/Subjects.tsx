import { useT } from '../i18n'
import { useProfile, subjectsFor } from '../state/profile'
import { subjectByCode } from '../data/catalog'
import { Ring } from '../components/ui/Ring'

const groupColor = (groups: string[], compulsory: boolean) =>
  compulsory ? 'rgb(var(--g-compulsory))'
    : groups.includes('science') ? 'rgb(var(--g-science))'
    : groups.includes('business') ? 'rgb(var(--g-business))'
    : groups.includes('humanities') ? 'rgb(var(--g-humanities))'
    : 'rgb(var(--accent))'

export default function Subjects() {
  const { t, lang } = useT()
  const profile = useProfile()
  if (!profile) return null
  const list = subjectsFor(profile)
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">{t('subjects.title')}</h1>
      <ul className="grid grid-cols-2 gap-3">
        {list.map(({ code, fourth }) => {
          const s = subjectByCode(code)!
          const mastery = 0
          return (
            <li key={code} className="card flex flex-col items-start gap-2 border-l-4" style={{ borderLeftColor: groupColor(s.groups, s.is_compulsory) }}>
              <Ring value={mastery} size={48} color={groupColor(s.groups, s.is_compulsory)} label={t('subjects.mastery', { n: mastery })} />
              <span className="font-semibold leading-snug">{lang === 'bn' ? s.name_bn : s.name_en}</span>
              {fourth && <span className="rounded-md bg-accent/20 px-2 text-sm">{t('subjects.fourth')}</span>}
            </li>
          )
        })}
      </ul>
      <p className="text-sm text-muted">{t('subjects.chaptersSoon')}</p>
    </div>
  )
}
