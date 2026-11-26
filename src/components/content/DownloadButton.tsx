import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../db'
import type { Medium } from '../../data/catalog'
import { useT } from '../../i18n'
import { useOnline } from '../../hooks/useOnline'
import { downloadChapter, removeChapter, requestPersistence, type DownloadProgress } from '../../content/offline'
import { formatBytes } from '../../lib/format'

/** "Download for offline" for one chapter: lessons, MCQ and CQ packs, narration, maths fonts. */
export function DownloadButton({ chapterId, medium }: { chapterId: string; medium: Medium }) {
  const { t, lang } = useT()
  const online = useOnline()
  const pack = useLiveQuery(() => db.c_packs.get(`${chapterId}.${medium}`), [chapterId, medium])
  const [progress, setProgress] = useState<DownloadProgress | null>(null)
  const [error, setError] = useState(false)
  const downloaded = !!pack?.pinned

  async function start() {
    setError(false)
    try {
      await requestPersistence()
      await downloadChapter(chapterId, medium, setProgress)
    } catch (e) {
      console.warn('download failed', e)
      setError(true)
    } finally {
      setProgress(null)
    }
  }

  if (downloaded) {
    const size = (pack.bytes ?? 0) + (pack.audio_bytes ?? 0)
    return (
      <div className="flex items-center gap-2 rounded-xl bg-ok/10 px-3 py-2">
        <p className="flex-1 text-sm"><strong>{t('download.done')}</strong> · {formatBytes(size, lang)}</p>
        <button className="btn-link text-sm text-danger" onClick={() => confirm(t('download.removeConfirm')) && removeChapter(chapterId, medium)}>{t('download.remove')}</button>
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-1">
      <button className="btn-ghost w-full" onClick={start} disabled={!online || !!progress}>
        {progress ? t('download.progress', { done: progress.done, total: progress.total }) : t('download.cta')}
      </button>
      {!online && <p className="text-sm text-muted">{t('net.needsOnline')}</p>}
      {error && <p role="alert" className="text-sm text-danger">{t('download.failed')}</p>}
    </div>
  )
}
