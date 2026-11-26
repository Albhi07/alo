import { addDays, weekStart } from './days'

/**
 * Study streak in days. One missed day per week (Saturday to Friday) is a free rest day and
 * doesn't break the streak; a second missed day in the same week does. Today not studied yet
 * doesn't break it either (the day isn't over).
 */
export function computeStreak(active: Set<string>, today: string): { days: number; restUsedThisWeek: boolean; studiedToday: boolean } {
  const studiedToday = active.has(today)
  let day = studiedToday ? today : addDays(today, -1)
  let days = 0
  const restUsed = new Set<string>()
  // Walk back at most two years.
  for (let i = 0; i < 730; i++) {
    if (active.has(day)) { days++ } else {
      const wk = weekStart(day)
      if (restUsed.has(wk)) break
      // A rest day only bridges a streak: it can't be the far end of one.
      const prev = addDays(day, -1)
      if (!active.has(prev)) break
      restUsed.add(wk)
    }
    day = addDays(day, -1)
  }
  return { days, restUsedThisWeek: restUsed.has(weekStart(today)), studiedToday }
}
