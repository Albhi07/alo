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
