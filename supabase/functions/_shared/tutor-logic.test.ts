import { describe, it, expect } from 'vitest'
import {
  defaultParts, limitFrom, markingAsText, markingPrompt, normaliseMarking, parseRequest, parseStored,
  parseToolInput, photoPathOk, scenesToNotes, systemPrompt, TOOLS,
} from './tutor-logic'

const UID = '0b5e1c9a-1111-4222-8333-944455556666'

describe('tutor request checks', () => {
  it('accepts a chat message and trims it', () => {
    expect(parseRequest({ mode: 'chat', text: '  সালোকসংশ্লেষণ কী?  ', lang: 'bn' })).toEqual({ mode: 'chat', text: 'সালোকসংশ্লেষণ কী?', lang: 'bn', thread_id: undefined, subject_code: undefined })
  })
  it('rejects empty, too long, and bad thread ids', () => {
    expect(parseRequest({ text: '   ' })).toEqual({ error: 'empty' })
    expect(parseRequest({ text: 'x'.repeat(2001) })).toEqual({ error: 'too_long' })
    expect(parseRequest({ text: 'hi', thread_id: 'drop table' })).toEqual({ error: 'bad_thread' })
    expect(parseRequest(null)).toEqual({ error: 'bad_request' })
  })
  it('needs a photo for marking and drops a malformed subject', () => {
    expect(parseRequest({ mode: 'mark' })).toEqual({ error: 'no_photo' })
    const r = parseRequest({ mode: 'mark', image_path: `${UID}/a.jpg`, subject_code: 'x;1', lang: 'en' })
    expect(r).toMatchObject({ mode: 'mark', lang: 'en', subject_code: undefined })
  })
  it('only allows photos in the student\'s own folder', () => {
    expect(photoPathOk(UID, `${UID}/abc-1.jpg`)).toBe(true)
    expect(photoPathOk(UID, `${UID}/abc.webp`)).toBe(true)
    expect(photoPathOk(UID, `other/abc.jpg`)).toBe(false)
    expect(photoPathOk(UID, `${UID}/../x/abc.jpg`)).toBe(false)
    expect(photoPathOk(UID, `${UID}/abc.svg`)).toBe(false)
  })
  it('reads limits from the environment with safe fallbacks', () => {
    expect(limitFrom('30', 20)).toBe(30)
    expect(limitFrom(undefined, 20)).toBe(20)
    expect(limitFrom('-1', 20)).toBe(20)
    expect(limitFrom('abc', 5)).toBe(5)
  })
})

describe('tutor prompts', () => {
  it('states the rules: guide, short answers, no exam certainty, no cheating', () => {
    const s = systemPrompt({ lang: 'bn', subjectName: 'গণিত', medium: 'bn', group: 'science' })
    expect(s).toMatch(/Explain and guide/)
    expect(s).toMatch(/Keep answers short/)
    expect(s).toMatch(/Never claim certainty/)
    expect(s).toMatch(/cheating/)
    expect(s).toContain('গণিত')
  })
  it('uses SSC creative-question parts by subject when there is no rubric', () => {
    expect(defaultParts('109').map((p) => p.marks)).toEqual([2, 4, 4])
    expect(defaultParts('136').map((p) => `${p.part}${p.marks}`)).toEqual(['a1', 'b2', 'c3', 'd4'])
  })
  it('puts the rubric into the marking prompt', () => {
    const p = markingPrompt({ lang: 'en', stem: 'A ball is thrown…', rubric: [{ part: 'a', marks: 1, prompt: 'Define velocity', criteria: [{ points: 1, criterion: 'rate of change of displacement' }] }] })
    expect(p).toContain('Part a (1 marks): Define velocity')
    expect(p).toContain('1 mark(s): rate of change of displacement')
    expect(p).toContain('in English')
  })
})

describe('marking results', () => {
  const rubric = defaultParts('136')
  it('trusts the rubric for parts and maximum marks, clamping the model', () => {
    const m = normaliseMarking({ legible: true, parts: [
      { part: 'a', awarded: 1, missing: '' },
      { part: 'b', awarded: 5, missing: 'too much' },
      { part: 'c', awarded: 1.3, missing: 'no example' },
      { part: 'e', awarded: 9, missing: 'invented part' },
    ], next_step: 'Practise part d', summary: 'ok' }, rubric)!
    expect(m.parts.map((p) => p.awarded)).toEqual([1, 2, 1.5, 0])
    expect(m.parts.map((p) => p.max)).toEqual([1, 2, 3, 4])
    expect(m.total).toBe(4.5)
    expect(m.max_total).toBe(10)
    expect(normaliseMarking('nope', rubric)).toBeNull()
  })
  it('round-trips through storage and reads back as text for later turns', () => {
    const m = normaliseMarking({ legible: true, parts: [], next_step: 'x', summary: 'y' }, rubric)!
    expect(parseStored(JSON.stringify(m))).toEqual(m)
    expect(parseStored('plain reply')).toBeNull()
    expect(markingAsText(m)).toMatch(/^\[Photo marked: 0\/10/)
  })
})

describe('tool inputs', () => {
  it('validates each tool and tolerates letter case in the name', () => {
    expect(parseToolInput('Search_Lessons', { query: ' ভেক্টর ' })).toEqual({ name: 'search_lessons', query: 'ভেক্টর', subject_code: undefined })
    expect(parseToolInput('search_lessons', {})).toEqual({ error: 'query is required.' })
    expect(parseToolInput('get_chapter_notes', { chapter_id: 'abc' })).toHaveProperty('error')
    expect(parseToolInput('get_chapter_notes', { chapter_id: UID })).toEqual({ name: 'get_chapter_notes', chapter_id: UID })
    expect(parseToolInput('get_student_progress', { subject_code: '109' })).toEqual({ name: 'get_student_progress', subject_code: '109' })
    expect(parseToolInput('get_method_sheet', { question_type: 'cq' })).toEqual({ error: 'subject_code is required.' })
    expect(parseToolInput('get_method_sheet', { subject_code: '1; drop' })).toHaveProperty('error')
    expect(parseToolInput('rm_rf', {})).toHaveProperty('error')
  })
  it('offers exactly the four tools from the spec', () => {
    expect(TOOLS.map((t) => t.name)).toEqual(['search_lessons', 'get_chapter_notes', 'get_student_progress', 'get_method_sheet'])
  })
  it('turns lesson scenes into short notes', () => {
    const notes = scenesToNotes([{ title: 'Sets', scenes: [
      { idx: 1, type: 'formula', body_json: { title: 'Union', tex: 'A \\cup B' } },
      { idx: 0, type: 'text', body_json: { title: 'What is a set', bullets: ['A collection'] } },
    ] }])
    expect(notes.indexOf('What is a set')).toBeLessThan(notes.indexOf('Union'))
    expect(notes).toContain('$A \\cup B$')
    expect(scenesToNotes([{ title: 'x', scenes: [{ idx: 0, type: 'text', body_json: { bullets: ['y'.repeat(100)] } }] }], 50)).toHaveLength(52)
  })
})
