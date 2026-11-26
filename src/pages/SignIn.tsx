import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { useT } from '../i18n'
import { useOnline } from '../hooks/useOnline'
import { getSupabase, supabaseConfigured } from '../lib/supabase'
import { normaliseBdPhone } from '../state/auth'
import { adoptGuestRows } from '../db/sync'
import { db } from '../db'

type Mode = 'phone' | 'email'

export default function SignIn() {
  const { t } = useT()
  const online = useOnline()
  const nav = useNavigate()
  const [mode, setMode] = useState<Mode>('phone')
  const [value, setValue] = useState('')
  const [otp, setOtp] = useState('')
  const [phone, setPhone] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const disabled = !online || !supabaseConfigured

  async function send(e: FormEvent) {
    e.preventDefault()
    setError(null)
    const sb = await getSupabase()
    if (!sb) return
    if (mode === 'phone') {
      const p = normaliseBdPhone(value)
      if (!p) return setError(t('auth.invalidPhone'))
      setBusy(true)
      const { error } = await sb.auth.signInWithOtp({ phone: p })
      setBusy(false)
      if (error) return setError(t('auth.error'))
      setPhone(p)
      setSent(true)
    } else {
      if (!/^\S+@\S+\.\S+$/.test(value.trim())) return setError(t('auth.invalidEmail'))
      setBusy(true)
      const { error } = await sb.auth.signInWithOtp({ email: value.trim(), options: { emailRedirectTo: location.origin + import.meta.env.BASE_URL } })
      setBusy(false)
      if (error) return setError(t('auth.error'))
      setSent(true)
    }
  }

  async function verify(e: FormEvent) {
    e.preventDefault()
    const sb = await getSupabase()
    if (!sb || !phone) return
    setBusy(true)
    const { data, error } = await sb.auth.verifyOtp({ phone, token: otp.trim(), type: 'sms' })
    setBusy(false)
    if (error || !data.user) return setError(t('auth.error'))
    await adoptGuestRows(data.user.id)
    const hasProfile = await db.profiles.count()
    nav(hasProfile ? '/' : '/onboarding', { replace: true })
  }

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-semibold">{t('auth.title')}</h1>
      {!supabaseConfigured && <p className="card">{t('auth.notConfigured')}</p>}
      {supabaseConfigured && !online && <p className="card">{t('net.needsOnline')}</p>}

      <div role="tablist" className="grid grid-cols-2 gap-2 rounded-xl bg-line/50 p-1">
        {(['phone', 'email'] as Mode[]).map((m) => (
          <button
            key={m} role="tab" aria-selected={mode === m} type="button"
            className={clsx('min-h-tap rounded-lg font-semibold', mode === m ? 'bg-surface shadow' : 'text-muted')}
            onClick={() => { setMode(m); setSent(false); setError(null); setValue('') }}
          >
            {t(`auth.${m}`)}
          </button>
        ))}
      </div>

      {!sent && (
        <form onSubmit={send} className="flex flex-col gap-3" noValidate>
          <label className="label" htmlFor="ident">{mode === 'phone' ? t('auth.phoneLabel') : t('auth.emailLabel')}</label>
          <input
            id="ident" className="field" value={value} onChange={(e) => setValue(e.target.value)}
            type={mode === 'phone' ? 'tel' : 'email'} inputMode={mode === 'phone' ? 'numeric' : 'email'}
            autoComplete={mode === 'phone' ? 'tel' : 'email'} aria-describedby="ident-hint" disabled={disabled}
          />
          {mode === 'phone' && <p id="ident-hint" className="text-sm text-muted">{t('auth.phoneHint')}</p>}
          <button className="btn-primary" disabled={disabled || busy}>{mode === 'phone' ? t('auth.sendOtp') : t('auth.sendLink')}</button>
        </form>
      )}

      {sent && mode === 'email' && <p className="card" role="status">{t('auth.linkSent')}</p>}

      {sent && mode === 'phone' && (
        <form onSubmit={verify} className="flex flex-col gap-3">
          <p role="status">{t('auth.otpSent', { phone: value })}</p>
          <label className="label" htmlFor="otp">{t('auth.otpLabel')}</label>
          <input
            id="otp" className="field tracking-[0.4em]" value={otp} onChange={(e) => setOtp(e.target.value)}
            inputMode="numeric" autoComplete="one-time-code" maxLength={6}
          />
          <button className="btn-primary" disabled={busy || otp.trim().length < 6}>{t('auth.verify')}</button>
        </form>
      )}

      {error && <p role="alert" className="font-semibold text-danger">{error}</p>}
      <Link to="/welcome" className="btn-link self-start">{t('auth.back')}</Link>
    </div>
  )
}
