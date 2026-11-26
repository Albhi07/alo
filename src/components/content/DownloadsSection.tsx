import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Link } from 'react-router-dom'
import { db } from '../../db'
import { useT } from '../../i18n'
import { removeChapter, storageEstimate, useDownloads } from '../../content/offline'
import { formatBytes } from '../../lib/format'

/** Storage meter plus the list of downloaded chapters, each with a delete button. */
export function DownloadsSection() {
  const { t, lang } = useT()
  const downloads = useDownloads()
  const chapters = useLiveQuery(async () => new Map((await db.c_chapters.toArray()).map((c) => [c.id, c])), [], new Map())
  const [est, setEst] = useState<{ usage: number; quota: number } | null>(null)
  useEffect(() => { storageEstimate().then(setEst) }, [downloads.length])
  const total = downloads.reduce((s, d) => s + d.bytes + (d.audio_bytes ?? 0), 0)
  const pct = est && est.quota ? Math.min(100, (est.usage / est.quota) * 100) : 0

  return (
    <section className="card flex flex-col gap-3" aria-labelledby="dl-h">
      <h2 id="dl-h" className="text-lg font-semibold">{t('download.title')}</h2>
      <p>{t('download.total', { size: formatBytes(total, lang), count: downloads.length })}</p>
      {est && (
        <div>
          <div className="h-3 rounded-full bg-line" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)} aria-label={t('download.meter')}>
            <div className="h-3 rounded-full bg-accent" style={{ width: `${Math.max(pct, 1)}%` }} />
          </div>
          <p className="mt-1 text-sm text-muted">{t('download.used', { used: formatBytes(est.usage, lang), free: formatBytes(Math.max(0, est.quota - est.usage), lang) })}</p>
        </div>
      )}
      {downloads.length === 0 && <p className="text-sm text-muted">{t('download.none')}</p>}
      <ul className="flex flex-col gap-2">
        {downloads.map((d) => {
          const c = chapters.get(d.chapter_id)
          return (
            <li key={d.key} className="flex items-center gap-2">
              <Link to={`/chapters/${d.chapter_id}`} className="flex-1 leading-snug">
                <span className="block font-semibold">{c ? (lang === 'bn' ? c.title_bn : c.title_en) : d.chapter_id}</span>
                <span className="text-sm text-muted">{formatBytes(d.bytes + (d.audio_bytes ?? 0), lang)}</span>
              </Link>
              <button className="btn-link text-sm text-danger" onClick={() => confirm(t('download.removeConfirm')) && removeChapter(d.chapter_id, d.medium)}>{t('download.remove')}</button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
