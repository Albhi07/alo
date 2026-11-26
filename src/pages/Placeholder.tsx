import { useT } from '../i18n'
import { useOnline } from '../hooks/useOnline'

export default function Placeholder({ section, needsOnline }: { section: 'exam' | 'focus' | 'tutor'; needsOnline?: boolean }) {
  const { t } = useT()
  const online = useOnline()
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">{t(`${section}.title`)}</h1>
      {needsOnline && !online && <p className="card border-accent" role="status">{t('net.needsOnline')}</p>}
      <p className="card text-muted">{t(`${section}.soon`)}</p>
    </div>
  )
}
