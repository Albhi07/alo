/** Calendar-day helpers on "YYYY-MM-DD" strings (no time zones involved). */

export function addDays(iso: string, n: number): string {
  const [y, m, d] = iso.split('-').map(Number)
  const t = new Date(Date.UTC(y, m - 1, d + n))
  return t.toISOString().slice(0, 10)
}

export function dayDiff(from: string, to: string): number {
  const a = Date.UTC(+from.slice(0, 4), +from.slice(5, 7) - 1, +from.slice(8, 10))
  const b = Date.UTC(+to.slice(0, 4), +to.slice(5, 7) - 1, +to.slice(8, 10))
  return Math.round((b - a) / 86_400_000)
}

/** 0 = Sunday … 6 = Saturday */
export function weekday(iso: string): number {
  return new Date(`${iso}T00:00:00Z`).getUTCDay()
}

/** Bangladeshi week: Saturday to Friday. Returns the Saturday that starts the week. */
export function weekStart(iso: string): string {
  return addDays(iso, -((weekday(iso) + 1) % 7))
}
