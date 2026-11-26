import { Link } from 'react-router-dom'
import { setLanguage, useT } from '../i18n'
import { GearIcon } from './icons'

export function Header({ showSettings = true }: { showSettings?: boolean }) {
  const { t, lang } = useT()
  const other = lang === 'bn' ? 'en' : 'bn'
  return (
    <header className="sticky top-0 z-20 bg-navy text-white">
      <div className="mx-auto flex h-14 max-w-xl items-center gap-2 px-4">
        <Link to="/" className="flex min-h-tap items-center gap-2 text-xl font-semibold" aria-label={t('app.name')}>
          <img src={`${import.meta.env.BASE_URL}icon.svg`} alt="" width="28" height="28" />
          <span>{t('app.name')}</span>
        </Link>
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => setLanguage(other)}
            className="min-h-tap min-w-tap rounded-xl px-3 font-semibold hover:bg-white/10"
            aria-label={t('lang.toggle')}
            lang={other}
          >
            {t('lang.short')}
          </button>
          {showSettings && (
            <Link to="/settings" className="flex min-h-tap min-w-tap items-center justify-center rounded-xl hover:bg-white/10" aria-label={t('nav.settings')}>
              <GearIcon />
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
