// Registry of authored chapter content. Add a chapter folder and list it here.
import type { CqSrc, LessonSrc, McqSrc, MethodSheetSrc } from './types'
import { lesson as algLesson } from './math-109/ch03-algebraic-expressions/lesson'
import { mcqs as algMcqs } from './math-109/ch03-algebraic-expressions/mcq'
import { cqs as algCqs } from './math-109/ch03-algebraic-expressions/cq'
import { methodSheets as algMethod } from './math-109/ch03-algebraic-expressions/method'

export interface ChapterContent {
  subject_code: string
  number: number
  lessons: LessonSrc[]
  mcqs: McqSrc[]
  cqs: CqSrc[]
  methodSheets: MethodSheetSrc[]
}

export const CHAPTER_CONTENT: ChapterContent[] = [
  { subject_code: '109', number: 3, lessons: [algLesson], mcqs: algMcqs, cqs: algCqs, methodSheets: algMethod },
]
