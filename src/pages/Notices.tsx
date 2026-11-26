import { useT } from '../i18n'
import { useNotices } from '../state/notices'
import { Rich } from '../components/content/Rich'
import { PushToggle } from '../components/PushToggle'

export default function Notices() {
  const { t, lang, date } = useT()
  const notices = useNotices()
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">{t('notices.title')}</h1>
      <PushToggle />
      {notices?.length === 0 && <p className="card text-muted">{t('notices.none')}</p>}
      {notices?.map((n) => (
        <article key={n.id} className="card flex flex-col gap-1">
          <div className="flex items-start justify-between gap-2">
            <h2 className="font-semibold leading-snug">{lang === 'bn' ? n.title_bn : n.title_en}</h2>
            <span className={n.verified ? 'shrink-0 rounded-lg bg-ok/15 px-2 py-0.5 text-xs font-semibold' : 'shrink-0 rounded-lg bg-accent/20 px-2 py-0.5 text-xs font-semibold'}>
              {n.verified ? t('notices.verified') : t('exam.unverified')}
            </span>
          </div>
          {n.event_date && <p className="font-semibold">{date(n.event_date, { weekday: true })}</p>}
          {n.body && <Rich text={n.body} mode="markdown" as="div" className="text-sm" />}
          <p className="text-xs text-muted">
            {n.last_checked && t('notices.checked', { date: date(n.last_checked.slice(0, 10)) })}
            {n.source_url && <> · <a href={n.source_url} target="_blank" rel="noreferrer" className="underline">{t('notices.source')}</a></>}
          </p>
        </article>
      ))}
    </div>
  )
}
