import { useLiveQuery } from 'dexie-react-hooks'
import { db, kvGet, kvSet } from '../db'

export interface LessonPosition { lesson_id: string; chapter_id: string; idx: number; total: number; at: string; done: boolean }

/** Where the student is in a lesson, for resuming and "continue where you left off". */
export async function savePosition(p: Omit<LessonPosition, 'at'>) {
  const pos = { ...p, at: new Date().toISOString() }
  await kvSet(`lesson.pos.${p.lesson_id}`, pos)
  await kvSet('lesson.last', pos)
}

export function getPosition(lessonId: string) {
  return kvGet<LessonPosition | null>(`lesson.pos.${lessonId}`, null)
}

export function useLastLesson() {
  return useLiveQuery(async () => {
    const pos = await kvGet<LessonPosition | null>('lesson.last', null)
    if (!pos) return null
    const lesson = await db.c_lessons.get(pos.lesson_id)
    return lesson ? { pos, lesson } : null
  }, [])
}

const SPEEDS = [0.75, 1, 1.25, 1.5] as const
export type Speed = (typeof SPEEDS)[number]
export { SPEEDS }

export function loadSpeed(): Speed {
  try { const v = Number(localStorage.getItem('alo.speed')); return (SPEEDS as readonly number[]).includes(v) ? (v as Speed) : 1 } catch { return 1 }
}
export function saveSpeed(v: Speed) { try { localStorage.setItem('alo.speed', String(v)) } catch { /* ignore */ } }
