/**
 * SM-2 spaced repetition (SuperMemo 2), adapted for MCQs.
 * quality: 0-5. We map: wrong = 1, right but slow = 3, right = 4, right and fast = 5.
 * A wrong answer resets the card and makes it due today, so it comes back in the same
 * session and again tomorrow.
 */
export interface SrsState { ease: number; interval_days: number; reps: number; due_on: string }

export const NEW_CARD: Omit<SrsState, 'due_on'> = { ease: 2.5, interval_days: 0, reps: 0 }

export function qualityFrom(correct: boolean, timeMs: number, expectedMs = 45_000): number {
  if (!correct) return 1
  if (timeMs <= expectedMs / 2) return 5
  if (timeMs <= expectedMs * 1.5) return 4
  return 3
}

function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d + days))
  return dt.toISOString().slice(0, 10)
}

export function schedule(prev: Omit<SrsState, 'due_on'> | null, quality: number, today: string): SrsState {
  const card = prev ?? NEW_CARD
  const ease = Math.max(1.3, card.ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)))
  if (quality < 3) return { ease, interval_days: 0, reps: 0, due_on: today }
  const reps = card.reps + 1
  const interval_days = reps === 1 ? 1 : reps === 2 ? 6 : Math.round(card.interval_days * ease)
  return { ease: Math.round(ease * 100) / 100, interval_days, reps, due_on: addDays(today, interval_days) }
}
