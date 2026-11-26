import { Link } from 'react-router-dom'
import { useT } from '../i18n'
export default function NotFound() {
  const { t } = useT()
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">{t('notFound.title')}</h1>
      <Link className="btn-primary self-start" to="/">{t('notFound.home')}</Link>
    </div>
  )
}
