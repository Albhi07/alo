import { saveLocal } from '../db/sync'

export type EventName =
  | 'onboarding_completed' | 'lesson_started' | 'lesson_completed' | 'mcq_answered' | 'drill_answered'
  | 'mock_started' | 'mock_mcq_submitted' | 'mock_submitted' | 'mock_marked' | 'focus_completed'

/** Privacy-friendly analytics: event name and a few coarse props, no personal data. Synced like everything else. */
export function logEvent(name: EventName, props: Record<string, unknown> = {}) {
  return saveLocal('events', { name, props })
}
