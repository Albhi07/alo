import { Link, useNavigate } from 'react-router-dom'
import { setLanguage, useT } from '../i18n'
import { Choice } from '../components/ui/Choice'
import { setDataSaver, setTheme, usePrefs, type Theme } from '../state/prefs'
import { useProfile } from '../state/profile'
import { signOut, useUserId } from '../state/auth'
import { useInstall } from '../hooks/useInstall'
import { subjectByCode, type Lang } from '../data/catalog'
import { db } from '../db'
import { supabaseConfigured } from '../lib/supabase'
import { DownloadsSection } from '../components/content/DownloadsSection'

export default function Settings() {
  const { t, lang } = useT()
  const prefs = usePrefs()
  const profile = useProfile()
  const userId = useUserId()
  const nav = useNavigate()
  const { installed, canInstall, install } = useInstall()

  const subj = (c?: string) => { const s = c ? subjectByCode(c) : undefined; return s ? (lang === 'bn' ? s.name_bn : s.name_en) : '' }

  async function reset() {
    if (!window.confirm(t('settings.resetConfirm'))) return
    await db.delete()
    localStorage.clear()
    location.replace(import.meta.env.BASE_URL)
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">{t('settings.title')}</h1>

      <Choice<Lang>
        legend={t('settings.language')} columns={2} value={lang}
        options={[{ value: 'bn', label: 'বাংলা' }, { value: 'en', label: 'English' }]}
        onChange={(v) => void setLanguage(v)}
      />

      <Choice<Theme>
        legend={t('settings.theme')} value={prefs.theme}
        options={[
          { value: 'light', label: t('settings.themeLight') },
          { value: 'dark', label: t('settings.themeDark') },
          { value: 'system', label: t('settings.themeSystem') },
        ]}
        onChange={setTheme}
      />

      <label className="card flex min-h-tap cursor-pointer items-center gap-4">
        <span className="flex-1">
          <span className="block font-semibold">{t('settings.dataSaver')}</span>
          <span className="block text-sm text-muted">{t('settings.dataSaverHint')}</span>
        </span>
        <input
          type="checkbox" role="switch" checked={prefs.dataSaver} onChange={(e) => setDataSaver(e.target.checked)}
          className="h-7 w-7 accent-[rgb(var(--accent))]"
        />
      </label>

      <DownloadsSection />

      {profile && (
        <section className="card flex flex-col gap-1" aria-labelledby="profile-h">
          <h2 id="profile-h" className="text-lg font-semibold">{t('settings.profile')}</h2>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
            <dt className="text-muted">{t('settings.medium')}</dt><dd>{profile.medium === 'bn' ? t('onb.mediumBn') : t('onb.mediumEn')}</dd>
            <dt className="text-muted">{t('settings.board')}</dt><dd>{t(`board.${profile.board}`)}</dd>
            <dt className="text-muted">{t('settings.group')}</dt><dd>{t(`group.${profile.group}`)}</dd>
            <dt className="text-muted">{t('settings.fourth')}</dt><dd>{subj(profile.fourth_subject_code)}</dd>
            <dt className="text-muted">{t('settings.dailyTarget')}</dt><dd>{t('onb.hours', { n: profile.daily_target_min / 60 })}</dd>
          </dl>
          <Link to="/onboarding" className="btn-ghost mt-2">{t('settings.editProfile')}</Link>
        </section>
      )}

      <section className="card flex flex-col gap-2" aria-labelledby="acct-h">
        <h2 id="acct-h" className="text-lg font-semibold">{t('settings.account')}</h2>
        <p>{userId ? t('auth.signedInAs') : t('auth.guestMode')}</p>
        {userId
          ? <button className="btn-ghost" onClick={async () => { await signOut(); nav('/') }}>{t('auth.signout')}</button>
          : supabaseConfigured && <Link className="btn-ghost" to="/signin">{t('welcome.signin')}</Link>}
      </section>

      <section className="card flex flex-col gap-2">
        <h2 className="text-lg font-semibold">{t('settings.install')}</h2>
        {installed ? <p>{t('settings.installed')}</p> : <p className="text-sm text-muted">{t('settings.installHint')}</p>}
        {canInstall && <button className="btn-primary" onClick={install}>{t('settings.install')}</button>}
      </section>

      {(profile?.role === 'admin' || !supabaseConfigured) && (
        <Link to="/admin" className="btn-ghost">{t('admin.open')}</Link>
      )}

      <button className="btn-link self-start text-danger" onClick={reset}>{t('settings.reset')}</button>
      <p className="text-sm text-muted">{t('settings.version', { v: __APP_VERSION__ })}</p>
    </div>
  )
}
