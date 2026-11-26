// Static catalog for SSC 2027 (NCTB National Curriculum 2012, Class 9-10).
// This mirrors the `subjects` seed in supabase/seed.sql so onboarding works offline
// before any content is downloaded.

export type Group = 'science' | 'business' | 'humanities'
export type MarkScheme = 'cq70_mcq30' | 'cq50_mcq25_prac25' | 'ict_th50_prac50' | 'english_written100'
export type Medium = 'bn' | 'en'
export type Lang = 'bn' | 'en'

export interface Subject {
  code: string
  name_bn: string
  name_en: string
  groups: Group[]
  is_compulsory: boolean
  mark_scheme: MarkScheme
  has_practical: boolean
  sort: number
}

export const BOARDS = [
  'dhaka', 'rajshahi', 'chattogram', 'cumilla', 'jashore', 'barishal',
  'sylhet', 'dinajpur', 'mymensingh', 'madrasah', 'technical',
] as const
export type Board = (typeof BOARDS)[number]

export const GROUPS: Group[] = ['science', 'business', 'humanities']

const S = (
  code: string, name_bn: string, name_en: string, groups: Group[], is_compulsory: boolean,
  mark_scheme: MarkScheme, sort: number,
): Subject => ({
  code, name_bn, name_en, groups, is_compulsory, mark_scheme,
  has_practical: mark_scheme === 'cq50_mcq25_prac25' || mark_scheme === 'ict_th50_prac50', sort,
})

const ALL: Group[] = ['science', 'business', 'humanities']

export const SUBJECTS: Subject[] = [
  S('101', 'বাংলা ১ম পত্র', 'Bangla 1st Paper', ALL, true, 'cq70_mcq30', 1),
  S('102', 'বাংলা ২য় পত্র', 'Bangla 2nd Paper', ALL, true, 'cq70_mcq30', 2),
  S('107', 'ইংরেজি ১ম পত্র', 'English 1st Paper', ALL, true, 'english_written100', 3),
  S('108', 'ইংরেজি ২য় পত্র', 'English 2nd Paper', ALL, true, 'english_written100', 4),
  S('109', 'গণিত', 'Mathematics', ALL, true, 'cq70_mcq30', 5),
  S('154', 'তথ্য ও যোগাযোগ প্রযুক্তি', 'ICT', ALL, true, 'ict_th50_prac50', 6),
  S('111', 'ইসলাম ও নৈতিক শিক্ষা', 'Islam and Moral Education', ALL, true, 'cq70_mcq30', 7),
  S('112', 'হিন্দুধর্ম ও নৈতিক শিক্ষা', 'Hindu Religion and Moral Education', ALL, true, 'cq70_mcq30', 8),
  S('113', 'বৌদ্ধধর্ম ও নৈতিক শিক্ষা', 'Buddhist Religion and Moral Education', ALL, true, 'cq70_mcq30', 9),
  S('114', 'খ্রিষ্টধর্ম ও নৈতিক শিক্ষা', 'Christian Religion and Moral Education', ALL, true, 'cq70_mcq30', 10),
  S('150', 'বাংলাদেশ ও বিশ্বপরিচয়', 'Bangladesh and Global Studies', ['science'], true, 'cq70_mcq30', 11),
  S('136', 'পদার্থবিজ্ঞান', 'Physics', ['science'], false, 'cq50_mcq25_prac25', 20),
  S('137', 'রসায়ন', 'Chemistry', ['science'], false, 'cq50_mcq25_prac25', 21),
  S('138', 'জীববিজ্ঞান', 'Biology', ['science'], false, 'cq50_mcq25_prac25', 22),
  S('126', 'উচ্চতর গণিত', 'Higher Mathematics', ['science'], false, 'cq50_mcq25_prac25', 23),
  S('146', 'হিসাববিজ্ঞান', 'Accounting', ['business'], false, 'cq70_mcq30', 30),
  S('152', 'ফিন্যান্স ও ব্যাংকিং', 'Finance and Banking', ['business'], false, 'cq70_mcq30', 31),
  S('143', 'ব্যবসায় উদ্যোগ', 'Business Entrepreneurship', ['business'], false, 'cq70_mcq30', 32),
  S('127', 'বিজ্ঞান', 'General Science', ['business', 'humanities'], false, 'cq70_mcq30', 33),
  S('110', 'ভূগোল ও পরিবেশ', 'Geography and Environment', ['humanities'], false, 'cq70_mcq30', 40),
  S('140', 'পৌরনীতি ও নাগরিকতা', 'Civics and Citizenship', ['humanities'], false, 'cq70_mcq30', 41),
  S('141', 'অর্থনীতি', 'Economics', ['humanities'], false, 'cq70_mcq30', 42),
  S('153', 'বাংলাদেশের ইতিহাস ও বিশ্বসভ্যতা', 'History of Bangladesh and World Civilisation', ['humanities'], false, 'cq70_mcq30', 43),
  S('134', 'কৃষিশিক্ষা', 'Agriculture Studies', [], false, 'cq50_mcq25_prac25', 50),
  S('151', 'গার্হস্থ্য বিজ্ঞান', 'Home Science', [], false, 'cq50_mcq25_prac25', 51),
]
// Bangladesh and Global Studies is compulsory for every group.
SUBJECTS.find((s) => s.code === '150')!.groups = ALL

export const RELIGION_CODES = ['111', '112', '113', '114']

/** Subjects a student may take as 4th (optional) subject, by group. */
export const FOURTH_SUBJECT_OPTIONS: Record<Group, string[]> = {
  science: ['126', '138', '134', '151'],
  business: ['134', '151', '141'],
  humanities: ['141', '134', '151'],
}

/** Group subjects for each group (before the 4th subject is removed from the list). */
export const GROUP_SUBJECTS: Record<Group, string[]> = {
  science: ['136', '137', '138', '126'],
  business: ['146', '152', '143', '127'],
  humanities: ['110', '140', '141', '153', '127'],
}

export function subjectByCode(code: string): Subject | undefined {
  return SUBJECTS.find((s) => s.code === code)
}

/**
 * The student's subject list: compulsory (with their one religion) + group subjects
 * + 4th subject. The 4th subject is flagged so GPA can apply the 4th-subject rule.
 */
export function studentSubjects(opts: {
  group: Group
  fourth: string
  religion?: string
}): { code: string; fourth: boolean }[] {
  const religion = opts.religion ?? '111'
  const compulsory = ['101', '102', '107', '108', '109', '154', religion, '150']
  let groupCodes = GROUP_SUBJECTS[opts.group].filter((c) => c !== opts.fourth)
  // Humanities lists five group subjects; a student who takes Economics as 4th has four left.
  if (opts.group === 'humanities' && groupCodes.length > 4) groupCodes = groupCodes.filter((c) => c !== '141')
  const out = [...compulsory, ...groupCodes].map((code) => ({ code, fourth: false }))
  out.push({ code: opts.fourth, fourth: true })
  return out
}
