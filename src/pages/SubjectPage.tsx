import { Link, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { useT } from '../i18n'
import { subjectByCode } from '../data/catalog'
import { useChapters, usePackInfo } from '../content/repo'
import { useProfile } from '../state/profile'
import { Ring } from '../components/ui/Ring'
import { BackIcon } from '../components/icons'
import { db } from '../db'
import { groupColor } from './Subjects'

export default function SubjectPage() {
  const { code } = useParams()
  const { t, lang, n } = useT()
  const profile = useProfile()
  const chapters = useChapters(code)
  const packs = usePackInfo()
  const mastery = useLiveQuery(async () => new Map((await db.mastery.toArray()).map((m) => [m.chapter_id as string, Number(m.score) || 0])), [], new Map())
  const s = code ? subjectByCode(code) : undefined
  if (!s) return <p>{t('notFound.title')}</p>
  const medium = profile?.medium ?? 'bn'
  const color = groupColor(s)

  return (
    <div className="flex flex-col gap-4">
      <Link to="/subjects" className="btn-link -ml-2 self-start"><BackIcon />{t('subjects.title')}</Link>
      <h1 className="text-2xl font-semibold">{lang === 'bn' ? s.name_bn : s.name_en}</h1>
      {chapters === undefined ? <p className="text-muted">{t('common.loading')}</p>
        : chapters.length === 0 ? <p className="card text-muted">{t('subjects.chaptersSoon')}</p>
        : (
          <ol className="flex flex-col gap-2">
            {chapters.map((c) => {
              const info = packs[c.id]?.[medium]
              const m = mastery.get(c.id) ?? 0
              return (
                <li key={c.id}>
                  <Link to={`/chapters/${c.id}`} className="card flex items-center gap-3 hover:border-muted">
                    <Ring value={m} size={40} stroke={5} color={color} label={t('subjects.mastery', { n: m })} />
                    <span className="flex-1">
                      <span className="block text-sm text-muted">{t('chapter.number', { n: c.number })}</span>
                      <span className="block font-semibold leading-snug">{lang === 'bn' ? c.title_bn : c.title_en}</span>
                      <span className="mt-1 flex flex-wrap gap-x-3 text-sm text-muted">
                        {info?.lessons ? <span>{t('chapter.lessonsN', { count: info.lessons })}</span> : null}
                        {info?.mcq ? <span>{t('chapter.mcqN', { count: info.mcq })}</span> : null}
                        {c.board_freq_5y > 0 && <span className="font-semibold text-ink">{t('chapter.asked', { count: c.board_freq_5y })}</span>}
                        {!info && <span>{t('chapter.contentSoon')}</span>}
                      </span>
                    </span>
                    <span aria-hidden className="text-muted">{n('›')}</span>
                  </Link>
                </li>
              )
            })}
          </ol>
        )}
    </div>
  )
}
