import { useLiveQuery } from 'dexie-react-hooks'
import { db, type LocalProfile } from '../db'
import { saveLocal } from '../db/sync'
import { uuid } from '../lib/id'
import { studentSubjects } from '../data/catalog'
import { EXAM_YEAR } from '../data/exam'

export type ProfileDraft = Pick<
  LocalProfile,
  'language' | 'medium' | 'board' | 'group' | 'religion_code' | 'fourth_subject_code' | 'daily_target_min'
>

/** `undefined` while loading, `null` when this device has no profile yet. */
export function useProfile(): LocalProfile | null | undefined {
  return useLiveQuery(async () => (await db.profiles.toCollection().first()) ?? null, [])
}

export async function saveProfile(draft: ProfileDraft & Partial<LocalProfile>) {
  const existing = await db.profiles.toCollection().first()
  const userId = ((await db.kv.get('auth.user_id'))?.value as string | undefined) ?? null
  return saveLocal('profiles', {
    display_name: null,
    role: 'student',
    exam_year: EXAM_YEAR,
    ...existing,
    ...draft,
    id: existing?.id ?? userId ?? uuid(),
    onboarded: true,
  } as LocalProfile & Record<string, unknown>)
}

export function subjectsFor(p: LocalProfile) {
  return studentSubjects({ group: p.group, fourth: p.fourth_subject_code, religion: p.religion_code })
}
