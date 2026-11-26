import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { todayIso } from '../lib/format'
import { addDays } from '../lib/days'
import { useProfile } from './profile'
import type { NoticeRow } from '../data/content-types'

const forBoard = (n: NoticeRow, board?: string) => !n.board?.length || (board ? n.board.includes(board) : true)

/** All notices for the student's board, soonest first (undated ones last). */
export function useNotices() {
  const profile = useProfile()
  return useLiveQuery(async () => {
    const all = await db.c_notices.toArray()
    return all.filter((n) => forBoard(n, profile?.board)).sort((a, b) => (a.event_date ?? '9999').localeCompare(b.event_date ?? '9999'))
  }, [profile?.board])
}

/** Notices with a date in the next `days` days. */
export function useUpcomingNotices(days: number) {
  const list = useNotices()
  const today = todayIso()
  const end = addDays(today, days)
  return list?.filter((n) => n.event_date && n.event_date >= today && n.event_date <= end)
}
