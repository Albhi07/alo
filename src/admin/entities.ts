import type { AdminTable } from './store'

export type FieldType = 'text' | 'textarea' | 'number' | 'bool' | 'select' | 'tags' | 'json' | 'date' | 'time' | 'chapter' | 'subject'

export interface Field {
  name: string
  type: FieldType
  options?: string[]
  required?: boolean
  /** shown in the list view */
  list?: boolean
  readOnlyOnEdit?: boolean
}

export interface Entity {
  table: AdminTable
  fields: Field[]
  /** columns used to sort the list */
  sort: string[]
  /** fields searched by the list filter */
  search: string[]
}

const BOARDS = ['dhaka', 'rajshahi', 'chattogram', 'cumilla', 'jashore', 'barishal', 'sylhet', 'dinajpur', 'mymensingh', 'madrasah', 'technical']

export const ENTITIES: Record<string, Entity> = {
  subjects: {
    table: 'subjects', sort: ['sort'], search: ['code', 'name_bn', 'name_en'],
    fields: [
      { name: 'code', type: 'text', required: true, list: true, readOnlyOnEdit: true },
      { name: 'name_bn', type: 'text', required: true, list: true },
      { name: 'name_en', type: 'text', required: true },
      { name: 'groups', type: 'tags' },
      { name: 'is_compulsory', type: 'bool' },
      { name: 'mark_scheme', type: 'select', options: ['cq70_mcq30', 'cq50_mcq25_prac25', 'ict_th50_prac50', 'english_written100'], required: true },
      { name: 'has_practical', type: 'bool' },
      { name: 'sort', type: 'number' },
    ],
  },
  chapters: {
    table: 'chapters', sort: ['subject_code', 'sort'], search: ['title_bn', 'title_en', 'subject_code'],
    fields: [
      { name: 'subject_code', type: 'subject', required: true, list: true },
      { name: 'number', type: 'number', required: true, list: true },
      { name: 'title_bn', type: 'text', required: true, list: true },
      { name: 'title_en', type: 'text', required: true },
      { name: 'syllabus_year', type: 'number', required: true },
      { name: 'board_freq_5y', type: 'number' },
      { name: 'sort', type: 'number' },
    ],
  },
  lessons: {
    table: 'lessons', sort: ['chapter_id', 'sort'], search: ['title_bn', 'title_en'],
    fields: [
      { name: 'chapter_id', type: 'chapter', required: true, list: true },
      { name: 'medium', type: 'select', options: ['bn', 'en'], required: true, list: true },
      { name: 'title_bn', type: 'text', required: true, list: true },
      { name: 'title_en', type: 'text', required: true },
      { name: 'duration_s', type: 'number' },
      { name: 'size_bytes', type: 'number' },
      { name: 'version', type: 'number' },
      { name: 'sort', type: 'number' },
      { name: 'published', type: 'bool', list: true },
    ],
  },
  questions: {
    table: 'questions', sort: ['chapter_id', 'kind'], search: ['stem', 'explanation'],
    fields: [
      { name: 'chapter_id', type: 'chapter', required: true, list: true },
      { name: 'kind', type: 'select', options: ['mcq', 'cq', 'short'], required: true, list: true },
      { name: 'subtype', type: 'select', options: ['single', 'multi_completion', 'situation', 'cq'] },
      { name: 'medium', type: 'select', options: ['bn', 'en'], required: true, list: true },
      { name: 'stem', type: 'textarea', required: true, list: true },
      { name: 'options_json', type: 'json' },
      { name: 'answer_json', type: 'json', required: true },
      { name: 'explanation', type: 'textarea' },
      { name: 'marks_json', type: 'json' },
      { name: 'source', type: 'select', options: ['original', 'board'], required: true },
      { name: 'board', type: 'select', options: ['', ...BOARDS] },
      { name: 'year', type: 'number' },
      { name: 'difficulty', type: 'number' },
      { name: 'tags', type: 'tags' },
      { name: 'published', type: 'bool' },
    ],
  },
  drill_templates: {
    table: 'drill_templates', sort: ['chapter_id'], search: ['title'],
    fields: [
      { name: 'chapter_id', type: 'chapter', required: true, list: true },
      { name: 'title', type: 'text', required: true, list: true },
      { name: 'vars_json', type: 'json', required: true },
      { name: 'constraints_json', type: 'json' },
      { name: 'solution_js', type: 'textarea', required: true },
      { name: 'version', type: 'number' },
    ],
  },
  method_sheets: {
    table: 'method_sheets', sort: ['subject_code'], search: ['question_type', 'body_md'],
    fields: [
      { name: 'subject_code', type: 'subject', required: true, list: true },
      { name: 'chapter_id', type: 'chapter' },
      { name: 'question_type', type: 'text', required: true, list: true },
      { name: 'medium', type: 'select', options: ['bn', 'en'], required: true, list: true },
      { name: 'body_md', type: 'textarea', required: true },
    ],
  },
  notices: {
    table: 'notices', sort: ['event_date'], search: ['title_bn', 'title_en'],
    fields: [
      { name: 'title_bn', type: 'text', required: true, list: true },
      { name: 'title_en', type: 'text', required: true },
      { name: 'body', type: 'textarea' },
      { name: 'event_date', type: 'date', list: true },
      { name: 'source_url', type: 'text' },
      { name: 'last_checked', type: 'date' },
      { name: 'verified', type: 'bool', list: true },
      { name: 'board', type: 'tags' },
    ],
  },
  exam_config: {
    table: 'exam_config', sort: ['exam_year'], search: ['exam_year'],
    fields: [
      { name: 'exam_year', type: 'number', required: true, list: true, readOnlyOnEdit: true },
      { name: 'written_start', type: 'date', required: true, list: true },
      { name: 'written_end', type: 'date', required: true, list: true },
      { name: 'practical_start', type: 'date' },
      { name: 'practical_end', type: 'date' },
      { name: 'results_date', type: 'date' },
      { name: 'status', type: 'select', options: ['upcoming', 'running', 'done'], required: true, list: true },
    ],
  },
  routine: {
    table: 'routine', sort: ['date'], search: ['subject_code', 'date'],
    fields: [
      { name: 'exam_year', type: 'number', required: true },
      { name: 'date', type: 'date', required: true, list: true },
      { name: 'subject_code', type: 'subject', required: true, list: true },
      { name: 'paper', type: 'text', required: true, list: true },
      { name: 'start_time', type: 'time', required: true },
      { name: 'duration_min', type: 'number', required: true },
      { name: 'verified', type: 'bool', list: true },
    ],
  },
}
