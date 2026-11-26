// AI tutor (online only). Chat scoped to the SSC syllabus, with four tools over Alo's own
// content and the student's progress, and photo marking of handwritten creative answers.
//
// Secrets (Supabase dashboard -> Edge Functions -> Secrets, never the client):
//   ANTHROPIC_API_KEY; optional TUTOR_DAILY_MESSAGES (default 20), TUTOR_DAILY_PHOTOS (default 5).
// Built-ins: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
// Anthropic's API does not train on API inputs or outputs by default; we send no names or contact details.
import Anthropic from 'npm:@anthropic-ai/sdk@1.14.0'
import { createClient } from 'npm:@supabase/supabase-js@2.45.4'
import {
  DEFAULT_LIMITS, HISTORY_TURNS, MARK_SCHEMA, MAX_TOOL_ROUNDS, MODEL, PHOTO_BUCKET, PHOTO_MAX_BYTES, TOOLS,
  defaultParts, limitFrom, markingAsText, markingPrompt, mediaTypeOf, normaliseMarking, parseRequest, parseStored,
  parseToolInput, photoPathOk, refusalText, scenesToNotes, systemPrompt,
  type ChatRequest, type Lang, type MarkRequest, type Part, type Rubric, type ToolInput,
} from '../_shared/tutor-logic.ts'

const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } })
const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY') })
const LIMITS = {
  messages: limitFrom(Deno.env.get('TUTOR_DAILY_MESSAGES'), DEFAULT_LIMITS.messages),
  photos: limitFrom(Deno.env.get('TUTOR_DAILY_PHOTOS'), DEFAULT_LIMITS.photos),
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } })
const fail = (code: string, status: number, extra: Record<string, unknown> = {}) => json({ error: code, ...extra }, status)

interface Profile { medium: Lang; group: string | null }

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST') return fail('method', 405)

  // Who is asking: a signed-in student (guests can't use the tutor).
  const token = req.headers.get('Authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) return fail('sign_in', 401)
  const { data: auth } = await sb.auth.getUser(token)
  const uid = auth.user?.id
  if (!uid) return fail('sign_in', 401)

  const parsed = parseRequest(await req.json().catch(() => null))
  if ('error' in parsed) return fail(parsed.error, 400)

  // Closed while any SSC paper is being written.
  const { data: locked } = await sb.rpc('exam_in_progress')
  if (locked) return fail('exam_hours', 423)

  const isPhoto = parsed.mode === 'mark'
  if (isPhoto && !photoPathOk(uid, parsed.image_path)) return fail('bad_photo', 400)
  const { data: quota, error: qErr } = await sb.rpc('tutor_take', { uid, is_photo: isPhoto, max_messages: LIMITS.messages, max_photos: LIMITS.photos })
  if (qErr) return fail('server', 500)
  if (!quota.ok) return fail('limit', 429, { messages_left: quota.messages_left, photos_left: quota.photos_left, limits: LIMITS })

  let tokensIn = 0, tokensOut = 0
  try {
    const { data: prof } = await sb.from('profiles').select('medium, "group"').eq('id', uid).maybeSingle()
    const profile: Profile = { medium: (prof?.medium as Lang) ?? parsed.lang, group: (prof?.group as string | null) ?? null }
    const threadId = await ensureThread(uid, parsed.thread_id, parsed.subject_code)
    if (!threadId) { await settle(uid, isPhoto, true, 0, 0); return fail('bad_thread', 404) }

    const result = parsed.mode === 'mark' ? await mark(uid, parsed, profile) : await chat(uid, threadId, parsed, profile)
    tokensIn = result.tokensIn; tokensOut = result.tokensOut

    await sb.from('tutor_messages').insert([
      { thread_id: threadId, role: 'user', content: result.userContent, image_path: isPhoto ? (parsed as MarkRequest).image_path : null },
      { thread_id: threadId, role: 'assistant', content: result.reply, tokens_in: tokensIn, tokens_out: tokensOut },
    ])
    await sb.from('tutor_threads').update({ updated_at: new Date().toISOString() }).eq('id', threadId)
    await settle(uid, isPhoto, false, tokensIn, tokensOut)
    return json({
      thread_id: threadId,
      reply: result.reply,
      marking: parseStored(result.reply),
      messages_left: quota.messages_left,
      photos_left: quota.photos_left,
    })
  } catch (e) {
    // Give the unit back: the student didn't get an answer.
    await settle(uid, isPhoto, true, tokensIn, tokensOut)
    if (e instanceof Anthropic.RateLimitError || e instanceof Anthropic.InternalServerError) return fail('busy', 503)
    if (e instanceof Anthropic.APIError) { console.error('anthropic', e.status, e.message); return fail('model', 502) }
    console.error(e)
    return fail('server', 500)
  }
})

async function settle(uid: string, isPhoto: boolean, refund: boolean, tIn: number, tOut: number) {
  await sb.rpc('tutor_settle', { uid, is_photo: isPhoto, refund, t_in: tIn, t_out: tOut })
}

async function ensureThread(uid: string, threadId: string | undefined, subject?: string): Promise<string | null> {
  if (threadId) {
    const { data } = await sb.from('tutor_threads').select('id').eq('id', threadId).eq('user_id', uid).maybeSingle()
    return data?.id ?? null
  }
  const { data } = await sb.from('tutor_threads').insert({ user_id: uid, subject_code: subject ?? null }).select('id').single()
  return data?.id ?? null
}

const usageOf = (u: Anthropic.Usage) => ({
  tin: u.input_tokens + (u.cache_read_input_tokens ?? 0) + (u.cache_creation_input_tokens ?? 0),
  tout: u.output_tokens,
})

// ---------------------------------------------------------------------------
// Chat with tools
// ---------------------------------------------------------------------------
async function chat(uid: string, threadId: string, r: ChatRequest, profile: Profile) {
  const subjectName = r.subject_code ? await subjectTitle(r.subject_code, r.lang) : undefined
  // Earlier turns as plain text (no thinking blocks are carried between requests).
  const { data: past } = await sb.from('tutor_messages').select('role, content').eq('thread_id', threadId)
    .order('created_at', { ascending: false }).limit(HISTORY_TURNS)
  // Keep strict user/assistant alternation, starting with the student, even if an earlier save was partial.
  const turns: { role: 'user' | 'assistant'; text: string }[] = []
  for (const m of (past ?? []).reverse()) {
    const marking = parseStored(m.content)
    const text = marking ? markingAsText(marking) : m.content
    const role = m.role as 'user' | 'assistant'
    const last = turns[turns.length - 1]
    if (last && last.role === role) last.text += `\n\n${text}`
    else if (last || role === 'user') turns.push({ role, text })
  }
  if (turns[turns.length - 1]?.role === 'user') turns.pop()
  const messages: Anthropic.MessageParam[] = turns.map((t) => ({ role: t.role, content: t.text }))
  messages.push({ role: 'user', content: r.text })

  const system = systemPrompt({ lang: r.lang, subjectName, medium: profile.medium, group: profile.group ?? undefined })
  let tokensIn = 0, tokensOut = 0
  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const res = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 4096,
      thinking: { type: 'adaptive' },
      output_config: { effort: 'low' },
      system,
      tools: TOOLS,
      messages,
    })
    const u = usageOf(res.usage); tokensIn += u.tin; tokensOut += u.tout
    if (res.stop_reason === 'refusal') return { reply: refusalText(r.lang), userContent: r.text, tokensIn, tokensOut }
    const calls = res.content.filter((b): b is Anthropic.ToolUseBlock => b.type === 'tool_use')
    if (res.stop_reason !== 'tool_use' || !calls.length) {
      const reply = res.content.filter((b): b is Anthropic.TextBlock => b.type === 'text').map((b) => b.text).join('\n\n').trim()
      return { reply: reply || refusalText(r.lang), userContent: r.text, tokensIn, tokensOut }
    }
    messages.push({ role: 'assistant', content: res.content })
    const results: Anthropic.ToolResultBlockParam[] = []
    for (const c of calls) {
      const input = parseToolInput(c.name, c.input)
      if ('error' in input) { results.push({ type: 'tool_result', tool_use_id: c.id, is_error: true, content: input.error }); continue }
      try {
        results.push({ type: 'tool_result', tool_use_id: c.id, content: JSON.stringify(await runTool(uid, input, profile.medium)) })
      } catch (e) {
        results.push({ type: 'tool_result', tool_use_id: c.id, is_error: true, content: `Tool failed: ${(e as Error).message}` })
      }
    }
    messages.push({ role: 'user', content: results })
  }
  return { reply: r.lang === 'bn' ? 'উত্তর খুঁজতে অনেক সময় লাগছে। প্রশ্নটা একটু ছোট করে আবার জিজ্ঞেস করো।' : 'That took too many steps. Try asking a shorter question.', userContent: r.text, tokensIn, tokensOut }
}

async function subjectTitle(code: string, lang: Lang) {
  const { data } = await sb.from('subjects').select('name_bn, name_en').eq('code', code).maybeSingle()
  return data ? (lang === 'bn' ? data.name_bn : data.name_en) : undefined
}

async function runTool(uid: string, t: ToolInput, medium: Lang): Promise<unknown> {
  switch (t.name) {
    case 'search_lessons': {
      const { data, error } = await sb.rpc('tutor_search', { q: t.query, subj: t.subject_code ?? null, lim: 8 })
      if (error) throw new Error(error.message)
      return data?.length ? data : { results: [], note: 'Nothing found in the app for that. Answer from the syllabus, and say the app has no lesson on it yet.' }
    }
    case 'get_chapter_notes': {
      const { data: ch } = await sb.from('chapters').select('id, subject_code, number, title_bn, title_en').eq('id', t.chapter_id).maybeSingle()
      if (!ch) return { error: 'No such chapter.' }
      const { data: lessons } = await sb.from('lessons').select('id, title_bn, title_en, medium').eq('chapter_id', ch.id).eq('published', true).order('sort')
      const mine = (lessons ?? []).filter((l) => l.medium === medium)
      const use = mine.length ? mine : lessons ?? []
      const { data: scenes } = use.length ? await sb.from('lesson_scenes').select('lesson_id, idx, type, body_json').in('lesson_id', use.map((l) => l.id)) : { data: [] }
      return {
        chapter: { id: ch.id, subject_code: ch.subject_code, number: ch.number, title: medium === 'bn' ? ch.title_bn : ch.title_en },
        notes: scenesToNotes(use.map((l) => ({ title: medium === 'bn' ? l.title_bn : l.title_en, scenes: (scenes ?? []).filter((s) => s.lesson_id === l.id) }))) || 'No lesson notes yet for this chapter.',
      }
    }
    case 'get_student_progress': {
      let chq = sb.from('chapters').select('id, subject_code, number, title_bn, title_en, board_freq_5y')
      if (t.subject_code) chq = chq.eq('subject_code', t.subject_code)
      const { data: chapters } = await chq
      const byId = new Map((chapters ?? []).map((c) => [c.id, c]))
      const { data: mastery } = await sb.from('mastery').select('chapter_id, score, updated_at').eq('user_id', uid).eq('deleted', false)
        .order('updated_at', { ascending: false }).limit(400)
      const seen = new Set<string>()
      const rows = (mastery ?? []).filter((m) => byId.has(m.chapter_id) && !seen.has(m.chapter_id) && seen.add(m.chapter_id)).map((m) => {
        const c = byId.get(m.chapter_id)!
        return { subject_code: c.subject_code, chapter: c.number, title: medium === 'bn' ? c.title_bn : c.title_en, mastery: Math.round(Number(m.score)), asked_in_boards_5y: c.board_freq_5y }
      }).sort((a, b) => a.mastery - b.mastery).slice(0, 25)
      let mq = sb.from('mock_results').select('subject_code, mcq_score, cq_score, total, submitted_at').eq('user_id', uid).eq('deleted', false).not('submitted_at', 'is', null)
      if (t.subject_code) mq = mq.eq('subject_code', t.subject_code)
      const { data: mocks } = await mq.order('submitted_at', { ascending: false }).limit(5)
      return { weakest_first: rows, chapters_not_started: Math.max(0, byId.size - seen.size), recent_mocks: mocks ?? [] }
    }
    case 'get_method_sheet': {
      let q = sb.from('method_sheets').select('question_type, medium, chapter_id, body_md').eq('subject_code', t.subject_code)
      if (t.question_type) q = q.ilike('question_type', `%${t.question_type}%`)
      const { data } = await q.limit(20)
      const list = data ?? []
      const best = list.find((m) => m.chapter_id === t.chapter_id && m.medium === medium) ?? list.find((m) => !m.chapter_id && m.medium === medium) ?? list.find((m) => m.medium === medium) ?? list[0]
      return best ? { question_type: best.question_type, sheet: best.body_md.slice(0, 5000) } : { error: 'No method sheet for that yet.' }
    }
  }
}

// ---------------------------------------------------------------------------
// Photo marking
// ---------------------------------------------------------------------------
async function mark(_uid: string, r: MarkRequest, profile: Profile) {
  const { data: blob, error } = await sb.storage.from(PHOTO_BUCKET).download(r.image_path)
  if (error || !blob) throw new Error('photo not found')
  if (blob.size > PHOTO_MAX_BYTES) throw new Error('photo too large')
  const data = base64(new Uint8Array(await blob.arrayBuffer()))

  let stem: string | undefined
  let rubric: Rubric[] = defaultParts(r.subject_code)
  if (r.question_id) {
    const { data: q } = await sb.from('questions').select('stem, kind, marks_json, answer_json').eq('id', r.question_id).eq('published', true).maybeSingle()
    if (q?.kind === 'cq' && Array.isArray(q.marks_json)) {
      stem = q.stem
      const answers = (Array.isArray(q.answer_json) ? q.answer_json : []) as { part: Part; model: string; rubric: { points: number; criterion: string }[] }[]
      rubric = (q.marks_json as { part: Part; marks: number; prompt: string }[]).map((p) => {
        const a = answers.find((x) => x.part === p.part)
        return { part: p.part, marks: p.marks, prompt: p.prompt, model: a?.model, criteria: a?.rubric }
      })
    }
  }

  const res = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 6000,
    thinking: { type: 'adaptive' },
    output_config: { effort: 'medium', format: { type: 'json_schema', schema: MARK_SCHEMA } },
    system: systemPrompt({ lang: r.lang, medium: profile.medium, group: profile.group ?? undefined }),
    messages: [{
      role: 'user',
      content: [
        { type: 'image', source: { type: 'base64', media_type: mediaTypeOf(r.image_path), data } },
        { type: 'text', text: markingPrompt({ lang: r.lang, stem, questionText: r.question_text, rubric }) },
      ],
    }],
  })
  const u = usageOf(res.usage)
  const userContent = r.question_text ?? (stem ? stem.slice(0, 300) : '')
  if (res.stop_reason === 'refusal') return { reply: refusalText(r.lang), userContent, tokensIn: u.tin, tokensOut: u.tout }
  const text = res.content.filter((b): b is Anthropic.TextBlock => b.type === 'text').map((b) => b.text).join('')
  let raw: unknown = null
  try { raw = JSON.parse(text) } catch { /* handled below */ }
  const marking = normaliseMarking(raw, rubric)
  if (!marking) throw new Error('marking output was not valid')
  return { reply: JSON.stringify(marking), userContent, tokensIn: u.tin, tokensOut: u.tout }
}

function base64(bytes: Uint8Array) {
  let s = ''
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  return btoa(s)
}
