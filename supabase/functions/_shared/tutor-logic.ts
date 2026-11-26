// Pure parts of the AI tutor: request checks, prompts, tool schemas, marking validation.
// No Deno or network APIs here, so the app's unit tests (vitest) cover it directly.

export const MODEL = 'claude-sonnet-5-5'
export const DEFAULT_LIMITS = { messages: 20, photos: 5 }
export const MAX_TEXT = 2000
export const HISTORY_TURNS = 12
export const MAX_TOOL_ROUNDS = 6
export const PHOTO_BUCKET = 'tutor-photos'
export const PHOTO_MAX_BYTES = 5 * 1024 * 1024
export const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const

export type Lang = 'bn' | 'en'
export type Part = 'a' | 'b' | 'c' | 'd'

export interface ChatRequest { mode: 'chat'; text: string; thread_id?: string; subject_code?: string; lang: Lang }
export interface MarkRequest { mode: 'mark'; image_path: string; question_id?: string; question_text?: string; subject_code?: string; thread_id?: string; lang: Lang }
export type TutorRequest = ChatRequest | MarkRequest

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const SUBJECT = /^\d{3}$/

/** Validate the JSON body. Returns an error code instead of throwing. */
export function parseRequest(body: unknown): TutorRequest | { error: string } {
  if (!body || typeof body !== 'object') return { error: 'bad_request' }
  const b = body as Record<string, unknown>
  const lang: Lang = b.lang === 'en' ? 'en' : 'bn'
  const thread_id = typeof b.thread_id === 'string' && UUID.test(b.thread_id) ? b.thread_id : undefined
  if (b.thread_id !== undefined && b.thread_id !== null && !thread_id) return { error: 'bad_thread' }
  const subject_code = typeof b.subject_code === 'string' && SUBJECT.test(b.subject_code) ? b.subject_code : undefined
  if (b.mode === 'mark') {
    if (typeof b.image_path !== 'string' || !b.image_path) return { error: 'no_photo' }
    const question_id = typeof b.question_id === 'string' && UUID.test(b.question_id) ? b.question_id : undefined
    const question_text = typeof b.question_text === 'string' ? b.question_text.trim().slice(0, MAX_TEXT) : undefined
    return { mode: 'mark', image_path: b.image_path, question_id, question_text: question_text || undefined, subject_code, thread_id, lang }
  }
  const text = typeof b.text === 'string' ? b.text.trim() : ''
  if (!text) return { error: 'empty' }
  if (text.length > MAX_TEXT) return { error: 'too_long' }
  return { mode: 'chat', text, thread_id, subject_code, lang }
}

/** A photo path must sit in the student's own folder: `<user id>/<name>.<jpg|png|webp>`. */
export function photoPathOk(userId: string, path: string): boolean {
  return new RegExp(`^${userId}/[A-Za-z0-9_-]{1,80}\\.(jpe?g|png|webp)$`).test(path)
}

export function mediaTypeOf(path: string): (typeof PHOTO_TYPES)[number] {
  return path.endsWith('.png') ? 'image/png' : path.endsWith('.webp') ? 'image/webp' : 'image/jpeg'
}

/** Read a positive integer limit from the environment, falling back to the default. */
export function limitFrom(v: string | undefined, fallback: number) {
  const n = Number(v)
  return Number.isInteger(n) && n > 0 ? n : fallback
}

export function systemPrompt(o: { lang: Lang; subjectName?: string; medium?: Lang; group?: string }) {
  return [
    "You are the tutor inside Alo, a free study app for Bangladeshi students preparing for the SSC 2027 exam (NCTB curriculum, Classes 9-10). Most students use a phone, often on slow internet.",
    o.subjectName ? `The student opened the tutor from: ${o.subjectName}.` : '',
    o.medium ? `The student studies in the ${o.medium === 'bn' ? 'Bangla' : 'English'} version${o.group ? `, ${o.group} group` : ''}.` : '',
    '',
    'How you help:',
    `- Reply in the language the student writes in (Bangla or English). If unclear, use ${o.lang === 'bn' ? 'Bangla' : 'English'}. Use the textbook's terms for that version.`,
    '- Explain and guide. When a student asks for an answer to an exercise, show the method and work through it with them step by step, then let them try the next step. Check their working when they share it.',
    '- Keep answers short: a few sentences or a short numbered list. Offer to go deeper rather than writing long essays.',
    '- Write maths and chemistry in LaTeX between single dollar signs, like $x^2 + 2x$ or $\\ce{H2O}$. Use **bold** sparingly. No tables or images.',
    '- Stay within the SSC syllabus. For other topics, say briefly that you can only help with SSC studies.',
    '- Use the tools to look at what the app teaches before answering about a specific chapter, and point the student to the chapter in the app when it helps. Use get_student_progress when they ask what to study or where they are weak. Use get_method_sheet for how to answer a type of question (for example creative questions).',
    '- Never claim certainty about what will appear in the exam. You can say which chapters were asked often in past board papers, but not that a question "will surely come".',
    '- If the student says or suggests they are sitting an exam right now, or asks you to solve questions from a live exam paper, refuse kindly and wish them well. Do not help with cheating of any kind.',
    '- Be warm and encouraging; many students are anxious about exams. If a student mentions self-harm or being in danger, respond with care and tell them to talk to a trusted adult or call the national helpline 999 right away.',
  ].filter((l) => l !== '').join('\n')
}

/** Default parts and marks when a photo has no question from the app: standard SSC creative question. */
export function defaultParts(subjectCode?: string): { part: Part; marks: number }[] {
  if (subjectCode === '109' || subjectCode === '126') return [{ part: 'a', marks: 2 }, { part: 'b', marks: 4 }, { part: 'c', marks: 4 }]
  return [{ part: 'a', marks: 1 }, { part: 'b', marks: 2 }, { part: 'c', marks: 3 }, { part: 'd', marks: 4 }]
}

export interface Rubric { part: Part; marks: number; prompt?: string; model?: string; criteria?: { points: number; criterion: string }[] }

export function markingPrompt(o: { lang: Lang; stem?: string; questionText?: string; rubric: Rubric[] }) {
  const parts = o.rubric.map((r) => {
    const lines = [`Part ${r.part} (${r.marks} marks)${r.prompt ? `: ${r.prompt}` : ''}`]
    if (r.model) lines.push(`  Model answer: ${r.model}`)
    for (const c of r.criteria ?? []) lines.push(`  - ${c.points} mark(s): ${c.criterion}`)
    return lines.join('\n')
  })
  return [
    'Mark the handwritten answer in the photo as an SSC creative-question examiner would.',
    o.stem ? `Stimulus (uddipak):\n${o.stem}` : '',
    o.questionText ? `Question as the student typed it:\n${o.questionText}` : '',
    o.rubric.some((r) => r.criteria?.length) ? 'Rubric:' : 'Parts (no rubric given: use the usual SSC levels - knowledge, comprehension, application, higher ability):',
    parts.join('\n'),
    '',
    'For each part, give the marks earned (whole or half marks, never above the part\'s marks), and in one short sentence what was missing or wrong (empty if full marks).',
    'If a part is not answered or not readable, give 0 and say so. Set legible to false if most of the page cannot be read.',
    'Then give one concrete next step the student should practise.',
    `Write "missing", "next_step" and "summary" in ${o.lang === 'bn' ? 'Bangla' : 'English'}. Never say this exact question will come in the exam.`,
  ].filter(Boolean).join('\n')
}

export const MARK_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['legible', 'parts', 'next_step', 'summary'],
  properties: {
    legible: { type: 'boolean' },
    parts: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['part', 'awarded', 'missing'],
        properties: { part: { type: 'string', enum: ['a', 'b', 'c', 'd'] }, awarded: { type: 'number' }, missing: { type: 'string' } },
      },
    },
    next_step: { type: 'string' },
    summary: { type: 'string' },
  },
} as const

export interface Marking {
  type: 'marking'
  legible: boolean
  parts: { part: Part; awarded: number; max: number; missing: string }[]
  total: number
  max_total: number
  next_step: string
  summary: string
}

/** Trust the rubric, not the model, for which parts exist and their maximum marks. */
export function normaliseMarking(raw: unknown, rubric: { part: Part; marks: number }[]): Marking | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as { legible?: unknown; parts?: unknown; next_step?: unknown; summary?: unknown }
  const got = Array.isArray(r.parts) ? (r.parts as { part?: unknown; awarded?: unknown; missing?: unknown }[]) : []
  const parts = rubric.map(({ part, marks }) => {
    const p = got.find((x) => x?.part === part)
    const n = typeof p?.awarded === 'number' && Number.isFinite(p.awarded) ? p.awarded : 0
    const awarded = Math.min(marks, Math.max(0, Math.round(n * 2) / 2))
    return { part, awarded, max: marks, missing: typeof p?.missing === 'string' ? p.missing.slice(0, 400) : '' }
  })
  return {
    type: 'marking',
    legible: r.legible !== false,
    parts,
    total: parts.reduce((t, p) => t + p.awarded, 0),
    max_total: parts.reduce((t, p) => t + p.max, 0),
    next_step: typeof r.next_step === 'string' ? r.next_step.slice(0, 600) : '',
    summary: typeof r.summary === 'string' ? r.summary.slice(0, 600) : '',
  }
}

/** One stored marking, as text the model can read in later chat turns. */
export function markingAsText(m: Marking) {
  return `[Photo marked: ${m.total}/${m.max_total}. ${m.parts.map((p) => `${p.part}: ${p.awarded}/${p.max}${p.missing ? ` (${p.missing})` : ''}`).join('; ')}. Next step: ${m.next_step}]`
}

export function parseStored(content: string): Marking | null {
  if (!content.startsWith('{')) return null
  try {
    const v = JSON.parse(content) as Marking
    return v?.type === 'marking' ? v : null
  } catch { return null }
}

// ---------------------------------------------------------------------------
// Tools the model can call. Inputs are validated here before anything runs.
// ---------------------------------------------------------------------------
export const TOOLS = [
  {
    name: 'search_lessons',
    description: "Search Alo's lessons, chapters and practice questions by topic or keyword (Bangla or English). Returns matching chapters with their ids. Use it to find where the app teaches something.",
    input_schema: {
      type: 'object' as const,
      additionalProperties: false,
      required: ['query'],
      properties: {
        query: { type: 'string', description: 'A topic or keyword, e.g. "সালোকসংশ্লেষণ" or "quadratic equation".' },
        subject_code: { type: 'string', description: 'Optional 3-digit SSC subject code to narrow the search, e.g. "109" for Mathematics.' },
      },
    },
  },
  {
    name: 'get_chapter_notes',
    description: "Get the app's lesson notes for one chapter: key points, formulas and worked steps, in the student's version.",
    input_schema: {
      type: 'object' as const,
      additionalProperties: false,
      required: ['chapter_id'],
      properties: { chapter_id: { type: 'string', description: 'Chapter id from search_lessons.' } },
    },
  },
  {
    name: 'get_student_progress',
    description: "Get this student's mastery per chapter (0-100) and recent mock exam scores. Use when they ask what to study next or where they are weak.",
    input_schema: {
      type: 'object' as const,
      additionalProperties: false,
      properties: { subject_code: { type: 'string', description: 'Optional 3-digit subject code.' } },
    },
  },
  {
    name: 'get_method_sheet',
    description: 'Get the method sheet on how to answer a type of question in a subject (for example how to write a creative question answer), with the steps examiners look for.',
    input_schema: {
      type: 'object' as const,
      additionalProperties: false,
      required: ['subject_code'],
      properties: {
        subject_code: { type: 'string', description: '3-digit subject code.' },
        question_type: { type: 'string', description: 'Optional type, e.g. "cq", "mcq", "proof", "math".' },
        chapter_id: { type: 'string', description: 'Optional chapter id for a chapter-specific sheet.' },
      },
    },
  },
]

export type ToolName = (typeof TOOLS)[number]['name']

export type ToolInput =
  | { name: 'search_lessons'; query: string; subject_code?: string }
  | { name: 'get_chapter_notes'; chapter_id: string }
  | { name: 'get_student_progress'; subject_code?: string }
  | { name: 'get_method_sheet'; subject_code: string; question_type?: string; chapter_id?: string }

/** Check a tool call's input. Accepts a name that differs only in letter case. */
export function parseToolInput(name: string, input: unknown): ToolInput | { error: string } {
  const n = TOOLS.find((t) => t.name.toLowerCase() === name.toLowerCase())?.name
  if (!n) return { error: `Unknown tool "${name}". Tools: ${TOOLS.map((t) => t.name).join(', ')}.` }
  const i = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>
  const str = (k: string, max = 200) => (typeof i[k] === 'string' && (i[k] as string).trim() ? (i[k] as string).trim().slice(0, max) : undefined)
  const subj = str('subject_code')
  if (subj && !SUBJECT.test(subj)) return { error: 'subject_code must be a 3-digit code like "109".' }
  switch (n) {
    case 'search_lessons': {
      const query = str('query', 100)
      return query ? { name: n, query, subject_code: subj } : { error: 'query is required.' }
    }
    case 'get_chapter_notes': {
      const chapter_id = str('chapter_id')
      return chapter_id && UUID.test(chapter_id) ? { name: n, chapter_id } : { error: 'chapter_id must be a chapter id from search_lessons.' }
    }
    case 'get_student_progress':
      return { name: n, subject_code: subj }
    case 'get_method_sheet': {
      if (!subj) return { error: 'subject_code is required.' }
      const chapter_id = str('chapter_id')
      return { name: n, subject_code: subj, question_type: str('question_type', 40), chapter_id: chapter_id && UUID.test(chapter_id) ? chapter_id : undefined }
    }
  }
  return { error: 'unreachable' }
}

interface SceneLike { idx: number; type: string; body_json: { title?: string; bullets?: string[]; tex?: string; problem?: string; steps?: { tex?: string; text?: string }[]; question?: { stem: string } } }

/** Lesson scenes as compact notes for the model, capped in length. */
export function scenesToNotes(lessons: { title: string; scenes: SceneLike[] }[], max = 6000) {
  const out: string[] = []
  for (const l of lessons) {
    out.push(`# ${l.title}`)
    for (const s of [...l.scenes].sort((a, b) => a.idx - b.idx)) {
      const b = s.body_json ?? {}
      if (b.title) out.push(`## ${b.title}`)
      for (const x of b.bullets ?? []) out.push(`- ${x}`)
      if (b.tex) out.push(`$${b.tex}$`)
      if (b.problem) out.push(`Problem: ${b.problem}`)
      for (const st of b.steps ?? []) out.push(`  ${st.text ?? ''}${st.tex ? ` $${st.tex}$` : ''}`.trimEnd())
      if (b.question?.stem) out.push(`Check: ${b.question.stem}`)
    }
  }
  const text = out.join('\n')
  return text.length > max ? text.slice(0, max) + '\n…' : text
}

export function refusalText(lang: Lang) {
  return lang === 'bn'
    ? 'দুঃখিত, এ বিষয়ে আমি সাহায্য করতে পারছি না। তোমার পড়ার কোনো প্রশ্ন থাকলে জিজ্ঞেস করো।'
    : "Sorry, I can't help with that. Ask me anything about your SSC studies."
}
