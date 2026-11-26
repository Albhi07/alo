// Online-only features that involve other people: parent links, classes, teacher dashboards,
// admin analytics. Every call needs Supabase and a signed-in user; failures come back as codes.
import type { SupabaseClient } from '@supabase/supabase-js'
import { db, kvGet, kvSet } from '../db'
import { getSupabase } from '../lib/supabase'
import { buildSummary, summaryKey, type MasteryCell, type StudentSummary } from '../lib/summary'
import { computeStudyStats } from './focus'
import { computeReadiness } from './readiness'
import { subjectsFor } from './profile'

export type ConnectError = 'offline' | 'not_configured' | 'sign_in' | 'not_found' | 'too_many' | 'own_code' | 'not_allowed' | 'invalid' | 'server'
export type Result<T> = { data: T } | { error: ConnectError }

async function client(): Promise<{ error: ConnectError } | { sb: SupabaseClient; uid: string }> {
  if (!navigator.onLine) return { error: 'offline' }
  const sb = await getSupabase()
  if (!sb) return { error: 'not_configured' }
  const { data } = await sb.auth.getSession()
  if (!data.session) return { error: 'sign_in' }
  return { sb, uid: data.session.user.id }
}

/** Map a PostgREST / Postgres error to a short code the screens can translate. */
function code(e: { code?: string; message?: string } | null): ConnectError {
  switch (e?.code) {
    case 'P0002': return 'not_found'
    case '42501': return 'not_allowed'
    case '22023': return 'invalid'
    case '28000': return 'sign_in'
    case '54000': return 'too_many'
    default: return e?.message?.includes('row-level security') ? 'not_allowed' : 'server'
  }
}

async function rpc<T>(fn: string, args: Record<string, unknown> = {}): Promise<Result<T>> {
  const c = await client()
  if ('error' in c) return c
  const { data, error } = await c.sb.rpc(fn, args)
  return error ? { error: code(error) } : { data: data as T }
}

// ---------------------------------------------------------------------------
// Student: summary for parents and teachers
// ---------------------------------------------------------------------------

/** Publish this student's summary when it changed. Called after each sync; cheap when nothing changed. */
export async function publishSummary(now = new Date()): Promise<boolean> {
  const profile = (await db.profiles.toArray()).find((p) => p.onboarded)
  if (!profile) return false
  const c = await client()
  if ('error' in c) return false
  const [stats, readiness] = await Promise.all([computeStudyStats(), computeReadiness(profile)])
  const summary = buildSummary({ profile, subjects: subjectsFor(profile).map((s) => s.code), stats, readiness, now })
  const key = summaryKey(summary)
  if ((await kvGet<string | null>('summary.published', null)) === key) return false
  const { error } = await c.sb.from('student_summaries').upsert({ user_id: c.uid, data: summary }, { onConflict: 'user_id' })
  if (error) return false
  await kvSet('summary.published', key)
  return true
}

export const createParentCode = () => rpc<{ code: string; expires_at: string }>('create_parent_code')

export async function myParents(): Promise<Result<{ parent_id: string; created_at: string }[]>> {
  const c = await client()
  if ('error' in c) return c
  const { data, error } = await c.sb.from('parent_links').select('parent_id, created_at').eq('student_id', c.uid)
  return error ? { error: code(error) } : { data: data ?? [] }
}

export async function removeParent(parentId: string): Promise<ConnectError | null> {
  const c = await client()
  if ('error' in c) return c.error
  const { error } = await c.sb.from('parent_links').delete().eq('student_id', c.uid).eq('parent_id', parentId)
  return error ? code(error) : null
}

// ---------------------------------------------------------------------------
// Student: classes
// ---------------------------------------------------------------------------
export interface Assignment { id: string; class_id: string; kind: 'chapter' | 'mock'; ref_id: string; due_on: string | null }
export interface MyClass { id: string; name: string; nickname: string | null; assignments: Assignment[] }

export const joinClass = (joinCode: string, nick: string) => rpc<{ id: string; name: string }>('join_class', { code: joinCode, nick })

export async function myClasses(): Promise<Result<MyClass[]>> {
  const c = await client()
  if ('error' in c) return c
  const { data: mem, error } = await c.sb.from('class_members').select('class_id, nickname').eq('user_id', c.uid)
  if (error) return { error: code(error) }
  const ids = (mem ?? []).map((m) => m.class_id as string)
  if (!ids.length) { await kvSet('classes.mine', []); return { data: [] } }
  const [{ data: cls }, { data: asg }] = await Promise.all([
    c.sb.from('classes').select('id, name').in('id', ids),
    c.sb.from('assignments').select('id, class_id, kind, ref_id, due_on').in('class_id', ids).order('due_on', { ascending: true, nullsFirst: false }),
  ])
  const out = (cls ?? []).map((k) => ({
    id: k.id as string, name: k.name as string,
    nickname: (mem ?? []).find((m) => m.class_id === k.id)?.nickname ?? null,
    assignments: ((asg ?? []) as Assignment[]).filter((a) => a.class_id === k.id),
  }))
  await kvSet('classes.mine', out) // shown offline on Home
  return { data: out }
}

export async function leaveClass(classId: string): Promise<ConnectError | null> {
  const c = await client()
  if ('error' in c) return c.error
  const { error } = await c.sb.from('class_members').delete().eq('class_id', classId).eq('user_id', c.uid)
  return error ? code(error) : null
}

// ---------------------------------------------------------------------------
// Parent
// ---------------------------------------------------------------------------
export interface Child { student_id: string; summary: StudentSummary | null; updated_at: string | null }

export async function linkParent(linkCode: string): Promise<Result<string>> {
  const r = await rpc<{ student_id?: string; error?: string }>('link_parent', { code: linkCode })
  if ('error' in r) return r
  if (r.data.error) return { error: (['not_found', 'too_many', 'own_code', 'sign_in'].includes(r.data.error) ? r.data.error : 'server') as ConnectError }
  return { data: r.data.student_id! }
}

export async function myChildren(): Promise<Result<Child[]>> {
  const c = await client()
  if ('error' in c) return c
  const { data: links, error } = await c.sb.from('parent_links').select('student_id').eq('parent_id', c.uid)
  if (error) return { error: code(error) }
  const ids = (links ?? []).map((l) => l.student_id as string)
  if (!ids.length) return { data: [] }
  const { data: sums } = await c.sb.from('student_summaries').select('user_id, data, updated_at').in('user_id', ids)
  return { data: ids.map((id) => { const s = (sums ?? []).find((x) => x.user_id === id); return { student_id: id, summary: (s?.data as StudentSummary) ?? null, updated_at: s?.updated_at ?? null } }) }
}

export async function unlinkChild(studentId: string): Promise<ConnectError | null> {
  const c = await client()
  if ('error' in c) return c.error
  const { error } = await c.sb.from('parent_links').delete().eq('parent_id', c.uid).eq('student_id', studentId)
  return error ? code(error) : null
}

// ---------------------------------------------------------------------------
// Teacher
// ---------------------------------------------------------------------------
export interface TeacherClass { id: string; name: string; join_code: string; created_at: string }
export interface ClassOverview {
  members: { user_id: string; nickname: string | null; joined: string }[]
  mastery: MasteryCell[]
  mocks: { user_id: string; mock_id: string | null; subject_code: string | null; mcq_score: number | null; cq_score: number | null; total: number | null; submitted_at: string }[]
  summaries: Record<string, StudentSummary>
}

export async function teacherClasses(): Promise<Result<TeacherClass[]>> {
  const c = await client()
  if ('error' in c) return c
  const { data, error } = await c.sb.from('classes').select('id, name, join_code, created_at').eq('teacher_id', c.uid).order('created_at')
  return error ? { error: code(error) } : { data: (data ?? []) as TeacherClass[] }
}

export async function createClass(name: string): Promise<Result<TeacherClass>> {
  const c = await client()
  if ('error' in c) return c
  const trimmed = name.trim()
  if (!trimmed || trimmed.length > 60) return { error: 'invalid' }
  const role = await c.sb.rpc('set_my_role', { r: 'teacher' })
  if (role.error) return { error: code(role.error) }
  const { data, error } = await c.sb.from('classes').insert({ teacher_id: c.uid, name: trimmed }).select('id, name, join_code, created_at').single()
  return error ? { error: code(error) } : { data: data as TeacherClass }
}

export async function deleteClass(id: string): Promise<ConnectError | null> {
  const c = await client()
  if ('error' in c) return c.error
  const { error } = await c.sb.from('classes').delete().eq('id', id)
  return error ? code(error) : null
}

export async function classAssignments(classId: string): Promise<Result<Assignment[]>> {
  const c = await client()
  if ('error' in c) return c
  const { data, error } = await c.sb.from('assignments').select('id, class_id, kind, ref_id, due_on').eq('class_id', classId).order('due_on', { ascending: true, nullsFirst: false })
  return error ? { error: code(error) } : { data: (data ?? []) as Assignment[] }
}

export async function addAssignment(a: Omit<Assignment, 'id'>): Promise<ConnectError | null> {
  const c = await client()
  if ('error' in c) return c.error
  const { error } = await c.sb.from('assignments').insert(a)
  return error ? code(error) : null
}

export async function removeAssignment(id: string): Promise<ConnectError | null> {
  const c = await client()
  if ('error' in c) return c.error
  const { error } = await c.sb.from('assignments').delete().eq('id', id)
  return error ? code(error) : null
}

export async function removeMember(classId: string, userId: string): Promise<ConnectError | null> {
  const c = await client()
  if ('error' in c) return c.error
  const { error } = await c.sb.from('class_members').delete().eq('class_id', classId).eq('user_id', userId)
  return error ? code(error) : null
}

export const classOverview = (id: string) => rpc<ClassOverview>('class_overview', { cid: id })

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------
export interface Analytics {
  daily_active: { day: string; students: number }[]
  lessons: { started: number; completed: number }
  events: Record<string, number>
  hardest: { question_id: string; chapter_id: string; stem: string; attempts: number; correct_pct: number }[]
  students: number
}
export const adminAnalytics = (days = 14) => rpc<Analytics>('admin_analytics', { days })
