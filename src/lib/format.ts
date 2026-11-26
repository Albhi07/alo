import type { Lang } from '../data/catalog'

const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯']
const BN_MONTHS = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর']
const EN_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const BN_WEEKDAYS = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার']
const EN_WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

/** Replace Western digits with Bangla digits (০-৯). Leaves every other character alone. */
export function toBnDigits(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => BN_DIGITS[+d])
}

/** Replace Bangla digits with Western digits, for parsing user input. */
export function fromBnDigits(input: string): string {
  return input.replace(/[০-৯]/g, (d) => String(BN_DIGITS.indexOf(d)))
}

export function digits(input: string | number, lang: Lang): string {
  return lang === 'bn' ? toBnDigits(input) : String(input)
}

/** Format a number with grouping. Bangladesh uses lakh grouping (12,34,567). */
export function formatNumber(n: number, lang: Lang, maxFractionDigits = 0): string {
  const s = new Intl.NumberFormat('en-IN', { maximumFractionDigits: maxFractionDigits }).format(n)
  return digits(s, lang)
}

/** Parse "YYYY-MM-DD" as a local calendar date (no timezone shift). */
export function parseDay(iso: string): Date {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** "১৪ মার্চ ২০২৭" / "14 March 2027" (Gregorian, Bangla month names). */
export function formatDate(date: Date | string, lang: Lang, opts: { year?: boolean; weekday?: boolean } = {}): string {
  const d = typeof date === 'string' ? parseDay(date) : date
  const months = lang === 'bn' ? BN_MONTHS : EN_MONTHS
  const parts = [digits(d.getDate(), lang), months[d.getMonth()]]
  if (opts.year !== false) parts.push(digits(d.getFullYear(), lang))
  let s = parts.join(' ')
  if (opts.weekday) s = `${(lang === 'bn' ? BN_WEEKDAYS : EN_WEEKDAYS)[d.getDay()]}, ${s}`
  return s
}

/** "০৫:০৯" style clock for timers; adds hours when needed ("১:০৫:০৯"). */
export function formatClock(totalSeconds: number, lang: Lang): string {
  const t = Math.max(0, Math.floor(totalSeconds))
  const h = Math.floor(t / 3600)
  const m = Math.floor((t % 3600) / 60)
  const s = t % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  const str = h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
  return digits(str, lang)
}

/** Whole days from `from` (local midnight) to `to` (local midnight). */
export function daysBetween(from: Date, to: Date): number {
  const a = new Date(from.getFullYear(), from.getMonth(), from.getDate()).getTime()
  const b = new Date(to.getFullYear(), to.getMonth(), to.getDate()).getTime()
  return Math.round((b - a) / 86_400_000)
}

export function todayIso(now = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

/** "1.2 MB" / "১.২ MB" */
export function formatBytes(bytes: number, lang: Lang): string {
  const units = ['B', 'KB', 'MB', 'GB']
  let v = bytes
  let i = 0
  while (v >= 1024 && i < units.length - 1) { v /= 1024; i++ }
  return `${formatNumber(v, lang, v < 10 && i > 0 ? 1 : 0)} ${units[i]}`
}
