import type { QuestionRow } from '../data/content-types'

/** RFC 4180 CSV parser: quoted fields, escaped quotes, commas and newlines inside quotes. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let q = false
  const src = text.replace(/^\uFEFF/, '')
  for (let i = 0; i < src.length; i++) {
    const c = src[i]
    if (q) {
      if (c === '"') { if (src[i + 1] === '"') { field += '"'; i++ } else q = false }
      else field += c
    } else if (c === '"') q = true
    else if (c === ',') { row.push(field); field = '' }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && src[i + 1] === '\n') i++
      row.push(field); field = ''
      if (row.some((x) => x.trim() !== '')) rows.push(row)
      row = []
    } else field += c
  }
  row.push(field)
  if (row.some((x) => x.trim() !== '')) rows.push(row)
  return rows
}

export const QUESTION_CSV_COLUMNS = [
  'chapter_id', 'kind', 'subtype', 'medium', 'stem', 'context', 'option_a', 'option_b', 'option_c', 'option_d',
  'answer', 'explanation', 'source', 'board', 'year', 'difficulty', 'tags',
] as const

export const QUESTION_CSV_TEMPLATE = `${QUESTION_CSV_COLUMNS.join(',')}\n` +
  '<chapter uuid>,mcq,single,bn,"$2 + 2 = ?$",,"$3$","$4$","$5$","$6$",kha,"দুই আর দুই মিলে চার।",original,,,1,arithmetic;warmup\n'

const ANSWER_MAP: Record<string, number> = {
  a: 0, b: 1, c: 2, d: 3, ka: 0, kha: 1, ga: 2, gha: 3, 'ক': 0, 'খ': 1, 'গ': 2, 'ঘ': 3, '1': 0, '2': 1, '3': 2, '4': 3,
}
const BOARDS = ['dhaka', 'rajshahi', 'chattogram', 'cumilla', 'jashore', 'barishal', 'sylhet', 'dinajpur', 'mymensingh', 'madrasah', 'technical']

export interface CsvRowResult { line: number; row?: Omit<QuestionRow, 'id'>; errors: string[] }

/**
 * Validates an MCQ bulk import (header row required). Every row is checked on its own,
 * so the admin sees all problems at once and can import only the valid rows.
 */
export function validateQuestionCsv(text: string, chapterIds: Set<string>): CsvRowResult[] {
  const rows = parseCsv(text)
  if (!rows.length) return [{ line: 1, errors: ['empty file'] }]
  const header = rows[0].map((h) => h.trim().toLowerCase())
  const missing = QUESTION_CSV_COLUMNS.filter((c) => !header.includes(c) && c !== 'context')
  if (missing.length) return [{ line: 1, errors: [`missing columns: ${missing.join(', ')}`] }]
  const col = (r: string[], name: string) => (r[header.indexOf(name)] ?? '').trim()

  return rows.slice(1).map((r, i) => {
    const line = i + 2
    const errors: string[] = []
    const chapter_id = col(r, 'chapter_id')
    const kind = col(r, 'kind') || 'mcq'
    const subtype = col(r, 'subtype') || 'single'
    const medium = col(r, 'medium')
    const stem = col(r, 'stem')
    const options = ['option_a', 'option_b', 'option_c', 'option_d'].map((c) => col(r, c))
    const ans = ANSWER_MAP[col(r, 'answer').toLowerCase()]
    const source = col(r, 'source') || 'original'
    const board = col(r, 'board').toLowerCase() || null
    const year = col(r, 'year') ? Number(col(r, 'year')) : null
    const difficulty = col(r, 'difficulty') ? Number(col(r, 'difficulty')) : null

    if (!chapterIds.has(chapter_id)) errors.push('unknown chapter_id')
    if (kind !== 'mcq') errors.push('only kind=mcq can be imported by CSV')
    if (!['single', 'multi_completion', 'situation'].includes(subtype)) errors.push('subtype must be single, multi_completion or situation')
    if (medium !== 'bn' && medium !== 'en') errors.push('medium must be bn or en')
    if (!stem) errors.push('stem is empty')
    if (options.some((o) => !o)) errors.push('all four options are required')
    if (new Set(options).size !== 4 && options.every(Boolean)) errors.push('options must be different')
    if (ans === undefined) errors.push('answer must be a-d, ka-gha, ক-ঘ or 1-4')
    if (subtype === 'situation' && !col(r, 'context')) errors.push('situation questions need context')
    if (source !== 'original' && source !== 'board') errors.push('source must be original or board')
    if (source === 'board') {
      if (!board || !BOARDS.includes(board)) errors.push('board questions need a valid board')
      if (!year || year < 2000 || year > 2100) errors.push('board questions need a year')
    }
    if (difficulty !== null && !(difficulty >= 1 && difficulty <= 5)) errors.push('difficulty must be 1-5')
    if (errors.length) return { line, errors }
    return {
      line, errors,
      row: {
        chapter_id, kind: 'mcq', subtype: subtype as QuestionRow['subtype'], medium: medium as 'bn' | 'en', stem,
        options_json: { options, ...(col(r, 'context') ? { context: col(r, 'context') } : {}) },
        answer_json: { index: ans }, explanation: col(r, 'explanation') || null, marks_json: null,
        source: source as 'board' | 'original', board: source === 'board' ? board : null, year: source === 'board' ? year : null,
        difficulty, tags: col(r, 'tags').split(/[;|]/).map((t) => t.trim()).filter(Boolean), published: true,
      },
    }
  })
}
