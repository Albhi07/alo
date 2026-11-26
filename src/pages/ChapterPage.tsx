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
import { McqOptions } from '../components/content/McqOptions'
import { Ring } from '../components/ui/Ring'
import { BOARDS } from '../data/catalog'
import type { QuestionRow } from '../data/content-types'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { drillTitle } from '../lib/drill'

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
  const mastery = useLiveQuery(async () => {
    if (!id) return 0
    const rows = await db.mastery.where('chapter_id').equals(id).toArray()
    return Number(rows.sort((a, b) => String(b.updated_at).localeCompare(String(a.updated_at)))[0]?.score ?? 0)
  }, [id], 0)

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
      {mastery > 0 && (
        <div className="flex items-center gap-3">
          <Ring value={mastery} size={44} stroke={5} label={t('subjects.mastery', { n: mastery })} />
          <p className="text-sm text-muted">{t('chapter.mastery', { n: mastery })}</p>
        </div>
      )}

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
            {mcqs.length > 0 && <Link to={`/practice/${chapter.id}`} className="btn-primary mt-2">{t('chapter.practise')}</Link>}
          </div>
        )}
        {tab === 'mcq' && content && content.drills.length > 0 && (
          <div className="card flex flex-col gap-2">
            <h2 className="text-lg font-semibold">{t('drill.title')}</h2>
            <p className="text-sm text-muted">{t('drill.intro')}</p>
            <ul className="flex flex-col gap-2">
              {content.drills.map((d) => (
                <li key={d.id}><Link to={`/drill/${d.id}`} className="btn-ghost w-full justify-start text-left">{drillTitle(d, lang)}</Link></li>
              ))}
            </ul>
          </div>
        )}

        {tab === 'cq' && cqs.map((q, i) => <CqCard key={q.id} q={q} index={i} />)}
        {tab === 'cq' && content && !empty && cqs.length === 0 && <p className="card text-muted">{t('chapter.noCq')}</p>}

        {tab === 'board' && content && !empty && (
          board.length === 0
            ? <p className="card text-muted">{t('chapter.noBoard')}</p>
            : <BoardBank questions={board} />
        )}

        {tab === 'notes' && content && content.sheets.length > 0 && (
          <button type="button" className="btn-ghost self-end no-print" onClick={() => window.print()}>{t('chapter.print')}</button>
        )}
        {tab === 'notes' && content?.sheets.map((s) => (
          <Rich key={s.id} text={s.body_md} mode="markdown" as="div" className="card prose-alo font-read print-sheet" />
        ))}
        {tab === 'notes' && content && !empty && content.sheets.length === 0 && <p className="card text-muted">{t('chapter.noNotes')}</p>}
      </div>
    </div>
  )
}

type BoardFilter = { board: string; year: string; kind: string }

/** Board questions with filters by board, year and type. */
function BoardBank({ questions }: { questions: QuestionRow[] }) {
  const { t, n } = useT()
  const [f, setF] = useState<BoardFilter>({ board: '', year: '', kind: '' })
  const years = useMemo(() => [...new Set(questions.map((q) => q.year).filter(Boolean) as number[])].sort((a, b) => b - a), [questions])
  const boards = useMemo(() => BOARDS.filter((b) => questions.some((q) => q.board === b)), [questions])
  const shown = questions
    .filter((q) => (!f.board || q.board === f.board) && (!f.year || String(q.year) === f.year) && (!f.kind || q.kind === f.kind))
    .sort((a, b) => (b.year ?? 0) - (a.year ?? 0))
  const set = (k: keyof BoardFilter) => (e: React.ChangeEvent<HTMLSelectElement>) => setF({ ...f, [k]: e.target.value })
  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        <label><span className="label">{t('chapter.filter.board')}</span>
          <select className="field px-2" value={f.board} onChange={set('board')}>
            <option value="">{t('chapter.filter.all')}</option>
            {boards.map((b) => <option key={b} value={b}>{t(`board.${b}`)}</option>)}
          </select>
        </label>
        <label><span className="label">{t('chapter.filter.year')}</span>
          <select className="field px-2" value={f.year} onChange={set('year')}>
            <option value="">{t('chapter.filter.all')}</option>
            {years.map((y) => <option key={y} value={y}>{n(y)}</option>)}
          </select>
        </label>
        <label><span className="label">{t('chapter.filter.type')}</span>
          <select className="field px-2" value={f.kind} onChange={set('kind')}>
            <option value="">{t('chapter.filter.all')}</option>
            <option value="mcq">{t('chapter.tab.mcq')}</option>
            <option value="cq">{t('chapter.tab.cq')}</option>
          </select>
        </label>
      </div>
      <p className="text-sm text-muted" aria-live="polite">{t('chapter.boardN', { count: shown.length })}</p>
      {shown.map((q, i) => q.kind === 'cq'
        ? <div key={q.id} className="flex flex-col gap-1"><BoardTag q={q} /><CqCard q={q} index={i} /></div>
        : <BoardMcq key={q.id} q={q} />)}
    </>
  )
}

function BoardTag({ q }: { q: QuestionRow }) {
  const { t, n } = useT()
  return <p className="text-sm font-semibold text-muted">{q.board ? t(`board.${q.board}`) : ''}{q.year ? ` · ${n(q.year)}` : ''}</p>
}

function BoardMcq({ q }: { q: QuestionRow }) {
  const [chosen, setChosen] = useState<number | null>(null)
  if (!q.options_json) return null
  return (
    <article className="card flex flex-col gap-2">
      <BoardTag q={q} />
      {q.options_json.context && <Rich text={q.options_json.context} mode="blocks" as="div" className="rounded-xl bg-bg p-3 font-read" />}
      <Rich text={q.stem} mode="blocks" as="div" className="font-read font-semibold" />
      <McqOptions options={q.options_json.options} answer={(q.answer_json as { index: number }).index} chosen={chosen} onChoose={setChosen} explanation={q.explanation} />
    </article>
  )
}
