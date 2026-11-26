import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useT } from '../../i18n'
import { OnlineGate } from '../../components/OnlineGate'
import { useAllChapters, useMockList } from '../../content/repo'
import { subjectByCode } from '../../data/catalog'
import { chapterAverages, masteryGrid, toCsv } from '../../lib/summary'
import {
  addAssignment, classAssignments, classOverview, deleteClass, removeAssignment, removeMember, teacherClasses,
  type Assignment, type ClassOverview, type ConnectError, type TeacherClass,
} from '../../state/connect'
import { AssignmentList } from './Connect'

export default function TeacherClassPage() {
  const { t } = useT()
  return (
    <div className="flex flex-col gap-4">
      <Link to="/teacher" className="btn-link self-start px-0 text-sm">← {t('people.allClasses')}</Link>
      <OnlineGate><Dashboard /></OnlineGate>
    </div>
  )
}

function download(name: string, csv: string) {
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url; a.download = name
  document.body.appendChild(a); a.click(); a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function Dashboard() {
  const { id = '' } = useParams()
  const { t, lang, n, date } = useT()
  const nav = useNavigate()
  const chapters = useAllChapters()
  const mocks = useMockList()
  const [cls, setCls] = useState<TeacherClass | null>(null)
  const [ov, setOv] = useState<ClassOverview | null>(null)
  const [asg, setAsg] = useState<Assignment[]>([])
  const [err, setErr] = useState<ConnectError | null>(null)
  const [subject, setSubject] = useState('')

  const load = useCallback(async () => {
    const [c, o, a] = await Promise.all([teacherClasses(), classOverview(id), classAssignments(id)])
    if ('data' in c) setCls(c.data.find((x) => x.id === id) ?? null)
    if ('data' in o) setOv(o.data); else setErr(o.error)
    if ('data' in a) setAsg(a.data)
  }, [id])
  useEffect(() => { void load() }, [load])

  const subjName = (code: string) => { const s = subjectByCode(code); return s ? (lang === 'bn' ? s.name_bn : s.name_en) : code }
  // Subjects that have chapters in the app, most-practised first for this class.
  const subjects = useMemo(() => {
    const touched = new Map<string, number>()
    for (const m of ov?.mastery ?? []) { const c = chapters?.find((x) => x.id === m.chapter_id); if (c) touched.set(c.subject_code, (touched.get(c.subject_code) ?? 0) + 1) }
    const all = [...new Set((chapters ?? []).map((c) => c.subject_code))]
    return all.sort((a, b) => (touched.get(b) ?? 0) - (touched.get(a) ?? 0) || a.localeCompare(b))
  }, [chapters, ov])
  const subj = subject || subjects[0] || ''
  const chs = useMemo(() => (chapters ?? []).filter((c) => c.subject_code === subj).sort((a, b) => a.sort - b.sort), [chapters, subj])

  if (err) return <p className="card" role="alert">{t(`people.err.${err}`)}</p>
  if (!ov) return <p className="text-muted">{t('common.loading')}</p>
  const members = ov.members
  const grid = masteryGrid(members, chs, ov.mastery)
  const avgs = chapterAverages(grid, chs.length)
  const nick = (uid: string) => members.find((m) => m.user_id === uid)?.nickname ?? '—'
  const chTitle = (c: { title_bn: string; title_en: string }) => (lang === 'bn' ? c.title_bn : c.title_en)
  const mockTitle = (mid: string | null) => mocks?.find((m) => m.id === mid)?.title ?? '—'

  const exportMastery = () => download(`alo-class-mastery-${subj}-${new Date().toISOString().slice(0, 10)}.csv`, toCsv([
    ['nickname', ...chs.map((c) => `${c.number}. ${c.title_en}`)],
    ...members.map((m, i) => [m.nickname ?? '', ...grid[i]]),
  ]))
  const exportMocks = () => download(`alo-class-mocks-${new Date().toISOString().slice(0, 10)}.csv`, toCsv([
    ['nickname', 'subject', 'mock', 'mcq', 'cq', 'total', 'submitted_at'],
    ...ov.mocks.map((r) => [nick(r.user_id), r.subject_code, mockTitle(r.mock_id), r.mcq_score, r.cq_score, r.total, r.submitted_at]),
  ]))

  return (
    <>
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">{cls?.name}</h1>
        {cls && <p>{t('people.shareCode')} <span className="select-all font-mono text-xl font-semibold tracking-widest">{cls.join_code}</span></p>}
        <p className="text-sm text-muted">{t('people.memberCount', { count: members.length })}</p>
      </div>

      <section className="card flex flex-col gap-3" aria-labelledby="heat-h">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="heat-h" className="text-lg font-semibold">{t('people.heatmap')}</h2>
          <select className="field w-auto" aria-label={t('people.subject')} value={subj} onChange={(e) => setSubject(e.target.value)}>
            {subjects.map((s) => <option key={s} value={s}>{subjName(s)}</option>)}
          </select>
        </div>
        {members.length && chs.length ? (
          <div className="-mx-2 overflow-x-auto px-2">
            <table className="border-separate border-spacing-1 text-sm">
              <caption className="sr-only">{t('people.heatmapCaption', { subject: subjName(subj) })}</caption>
              <thead>
                <tr>
                  <th scope="col" className="sticky left-0 bg-surface text-left">{t('people.student')}</th>
                  {chs.map((c) => <th key={c.id} scope="col" className="min-w-10 text-center font-semibold" title={chTitle(c)}><abbr title={chTitle(c)} className="no-underline">{n(c.number)}</abbr></th>)}
                </tr>
              </thead>
              <tbody>
                {members.map((m, i) => (
                  <tr key={m.user_id}>
                    <th scope="row" className="sticky left-0 max-w-28 truncate bg-surface pr-2 text-left font-normal">{m.nickname}</th>
                    {grid[i].map((v, j) => <HeatCell key={chs[j].id} v={v} />)}
                  </tr>
                ))}
                <tr>
                  <th scope="row" className="sticky left-0 bg-surface pr-2 text-left">{t('people.classAvg')}</th>
                  {avgs.map((v, j) => <HeatCell key={chs[j].id} v={v} bold />)}
                </tr>
              </tbody>
            </table>
          </div>
        ) : <p className="text-sm text-muted">{members.length ? t('people.noChapters') : t('people.noMembers')}</p>}
        <p className="text-xs text-muted">{t('people.heatLegend')}</p>
        <button className="btn-ghost self-start" disabled={!members.length || !chs.length} onClick={exportMastery}>{t('people.exportCsv')}</button>
      </section>

      <section className="card flex flex-col gap-3" aria-labelledby="mock-h">
        <h2 id="mock-h" className="text-lg font-semibold">{t('people.mockResults')}</h2>
        {ov.mocks.length ? (
          <div className="-mx-2 overflow-x-auto px-2">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-muted"><th scope="col">{t('people.student')}</th><th scope="col">{t('people.mock')}</th><th scope="col" className="text-right">{t('people.total')}</th><th scope="col" className="text-right">{t('people.date')}</th></tr></thead>
              <tbody>
                {ov.mocks.slice(0, 50).map((r, i) => (
                  <tr key={i} className="border-t border-line">
                    <td className="py-1 pr-2">{nick(r.user_id)}</td>
                    <td className="py-1 pr-2">{mockTitle(r.mock_id)}</td>
                    <td className="py-1 text-right tabular-nums">{r.total === null ? '–' : n(Math.round(Number(r.total)))}</td>
                    <td className="py-1 pl-2 text-right text-muted">{date(r.submitted_at.slice(0, 10))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="text-sm text-muted">{t('people.noMocks')}</p>}
        <button className="btn-ghost self-start" disabled={!ov.mocks.length} onClick={exportMocks}>{t('people.exportCsv')}</button>
      </section>

      <section className="card flex flex-col gap-3" aria-labelledby="asg-h">
        <h2 id="asg-h" className="text-lg font-semibold">{t('people.assignments')}</h2>
        <AssignmentList items={asg} />
        {asg.length > 0 && (
          <details>
            <summary className="cursor-pointer text-sm">{t('people.removeAssignment')}</summary>
            <ul className="mt-2 flex flex-col gap-1">
              {asg.map((a) => (
                <li key={a.id}><button className="btn-link text-sm" onClick={async () => { const e = await removeAssignment(a.id); if (e) setErr(e); else void load() }}>
                  ✕ {a.kind === 'chapter' ? chTitle(chapters?.find((c) => c.id === a.ref_id) ?? { title_bn: '?', title_en: '?' }) : mockTitle(a.ref_id)}
                </button></li>
              ))}
            </ul>
          </details>
        )}
        <AddAssignment classId={id} subjects={subjects} onAdded={load} />
      </section>

      <section className="card flex flex-col gap-2" aria-labelledby="mem-h">
        <h2 id="mem-h" className="text-lg font-semibold">{t('people.members')}</h2>
        {members.length ? (
          <ul className="flex flex-col gap-1">
            {members.map((m) => {
              const s = ov.summaries[m.user_id]
              return (
                <li key={m.user_id} className="flex items-center justify-between gap-2 text-sm">
                  <span>{m.nickname}{s ? ` · ${t('home.streakDays', { count: s.streak })}` : ''}</span>
                  <button className="btn-link text-sm" onClick={async () => { const e = await removeMember(id, m.user_id); if (e) setErr(e); else void load() }}>{t('people.remove')}</button>
                </li>
              )
            })}
          </ul>
        ) : <p className="text-sm text-muted">{t('people.noMembers')}</p>}
      </section>

      <button className="btn-ghost self-start text-danger" onClick={async () => {
        if (!window.confirm(t('people.deleteConfirm'))) return
        const e = await deleteClass(id)
        if (e) setErr(e); else nav('/teacher', { replace: true })
      }}>{t('people.deleteClass')}</button>
    </>
  )
}

/** Mastery cell: shade by band, with the number written in it (colour is never the only cue). */
function HeatCell({ v, bold }: { v: number | null; bold?: boolean }) {
  const { n } = useT()
  const band = v === null ? 'bg-line/40 text-muted' : v >= 80 ? 'bg-ok/30' : v >= 50 ? 'bg-accent/30' : 'bg-danger/20'
  return <td className={`h-9 min-w-10 rounded text-center tabular-nums ${band} ${bold ? 'font-semibold' : ''}`}>{v === null ? '·' : n(v)}</td>
}

function AddAssignment({ classId, subjects, onAdded }: { classId: string; subjects: string[]; onAdded: () => void }) {
  const { t, lang, n } = useT()
  const chapters = useAllChapters()
  const mocks = useMockList()
  const [kind, setKind] = useState<'chapter' | 'mock'>('chapter')
  const [subj, setSubj] = useState('')
  const [ref, setRef] = useState('')
  const [due, setDue] = useState('')
  const [err, setErr] = useState<ConnectError | null>(null)
  const s = subj || subjects[0] || ''
  const subjName = (code: string) => { const x = subjectByCode(code); return x ? (lang === 'bn' ? x.name_bn : x.name_en) : code }
  const options = kind === 'chapter'
    ? (chapters ?? []).filter((c) => c.subject_code === s).sort((a, b) => a.sort - b.sort).map((c) => ({ id: c.id, label: `${n(c.number)}. ${lang === 'bn' ? c.title_bn : c.title_en}` }))
    : (mocks ?? []).filter((m) => m.subject_code === s).map((m) => ({ id: m.id, label: m.title }))
  const add = async (e: FormEvent) => {
    e.preventDefault()
    const r = ref || options[0]?.id
    if (!r) return
    const er = await addAssignment({ class_id: classId, kind, ref_id: r, due_on: due || null })
    setErr(er)
    if (!er) { setRef(''); setDue(''); onAdded() }
  }
  return (
    <form className="flex flex-col gap-2 border-t border-line pt-3" onSubmit={(e) => void add(e)}>
      <h3 className="font-semibold">{t('people.addAssignment')}</h3>
      <div className="grid grid-cols-2 gap-2">
        <label><span className="label">{t('people.type')}</span>
          <select className="field" value={kind} onChange={(e) => { setKind(e.target.value as 'chapter' | 'mock'); setRef('') }}>
            <option value="chapter">{t('people.kind.chapter')}</option><option value="mock">{t('people.kind.mock')}</option>
          </select>
        </label>
        <label><span className="label">{t('people.subject')}</span>
          <select className="field" value={s} onChange={(e) => { setSubj(e.target.value); setRef('') }}>
            {subjects.map((c) => <option key={c} value={c}>{subjName(c)}</option>)}
          </select>
        </label>
      </div>
      <label><span className="label">{kind === 'chapter' ? t('people.kind.chapter') : t('people.kind.mock')}</span>
        <select className="field" value={ref || options[0]?.id || ''} onChange={(e) => setRef(e.target.value)} disabled={!options.length}>
          {options.length ? options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>) : <option value="">{t('people.nothingToAssign')}</option>}
        </select>
      </label>
      <label><span className="label">{t('people.dueDate')}</span>
        <input type="date" className="field" value={due} onChange={(e) => setDue(e.target.value)} />
      </label>
      <button className="btn-primary" disabled={!options.length}>{t('people.assign')}</button>
      {err && <p className="text-sm font-semibold text-danger" role="alert">{t(`people.err.${err}`)}</p>}
    </form>
  )
}
