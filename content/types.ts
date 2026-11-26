// Authoring types for seed content. Text is written once per language as { bn, en };
// the build script emits one row per medium (Bangla version / English version).

export interface Bi { bn: string; en: string }

export interface ChapterSrc { number: number; title: Bi }

export type SceneSrc =
  | { type: 'text'; title: Bi; bullets: Bi[]; narration: Bi; diagram?: string }
  | { type: 'formula'; title: Bi; tex: string; bullets: Bi[]; narration: Bi }
  | { type: 'diagram'; title: Bi; svg: string; bullets: Bi[]; narration: Bi }
  | { type: 'worked_step'; title: Bi; problem: Bi; steps: { tex?: string; text?: Bi }[]; narration: Bi }
  | { type: 'question'; title: Bi; question: McqBody; narration: Bi }

export interface McqBody {
  stem: Bi
  options: [Bi, Bi, Bi, Bi]
  answer: 0 | 1 | 2 | 3
  explanation: Bi
}

export interface LessonSrc { key: string; title: Bi; scenes: SceneSrc[] }

export interface McqSrc extends McqBody {
  key: string
  subtype: 'single' | 'multi_completion' | 'situation'
  /** Shared passage for situation-based items (অনুচ্ছেদ-ভিত্তিক). */
  context?: Bi
  difficulty: 1 | 2 | 3 | 4 | 5
  tags: string[]
}

export interface CqPartSrc {
  part: 'a' | 'b' | 'c' | 'd'
  prompt: Bi
  model: Bi
  rubric: { points: number; criterion: Bi }[]
}
export interface CqSrc { key: string; stem: Bi; parts: [CqPartSrc, CqPartSrc, CqPartSrc, CqPartSrc]; difficulty: 1 | 2 | 3 | 4 | 5; tags: string[] }

export interface MethodSheetSrc { key: string; question_type: string; body: Bi }

/** Inline formula marker for rich text: $...$ is rendered with KaTeX. */
export const CQ_MARKS = { a: 1, b: 2, c: 3, d: 4 } as const

/** Drill template: random variables, constraints and a data-only solution script (see src/lib/drill.ts). */
export interface DrillSrc {
  key: string
  title: Bi
  vars: Record<string, { min?: number; max?: number; step?: number; not?: number[]; choices?: number[] }>
  constraints: string[]
  script: {
    derived?: Record<string, string>
    question: Bi
    answers: { label: Bi; expr: string; tolerance?: number; unit?: Bi }[]
    steps: Bi[]
  }
}

/** Mock paper CQ: parts carry their own marks (Maths: ক 2, খ 4, গ 4). */
export interface MockCqPartSrc { part: 'a' | 'b' | 'c' | 'd'; marks: number; prompt: Bi; model: Bi; rubric: { points: number; criterion: Bi }[] }
export interface MockCqSrc { key: string; stem: Bi; parts: MockCqPartSrc[] }

export interface MockSrc {
  key: string
  subject_code: string
  title: Bi
  exam_year: number
  duration_mcq_min: number
  duration_cq_min: number
  marks: { mcq: number; cq: number; practical?: number }
  /** How many CQs to answer, and the minimum from each section. */
  cq_rules: { answer: number; min_per_section: number }
  mcqs: McqSrc[]
  sections: { key: string; title: Bi; cqs: MockCqSrc[] }[]
}
