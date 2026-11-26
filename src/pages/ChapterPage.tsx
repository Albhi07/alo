import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useT } from '../i18n'
import { subjectByCode } from '../data/catalog'
import { ensureChapter, useChapter, useChapterContent } from '../content/repo'
import { useProfile } from '../state/profile'
import { useOnline } from '../hooks/useOnline'
import { Tabs } from '../components/ui/Tabs'
import { BackIcon } from '../components/icons'
import { CqCard } from '../components/content/CqCard'
import { Rich } from '../components/content/Rich'
import { DownloadButton } from '../components/content/DownloadButton'

const TABS = ['learn', 'mcq', 'cq', 'board', 'notes'] as const
type Tab = (typeof TABS)[number]

export default function ChapterPage() {
  const { id } = useParams()
  const { t, lang, n } = useT()
  const online = useOnline()
  const profile = useProfile()
  const medium = profile?.medium ?? 'bn'
  const chapter = useChapter(id)
  const content = useChapterContent(id, medium)
  const [params, setParams] = useSearchParams()
  const tab = (TABS as readonly string[]).includes(params.get('tab') ?? '') ? (params.get('tab') as Tab) : 'learn'
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoadError(false)
    ensureChapter(id, medium).catch(() => setLoadError(true))
  }, [id, medium, online])

  const mcqs = useMemo(() => content?.questions.filter((q) => q.kind === 'mcq' && q.source === 'original') ?? [], [content])
  const cqs = useMemo(() => content?.questions.filter((q) => q.kind === 'cq' && q.source === 'original') ?? [], [content])
  const board = useMemo(() => content?.questions.filter((q) => q.source === 'board') ?? [], [content])

  if (chapter === undefined) return <p className="text-muted">{t('common.loading')}</p>
  if (!chapter) return <p>{t('notFound.title')}</p>
  const subject = subjectByCode(chapter.subject_code)
  const empty = content && !content.pack && !content.lessons.length && !content.questions.length
  const subtypeCount = (st: string) => mcqs.filter((q) => q.subtype === st).length

  return (
    <div className="flex flex-col gap-4">
      <Link to={`/subjects/${chapter.subject_code}`} className="btn-link -ml-2 self-start">
        <BackIcon />{subject ? (lang === 'bn' ? subject.name_bn : subject.name_en) : ''}
      </Link>
      <div>
        <p className="text-sm text-muted">{t('chapter.number', { n: chapter.number })}</p>
        <h1 className="text-2xl font-semibold leading-tight">{lang === 'bn' ? chapter.title_bn : chapter.title_en}</h1>
        {chapter.board_freq_5y > 0 && <p className="mt-1 text-sm font-semibold">{t('chapter.asked', { count: chapter.board_freq_5y })}</p>}
      </div>

      {content && !empty && <DownloadButton chapterId={chapter.id} medium={medium} />}

      <Tabs<Tab>
        label={t('chapter.sections')}
        tabs={TABS.map((id) => ({ id, label: t(`chapter.tab.${id}`) }))}
        value={tab}
        onChange={(v) => setParams({ tab: v }, { replace: true })}
      />

      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="flex flex-col gap-3">
        {empty && (
          <p className="card text-muted">{!online ? t('chapter.offlineNotDownloaded') : loadError ? t('auth.error') : t('chapter.contentSoon')}</p>
        )}

        {tab === 'learn' && content?.lessons.map((l) => (
          <div key={l.id} className="card flex items-center gap-3">
            <div className="flex-1">
              <p className="font-semibold leading-snug">{lang === 'bn' ? l.title_bn : l.title_en}</p>
              <p className="text-sm text-muted">{t('chapter.minutes', { n: Math.max(1, Math.round(l.duration_s / 60)) })}</p>
            </div>
            <Link to={`/lessons/${l.id}`} className="btn-primary">{t('chapter.start')}</Link>
          </div>
        ))}
        {tab === 'learn' && content && !empty && content.lessons.length === 0 && <p className="card text-muted">{t('chapter.noLessons')}</p>}

        {tab === 'mcq' && content && !empty && (
          <div className="card flex flex-col gap-2">
            <p className="text-lg font-semibold">{t('chapter.mcqN', { count: mcqs.length })}</p>
            <ul className="text-sm text-muted">
              <li>{t('mcq.single')}: {n(subtypeCount('single'))}</li>
              <li>{t('mcq.multi')}: {n(subtypeCount('multi_completion'))}</li>
              <li>{t('mcq.situation')}: {n(subtypeCount('situation'))}</li>
            </ul>
            <Link to={`/practice/${chapter.id}`} className="btn-primary mt-2" aria-disabled={!mcqs.length}>{t('chapter.practise')}</Link>
          </div>
        )}

        {tab === 'cq' && cqs.map((q, i) => <CqCard key={q.id} q={q} index={i} />)}
        {tab === 'cq' && content && !empty && cqs.length === 0 && <p className="card text-muted">{t('chapter.noCq')}</p>}

        {tab === 'board' && content && !empty && (
          board.length === 0
            ? <p className="card text-muted">{t('chapter.noBoard')}</p>
            : <p className="card">{t('chapter.boardN', { count: board.length })}</p>
        )}

        {tab === 'notes' && content?.sheets.map((s) => (
          <Rich key={s.id} text={s.body_md} mode="markdown" as="div" className="card prose-alo font-read" />
        ))}
        {tab === 'notes' && content && !empty && content.sheets.length === 0 && <p className="card text-muted">{t('chapter.noNotes')}</p>}
      </div>
    </div>
  )
}
