import { NavLink } from 'react-router-dom'
import clsx from 'clsx'
import { useT } from '../i18n'
import { HomeIcon, BookIcon, ExamIcon, FocusIcon, TutorIcon } from './icons'

const TABS = [
  { to: '/', key: 'home', Icon: HomeIcon, end: true },
  { to: '/subjects', key: 'subjects', Icon: BookIcon },
  { to: '/exam', key: 'exam', Icon: ExamIcon },
  { to: '/focus', key: 'focus', Icon: FocusIcon },
  { to: '/tutor', key: 'tutor', Icon: TutorIcon },
] as const

export function BottomNav() {
  const { t } = useT()
  return (
    <nav aria-label={t('nav.main')} className="safe-bottom fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface">
      <ul className="mx-auto grid max-w-xl grid-cols-5">
        {TABS.map(({ to, key, Icon, ...rest }) => (
          <li key={key}>
            <NavLink
              to={to}
              end={'end' in rest}
              className={({ isActive }) =>
                clsx(
                  'flex min-h-[60px] flex-col items-center justify-center gap-0.5 text-[13px] font-semibold',
                  isActive ? 'text-ink' : 'text-muted',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span className={clsx('rounded-full px-4 py-0.5', isActive && 'bg-accent/25')}><Icon /></span>
                  <span>{t(`nav.${key}`)}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
