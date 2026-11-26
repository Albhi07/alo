// Row shapes shared by the content build script, the client cache and the admin CMS.
// They mirror the Postgres tables in supabase/migrations.
import type { MarkScheme, Medium } from './catalog'

export interface SubjectRow {
  code: string; name_bn: string; name_en: string; groups: string[]; is_compulsory: boolean
  mark_scheme: MarkScheme; has_practical: boolean; sort: number; updated_at?: string
}

export interface ChapterRow {
  id: string; subject_code: string; number: number; title_bn: string; title_en: string
  syllabus_year: number; board_freq_5y: number; sort: number; updated_at?: string
}

export interface LessonRow {
  id: string; chapter_id: string; title_bn: string; title_en: string; medium: Medium
  duration_s: number; size_bytes: number; version: number; published: boolean; sort: number; updated_at?: string
}

export type SceneType = 'text' | 'formula' | 'diagram' | 'question' | 'worked_step'

export interface SceneQuestion { stem: string; options: string[]; answer: number; explanation: string }

export interface SceneBody {
  title: string
  bullets?: string[]
  tex?: string
  svg?: string
  problem?: string
  steps?: { tex?: string; text?: string }[]
  question?: SceneQuestion
}

export interface SceneRow {
  id: string; lesson_id: string; idx: number; type: SceneType; body_json: SceneBody
  audio_path: string | null; captions: string | null; updated_at?: string
}

export interface CqPart { part: 'a' | 'b' | 'c' | 'd'; marks: number; prompt: string }
export interface CqAnswer { part: 'a' | 'b' | 'c' | 'd'; model: string; rubric: { points: number; criterion: string }[] }

export interface QuestionRow {
  id: string; chapter_id: string; kind: 'mcq' | 'cq' | 'short'
  subtype: 'single' | 'multi_completion' | 'situation' | 'cq' | null; medium: Medium
  stem: string
  /** MCQ: { options: string[4], context?: string } */
  options_json: { options: string[]; context?: string } | null
  /** MCQ: { index }  CQ: CqAnswer[] */
  answer_json: { index: number } | CqAnswer[]
  explanation: string | null
  /** CQ: CqPart[] */
  marks_json: CqPart[] | null
  source: 'board' | 'original'; board: string | null; year: number | null
  difficulty: number | null; tags: string[]; published: boolean; updated_at?: string
}

export interface MethodSheetRow {
  id: string; subject_code: string; chapter_id: string | null; question_type: string; medium: Medium; body_md: string; updated_at?: string
}

export interface DrillTemplateRow {
  id: string; chapter_id: string; title: string; vars_json: unknown; constraints_json: unknown; solution_js: string; version: number; updated_at?: string
}

export interface NoticeRow {
  id: string; title_bn: string; title_en: string; body: string | null; event_date: string | null
  source_url: string | null; last_checked: string | null; verified: boolean; board: string[]; updated_at?: string
}

export interface ContentIndex {
  version: string
  subjects: SubjectRow[]
  chapters: ChapterRow[]
  /** chapter id -> medium -> pack version and size, for "download for offline" */
  packs: Record<string, Partial<Record<Medium, { version: string; bytes: number; lessons: number; mcq: number; cq: number }>>>
  exam_config: import('./exam').ExamConfig[]
  routine: import('./exam').RoutineRow[]
  notices: NoticeRow[]
}

export interface ChapterPack {
  chapter_id: string
  medium: Medium
  version: string
  lessons: (LessonRow & { scenes: SceneRow[] })[]
  questions: QuestionRow[]
  method_sheets: MethodSheetRow[]
  drill_templates: DrillTemplateRow[]
}
