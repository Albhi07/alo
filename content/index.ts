// Registry of authored chapter content. Add a chapter folder and list it here.
import type { CqSrc, DrillSrc, LessonSrc, McqSrc, MethodSheetSrc } from './types'
import { lesson as algLesson } from './math-109/ch03-algebraic-expressions/lesson'
import { mcqs as algMcqs } from './math-109/ch03-algebraic-expressions/mcq'
import { cqs as algCqs } from './math-109/ch03-algebraic-expressions/cq'
import { methodSheets as algMethod } from './math-109/ch03-algebraic-expressions/method'
import { drills as algDrills } from './math-109/ch03-algebraic-expressions/drills'
import { drills as motionDrills } from './physics-136/ch02-motion/drills'

export interface ChapterContent {
  subject_code: string
  number: number
  lessons: LessonSrc[]
  mcqs: McqSrc[]
  cqs: CqSrc[]
  methodSheets: MethodSheetSrc[]
  drills?: DrillSrc[]
}

export const CHAPTER_CONTENT: ChapterContent[] = [
  { subject_code: '109', number: 3, lessons: [algLesson], mcqs: algMcqs, cqs: algCqs, methodSheets: algMethod, drills: algDrills },
  { subject_code: '136', number: 2, lessons: [], mcqs: [], cqs: [], methodSheets: [], drills: motionDrills },
]
