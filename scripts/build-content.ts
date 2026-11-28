// Builds seed content from content/*.ts into:
//   public/content/index.json                    subjects, chapters, exam config, routine, pack list
//   public/content/chapters/<id>.<medium>.json   one offline pack per chapter and medium
//   supabase/seed.sql                            the same rows for Postgres
// Ids are deterministic (name-based), so re-running never creates duplicates.
// Usage: npx tsx scripts/build-content.ts
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { SUBJECTS } from '../src/data/catalog'
import { SEED_EXAM_CONFIG, SEED_ROUTINE } from '../src/data/exam'
import type {
  MockRow, MockSummary,
  ChapterPack, ChapterRow, ContentIndex, CqAnswer, CqPart, LessonRow, MethodSheetRow, QuestionRow, SceneBody, SceneRow,
} from '../src/data/content-types'
import { CHAPTERS } from '../content/chapters'
import { CHAPTER_CONTENT } from '../content/index'
import { CQ_MARKS, type Bi, type MockSrc, type SceneSrc } from '../content/types'
import { MOCKS } from '../content/index'
import { generate } from '../src/lib/drill'

const MEDIA = ['bn', 'en'] as const
type M = (typeof MEDIA)[number]
const SYLLABUS_YEAR = 2027
const STAMP = '2026-11-26T00:00:00Z'

/** Name-based UUID (v5 layout over SHA-1). */
export function idFor(name: string): string {
  const h = createHash('sha1').update(`alo:${name}`).digest()
  h[6] = (h[6] & 0x0f) | 0x50
  h[8] = (h[8] & 0x3f) | 0x80
  const x = h.subarray(0, 16).toString('hex')
  return `${x.slice(0, 8)}-${x.slice(8, 12)}-${x.slice(12, 16)}-${x.slice(16, 20)}-${x.slice(20, 32)}`
}
const hash = (s: string) => createHash('sha1').update(s).digest('hex').slice(0, 12)
const L = (b: Bi, m: M) => b[m]

// ---------------------------------------------------------------- chapters
const chapters: ChapterRow[] = []
for (const [subject_code, list] of Object.entries(CHAPTERS)) {
  for (const c of list) {
    chapters.push({
      id: idFor(`chapter:${subject_code}:${c.number}:${SYLLABUS_YEAR}`), subject_code, number: c.number,
      title_bn: c.title.bn, title_en: c.title.en, syllabus_year: SYLLABUS_YEAR, board_freq_5y: 0, sort: c.number,
    })
  }
}
const chapterId = (code: string, n: number) => {
  const c = chapters.find((x) => x.subject_code === code && x.number === n)
  if (!c) throw new Error(`No chapter ${code}/${n}`)
  return c.id
}

// ---------------------------------------------------------------- scenes
function sceneBody(s: SceneSrc, m: M): SceneBody {
  const base: SceneBody = { title: L(s.title, m) }
  switch (s.type) {
    case 'text': return { ...base, bullets: s.bullets.map((b) => L(b, m)), svg: s.diagram }
    case 'formula': return { ...base, tex: s.tex, bullets: s.bullets.map((b) => L(b, m)) }
    case 'diagram': return { ...base, svg: s.svg, bullets: s.bullets.map((b) => L(b, m)) }
    case 'worked_step': return { ...base, problem: L(s.problem, m), steps: s.steps.map((st) => ({ tex: st.tex, text: st.text && L(st.text, m) })) }
    case 'question': return {
      ...base,
      question: { stem: L(s.question.stem, m), options: s.question.options.map((o) => L(o, m)), answer: s.question.answer, explanation: L(s.question.explanation, m) },
    }
  }
}

/** Rough narration length until real audio exists: ~13 characters per second of speech. */
const estSeconds = (text: string) => Math.max(8, Math.round(text.length / 13))

// ---------------------------------------------------------------- narration audio
// Narration audio, encoded as Opus, mono, 24 kbps (~3 KB per second).
// With GOOGLE_TTS_API_KEY set, narration is recorded with Google's neural voices (TTS_VOICE_BN /
// TTS_VOICE_EN override the defaults). Without it, existing Google recordings are reused and only
// scenes that have none fall back to espeak-ng as a placeholder. Files are named by a hash of the
// caption (and voice) so a changed caption gets new audio, and unchanged audio is never rebuilt.
const AUDIO_DIR = 'public/content/audio'
const hasTool = (cmd: string, flag = '--version') => { try { execFileSync(cmd, [flag], { stdio: 'ignore' }); return true } catch { return false } }
const CAN_TTS = hasTool('espeak-ng') && hasTool('ffmpeg', '-version')
if (!CAN_TTS) console.warn('espeak-ng/ffmpeg not found: keeping existing audio, new scenes get none')
const GOOGLE = !!process.env.GOOGLE_TTS_API_KEY && hasTool('ffmpeg', '-version')
const VOICE: Record<M, string> = {
  bn: process.env.TTS_VOICE_BN || 'bn-IN-Chirp3-HD-Aoede',
  en: process.env.TTS_VOICE_EN || 'en-IN-Chirp3-HD-Aoede',
}
let googleCount = 0
const usedAudio = new Set<string>()

function narrationAudio(lessonId: string, idx: number, text: string, m: M): { path: string; seconds: number; bytes: number } | null {
  const neuralRel = `${lessonId}/${idx}-g${hash(VOICE[m] + m + text).slice(0, 8)}.opus`
  const neuralFile = `${AUDIO_DIR}/${neuralRel}`
  if (!existsSync(neuralFile) && GOOGLE) {
    mkdirSync(`${AUDIO_DIR}/${lessonId}`, { recursive: true })
    const wav = `${neuralFile}.wav`
    execFileSync(process.execPath, ['scripts/tts-google.mjs', VOICE[m], wav], { input: text, stdio: ['pipe', 'inherit', 'inherit'] })
    execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', wav, '-ac', '1', '-ar', '24000', '-c:a', 'libopus', '-b:a', '24k', '-application', 'voip', neuralFile])
    rmSync(wav)
    googleCount++
  }
  const useNeural = existsSync(neuralFile)
  const rel = useNeural ? neuralRel : `${lessonId}/${idx}-${hash(m + text).slice(0, 8)}.opus`
  const file = `${AUDIO_DIR}/${rel}`
  if (!existsSync(file)) {
    if (!CAN_TTS) return null
    mkdirSync(`${AUDIO_DIR}/${lessonId}`, { recursive: true })
    const wav = `${file}.wav`
    execFileSync('espeak-ng', ['-v', m === 'bn' ? 'bn' : 'en-gb', '-s', m === 'bn' ? '140' : '150', '-w', wav, text])
    execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', wav, '-ac', '1', '-ar', '24000', '-c:a', 'libopus', '-b:a', '24k', '-application', 'voip', file])
    rmSync(wav)
  }
  usedAudio.add(file)
  const seconds = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]).toString().trim())
  return { path: `content/audio/${rel}`, seconds: Math.round(seconds * 10) / 10, bytes: statSync(file).size }
}

// ---------------------------------------------------------------- packs
const packs: ChapterPack[] = []
for (const cc of CHAPTER_CONTENT) {
  const cid = chapterId(cc.subject_code, cc.number)
  for (const m of MEDIA) {
    const lessons = cc.lessons.map((ls, li) => {
      const id = idFor(`lesson:${ls.key}:${m}`)
      let seconds = 0
      let bytes = 0
      const scenes: SceneRow[] = ls.scenes.map((s, idx) => {
        const audio = narrationAudio(id, idx, L(s.narration, m), m)
        seconds += audio?.seconds ?? estSeconds(L(s.narration, m))
        bytes += audio?.bytes ?? 0
        return {
          id: idFor(`scene:${ls.key}:${m}:${idx}`), lesson_id: id, idx, type: s.type,
          body_json: sceneBody(s, m), audio_path: audio?.path ?? null, captions: L(s.narration, m),
        }
      })
      const row: LessonRow & { scenes: SceneRow[] } = {
        id, chapter_id: cid, title_bn: ls.title.bn, title_en: ls.title.en, medium: m,
        duration_s: Math.round(seconds), size_bytes: bytes, version: 1, published: true, sort: li, scenes,
      }
      // Hard budget: a 10-minute lesson stays under 3 MB (scaled by length).
      const budget = 3 * 1024 * 1024 * Math.max(1, seconds / 600)
      if (bytes > budget) throw new Error(`${id}: audio ${bytes} bytes over budget ${budget}`)
      return row
    })
    const questions: QuestionRow[] = [
      ...cc.mcqs.map((q): QuestionRow => ({
        id: idFor(`q:${cc.subject_code}:${cc.number}:${q.key}:${m}`), chapter_id: cid, kind: 'mcq', subtype: q.subtype, medium: m,
        stem: L(q.stem, m),
        options_json: { options: q.options.map((o) => L(o, m)), ...(q.context ? { context: L(q.context, m) } : {}) },
        answer_json: { index: q.answer }, explanation: L(q.explanation, m), marks_json: null,
        source: 'original', board: null, year: null, difficulty: q.difficulty, tags: q.tags, published: true,
      })),
      ...cc.cqs.map((q): QuestionRow => ({
        id: idFor(`q:${cc.subject_code}:${cc.number}:${q.key}:${m}`), chapter_id: cid, kind: 'cq', subtype: 'cq', medium: m,
        stem: L(q.stem, m), options_json: null,
        marks_json: q.parts.map((p): CqPart => ({ part: p.part, marks: CQ_MARKS[p.part], prompt: L(p.prompt, m) })),
        answer_json: q.parts.map((p): CqAnswer => ({ part: p.part, model: L(p.model, m), rubric: p.rubric.map((r) => ({ points: r.points, criterion: L(r.criterion, m) })) })),
        explanation: null, source: 'original', board: null, year: null, difficulty: q.difficulty, tags: q.tags, published: true,
      })),
    ]
    const method_sheets: MethodSheetRow[] = cc.methodSheets.map((ms) => ({
      id: idFor(`ms:${ms.key}:${m}`), subject_code: cc.subject_code, chapter_id: cid, question_type: ms.question_type, medium: m, body_md: L(ms.body, m),
    }))
    const drill_templates = (cc.drills ?? []).map((d) => ({
      id: idFor(`drill:${d.key}`), chapter_id: cid, title: d.title.en, vars_json: d.vars, constraints_json: d.constraints,
      solution_js: JSON.stringify({ title: d.title, ...d.script }), version: 1,
    }))
    const body = { chapter_id: cid, medium: m, lessons, questions, method_sheets, drill_templates }
    packs.push({ ...body, version: hash(JSON.stringify(body)) })
  }
}

// ---------------------------------------------------------------- validation
for (const p of packs) {
  for (const q of p.questions) {
    if (q.kind === 'mcq') {
      if (q.options_json!.options.length !== 4) throw new Error(`${q.id}: MCQ needs 4 options`)
      const idx = (q.answer_json as { index: number }).index
      if (idx < 0 || idx > 3) throw new Error(`${q.id}: bad answer index`)
    } else if (q.kind === 'cq') {
      for (const a of q.answer_json as CqAnswer[]) {
        const marks = CQ_MARKS[a.part]
        const pts = a.rubric.reduce((t, r) => t + r.points, 0)
        if (pts !== marks) throw new Error(`${q.id} part ${a.part}: rubric ${pts} != marks ${marks}`)
      }
    }
  }
  for (const l of p.lessons) {
    const n = l.scenes.length
    if (n < 8 || n > 10) throw new Error(`${l.id}: lesson needs 8-10 scenes, has ${n}`)
    // A check-yourself question at least every 3 scenes.
    let gap = 0
    for (const s of l.scenes) { gap = s.type === 'question' ? 0 : gap + 1; if (gap > 3 && s.idx < n - 1) throw new Error(`${l.id}: no question near scene ${s.idx}`) }
  }
}

for (const p of packs) for (const d of p.drill_templates) {
  for (let seed = 1; seed <= 50; seed++) for (const m of MEDIA) generate(d as never, m, seed)
}

// ---------------------------------------------------------------- mocks
function buildMock(src: MockSrc, m: M): MockRow {
  const id = idFor(`mock:${src.key}:${m}`)
  return {
    id, subject_code: src.subject_code, title: L(src.title, m), medium: m, exam_year: src.exam_year,
    duration_mcq_min: src.duration_mcq_min, duration_cq_min: src.duration_cq_min, published: true,
    paper_json: {
      marks: src.marks, cq_rules: src.cq_rules,
      mcq: src.mcqs.map((q) => ({
        id: idFor(`mock:${src.key}:${q.key}:${m}`), subtype: q.subtype, ...(q.context ? { context: L(q.context, m) } : {}),
        stem: L(q.stem, m), options: q.options.map((o) => L(o, m)), answer: q.answer, explanation: L(q.explanation, m),
      })),
      sections: src.sections.map((sec) => ({
        key: sec.key, title: L(sec.title, m),
        cqs: sec.cqs.map((c) => ({
          id: idFor(`mock:${src.key}:${c.key}:${m}`), stem: L(c.stem, m),
          parts: c.parts.map((pt) => ({
            part: pt.part, marks: pt.marks, prompt: L(pt.prompt, m), model: L(pt.model, m),
            rubric: pt.rubric.map((r) => ({ points: r.points, criterion: L(r.criterion, m) })),
          })),
        })),
      })),
    },
  }
}
const mocks = MOCKS.flatMap((src) => MEDIA.map((m) => buildMock(src, m)))
for (const mk of mocks) {
  const p = mk.paper_json
  if (p.mcq.length !== p.marks.mcq) throw new Error(`${mk.id}: ${p.mcq.length} MCQs for ${p.marks.mcq} marks`)
  for (const q of p.mcq) if (q.options.length !== 4 || q.answer < 0 || q.answer > 3) throw new Error(`${q.id}: bad MCQ`)
  const cqs = p.sections.flatMap((s) => s.cqs)
  for (const c of cqs) for (const pt of c.parts) {
    const pts = pt.rubric.reduce((t, r) => t + r.points, 0)
    if (pts !== pt.marks) throw new Error(`${c.id} part ${pt.part}: rubric ${pts} != marks ${pt.marks}`)
  }
  const per = cqs.map((c) => c.parts.reduce((t, pt) => t + pt.marks, 0))
  if (new Set(per).size !== 1 || per[0] * p.cq_rules.answer !== p.marks.cq) throw new Error(`${mk.id}: CQ marks don't add up to ${p.marks.cq}`)
  if (p.sections.length * p.cq_rules.min_per_section > p.cq_rules.answer) throw new Error(`${mk.id}: section minimums exceed answer count`)
  if (p.sections.some((s) => s.cqs.length < p.cq_rules.min_per_section)) throw new Error(`${mk.id}: a section has too few CQs`)
}

// ---------------------------------------------------------------- write JSON
const routine = SEED_ROUTINE.map((r) => ({ ...r, id: idFor(`routine:${r.exam_year}:${r.subject_code}:${r.paper}`) }))
rmSync('public/content/chapters', { recursive: true, force: true })
mkdirSync('public/content/chapters', { recursive: true })
// Remove narration files no scene uses any more.
if (CAN_TTS && existsSync(AUDIO_DIR)) {
  for (const d of readdirSync(AUDIO_DIR)) for (const f of readdirSync(`${AUDIO_DIR}/${d}`)) {
    if (!usedAudio.has(`${AUDIO_DIR}/${d}/${f}`)) rmSync(`${AUDIO_DIR}/${d}/${f}`)
  }
}
const packIndex: ContentIndex['packs'] = {}
for (const p of packs) {
  const json = JSON.stringify(p)
  writeFileSync(`public/content/chapters/${p.chapter_id}.${p.medium}.json`, json)
  packIndex[p.chapter_id] ??= {}
  packIndex[p.chapter_id][p.medium] = {
    version: p.version, bytes: Buffer.byteLength(json), lessons: p.lessons.length,
    mcq: p.questions.filter((q) => q.kind === 'mcq').length, cq: p.questions.filter((q) => q.kind === 'cq').length,
  }
}
rmSync('public/content/mocks', { recursive: true, force: true })
mkdirSync('public/content/mocks', { recursive: true })
const mockIndex: MockSummary[] = mocks.map(({ paper_json, ...rest }) => {
  const json = JSON.stringify({ ...rest, paper_json })
  writeFileSync(`public/content/mocks/${rest.id}.json`, json)
  return { ...rest, version: hash(json), bytes: Buffer.byteLength(json), mcq: paper_json.mcq.length, cq: paper_json.sections.reduce((t, s) => t + s.cqs.length, 0) }
})
const indexBody = {
  subjects: SUBJECTS, chapters, packs: packIndex, exam_config: [SEED_EXAM_CONFIG], routine, notices: [], mocks: mockIndex,
}
const index: ContentIndex = { version: hash(JSON.stringify(indexBody)), ...indexBody }
writeFileSync('public/content/index.json', JSON.stringify(index))

// ---------------------------------------------------------------- write SQL
const lit = (v: unknown, col = ''): string => {
  if (col.endsWith('_json') && v !== null && v !== undefined) return `${lit(JSON.stringify(v))}::jsonb`
  if (v === null || v === undefined) return 'null'
  if (typeof v === 'number' || typeof v === 'boolean') return String(v)
  if (Array.isArray(v) && v.every((x) => typeof x === 'string')) return `array[${v.map((x) => lit(x)).join(',')}]::text[]`
  if (typeof v === 'object') return `${lit(JSON.stringify(v))}::jsonb`
  return `'${String(v).replace(/'/g, "''")}'`
}
function insert(table: string, rows: object[], conflict: string): string {
  if (!rows.length) return ''
  const cols = Object.keys(rows[0])
  const vals = rows.map((r) => `(${cols.map((c) => lit((r as Record<string, unknown>)[c], c)).join(', ')})`).join(',\n')
  const upd = cols.filter((c) => !conflict.split(',').includes(c)).map((c) => `${c === 'group' ? '"group"' : c} = excluded.${c}`).join(', ')
  return `insert into public.${table} (${cols.join(', ')}) values\n${vals}\non conflict (${conflict}) do update set ${upd};\n\n`
}
const allLessons = packs.flatMap((p) => p.lessons)
let sql = `-- Generated by scripts/build-content.ts. Do not edit by hand.\n-- Seeded 2027 routine dates are UNVERIFIED until an admin checks them against the board PDF.\nbegin;\n\n`
sql += insert('subjects', SUBJECTS, 'code')
sql += insert('chapters', chapters, 'id')
sql += insert('exam_config', [SEED_EXAM_CONFIG], 'exam_year')
sql += insert('routine', routine, 'id')
sql += insert('lessons', allLessons.map(({ scenes: _s, ...l }) => l), 'id')
sql += insert('lesson_scenes', allLessons.flatMap((l) => l.scenes), 'id')
sql += insert('questions', packs.flatMap((p) => p.questions), 'id')
sql += insert('method_sheets', packs.flatMap((p) => p.method_sheets), 'id')
sql += insert('drill_templates', [...new Map(packs.flatMap((p) => p.drill_templates).map((d) => [d.id, d])).values()], 'id')
sql += insert('mocks', mocks, 'id')
sql += 'commit;\n'
writeFileSync('supabase/seed.sql', sql)

for (const mk of mockIndex) console.log(`  mock ${mk.title} (${mk.medium}): ${mk.mcq} MCQ, ${mk.cq} CQ, ${(mk.bytes / 1024).toFixed(1)} KB`)
if (GOOGLE) console.log(`neural voice: ${googleCount} new recordings (${VOICE.bn}, ${VOICE.en})`)
console.log(`subjects ${SUBJECTS.length}, chapters ${chapters.length}, packs ${packs.length}, lessons ${allLessons.length}, questions ${packs.reduce((t, p) => t + p.questions.length, 0)}`)
for (const p of packs) {
  const audio = p.lessons.reduce((t, l) => t + l.size_bytes, 0)
  const secs = p.lessons.reduce((t, l) => t + l.duration_s, 0)
  console.log(`  pack ${p.chapter_id}.${p.medium}: ${(packIndex[p.chapter_id][p.medium]!.bytes / 1024).toFixed(1)} KB json, ${(audio / 1024).toFixed(0)} KB audio, ${Math.round(secs)} s`)
}
void STAMP
