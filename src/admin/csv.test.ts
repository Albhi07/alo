import { describe, it, expect } from 'vitest'
import { parseCsv, validateQuestionCsv, QUESTION_CSV_COLUMNS } from './csv'

const H = QUESTION_CSV_COLUMNS.join(',')
const ch = new Set(['c1'])

describe('csv', () => {
  it('parses quotes, commas and newlines', () => {
    expect(parseCsv('a,"b,c","d ""e""\nf"\r\n1,2,3')).toEqual([['a', 'b,c', 'd "e"\nf'], ['1', '2', '3']])
  })
  it('accepts a valid row and Bangla answer letters', () => {
    const res = validateQuestionCsv(`${H}\nc1,mcq,single,bn,"২+২=?",,৩,৪,৫,৬,খ,,original,,,2,a;b`, ch)
    expect(res[0].errors).toEqual([])
    expect(res[0].row!.answer_json).toEqual({ index: 1 })
    expect(res[0].row!.tags).toEqual(['a', 'b'])
  })
  it('reports every problem with its line number', () => {
    const res = validateQuestionCsv(`${H}\nzz,mcq,single,xx,,,1,1,,,q,,board,,1990,9,`, ch)
    expect(res[0].line).toBe(2)
    expect(res[0].errors).toEqual(expect.arrayContaining([
      'unknown chapter_id', 'medium must be bn or en', 'stem is empty', 'all four options are required',
      'answer must be a-d, ka-gha, ক-ঘ or 1-4', 'board questions need a valid board', 'board questions need a year', 'difficulty must be 1-5',
    ]))
  })
  it('rejects a file with missing columns', () => {
    expect(validateQuestionCsv('stem,answer\nx,a', ch)[0].errors[0]).toMatch(/missing columns/)
  })
})
