import { useState } from 'react'
import { useT } from '../i18n'
import { weekday } from '../lib/days'

const SHORT = { bn: ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি'], en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] }

/**
 * Focus minutes for the last 7 days: one series, so one colour and no legend (the heading
 * names it). Thin bars with 4px rounded tops on a baseline, a recessive target line, a
 * label on today's bar only, a tap/hover tooltip per bar and a table for screen readers.
 */
export function WeekChart({ week, target }: { week: { date: string; minutes: number }[]; target: number }) {
  const { t, n, date, lang } = useT()
  const [hover, setHover] = useState<number | null>(null)
  const W = 320, H = 140, top = 18, bottom = 22
  const max = Math.max(target, ...week.map((d) => d.minutes), 30)
  const y = (m: number) => H - bottom - ((H - bottom - top) * m) / max
  const slot = W / week.length
  const bw = Math.min(24, slot * 0.45)
  const hrs = (m: number) => t('focus.hoursShort', { h: n((m / 60).toFixed(1)) })
  return (
    <figure className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" aria-hidden="true">
        <line x1={0} x2={W} y1={H - bottom} y2={H - bottom} stroke="rgb(var(--line))" strokeWidth={1} />
        <line x1={0} x2={W} y1={y(target)} y2={y(target)} stroke="rgb(var(--muted))" strokeWidth={1} strokeDasharray="3 4" opacity={0.6} />
        {week.map((d, i) => {
          const cx = slot * i + slot / 2
          const h = H - bottom - y(d.minutes)
          const today = i === week.length - 1
          return (
            <g key={d.date} onPointerEnter={() => setHover(i)} onPointerLeave={() => setHover(null)} onClick={() => setHover(hover === i ? null : i)}>
              <rect x={cx - slot / 2} y={0} width={slot} height={H} fill="transparent" />
              {d.minutes > 0 && (
                <path
                  d={`M${cx - bw / 2},${H - bottom} V${H - bottom - h + Math.min(4, h)} q0,-${Math.min(4, h)} ${Math.min(4, h)},-${Math.min(4, h)} H${cx + bw / 2 - Math.min(4, h)} q${Math.min(4, h)},0 ${Math.min(4, h)},${Math.min(4, h)} V${H - bottom} Z`}
                  fill="rgb(var(--accent))" opacity={hover === null || hover === i ? 1 : 0.55}
                />
              )}
              {today && d.minutes > 0 && <text x={cx} y={y(d.minutes) - 5} textAnchor="middle" fontSize={11} fill="rgb(var(--ink))">{hrs(d.minutes)}</text>}
              <text x={cx} y={H - 6} textAnchor="middle" fontSize={11} fill="rgb(var(--muted))" fontWeight={today ? 600 : 400}>{SHORT[lang][weekday(d.date)]}</text>
            </g>
          )
        })}
      </svg>
      {hover !== null && (
        <div className="pointer-events-none absolute -top-2 rounded-lg bg-navy px-2 py-1 text-xs text-white shadow"
          style={{ left: `clamp(0px, calc(${((hover + 0.5) / week.length) * 100}% - 48px), calc(100% - 96px))` }}>
          {date(week[hover].date)}: {t('focus.minutesN', { n: n(week[hover].minutes) })}
        </div>
      )}
      <figcaption className="mt-1 text-xs text-muted">{t('focus.targetLine', { h: n((target / 60).toFixed(1)) })}</figcaption>
      <table className="sr-only">
        <caption>{t('focus.week')}</caption>
        <tbody>{week.map((d) => <tr key={d.date}><th scope="row">{date(d.date)}</th><td>{t('focus.minutesN', { n: n(d.minutes) })}</td></tr>)}</tbody>
      </table>
    </figure>
  )
}
