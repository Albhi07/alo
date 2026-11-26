import { Link, useNavigate } from 'react-router-dom'
import { useT } from '../i18n'

export default function Welcome() {
  const { t } = useT()
  const nav = useNavigate()
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-3 pt-4 text-center">
        <img src={`${import.meta.env.BASE_URL}icon.svg`} alt="" width="88" height="88" />
        <p className="text-lg font-semibold text-muted">{t('app.tagline')}</p>
        <h1 className="text-[26px] font-semibold leading-tight">{t('welcome.title')}</h1>
        <p className="text-muted">{t('welcome.body')}</p>
      </div>
      <div className="flex flex-col gap-3">
        <button className="btn-primary text-lg" onClick={() => nav('/onboarding')}>{t('welcome.guest')}</button>
        <p className="text-center text-sm text-muted">{t('welcome.guestNote')}</p>
        <Link to="/signin" className="btn-ghost">{t('welcome.signin')}</Link>
      </div>
    </div>
  )
}
