import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { SEED_EXAM_CONFIG, SEED_ROUTINE, type ExamConfig, type RoutineRow } from '../data/exam'

/**
 * Exam config and routine from the last server fetch (cached in IndexedDB), falling
 * back to the bundled seed. Countdowns read from here, so admin date changes apply
 * without a deploy.
 */
export function useExamData(): { config: ExamConfig; routine: RoutineRow[] } {
  const cached = useLiveQuery(async () => {
    const c = await db.kv.get('exam.config')
    const r = await db.kv.get('exam.routine')
    return { config: c?.value as ExamConfig | undefined, routine: r?.value as RoutineRow[] | undefined }
  }, [])
  return {
    config: cached?.config ?? SEED_EXAM_CONFIG,
    routine: cached?.routine?.length ? cached.routine : SEED_ROUTINE,
  }
}
