import { evaluate, type Env } from './expr'
import { digits } from './format'
import type { Lang } from '../data/catalog'
import type { DrillTemplateRow } from '../data/content-types'

/**
 * Drill templates are data: random variables, constraints, derived values and text with
 * {{placeholders}}. Every attempt draws fresh numbers that satisfy the constraints, and the
 * worked solution is filled in with the same numbers.
 *
 * vars_json:        { "a": { "min": 1, "max": 9, "step"?: 1, "not"?: [0] } | { "choices": [..] } }
 * constraints_json: ["a != b", "a*b < 60"]
 * solution_js:      JSON (a data-only script, never executed as JavaScript):
 *   { "derived": { "s": "a+b" },                 evaluated in order
 *     "question": { "bn": "...", "en": "..." },
 *     "answers": [{ "label": {bn,en}, "expr": "s^2 - 2*p", "tolerance"?: 0.01, "unit"?: {bn,en} }],
 *     "steps": [{ "bn": "...", "en": "..." }] }
 * Placeholders: {{expr}} prints a value; {{+expr}} prints it as a signed term (" + 3" / " − 3");
 * {{coef:expr}} prints a coefficient (1 → "", −1 → "−").
 */
export interface VarSpec { min?: number; max?: number; step?: number; not?: number[]; choices?: number[] }
export interface Bi { bn: string; en: string }
export interface DrillScript {
  derived?: Record<string, string>
  question: Bi
  answers: { label: Bi; expr: string; tolerance?: number; unit?: Bi }[]
  steps: Bi[]
}
export interface DrillTemplate { id: string; title: string; vars_json: Record<string, VarSpec>; constraints_json: string[]; solution_js: string }
export interface DrillInstance { env: Env; question: string; answers: { label: string; value: number; tolerance: number; unit?: string }[]; steps: string[] }

/** Small seeded PRNG (mulberry32) so an instance can be reproduced from its seed. */
export function rng(seed: number) {
  let a = seed >>> 0
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
}

function draw(spec: VarSpec, rand: () => number): number {
  if (spec.choices?.length) return spec.choices[Math.floor(rand() * spec.choices.length)]
  const min = spec.min ?? 1, max = spec.max ?? 9, step = spec.step ?? 1
  const n = Math.floor((max - min) / step) + 1
  return Math.round((min + Math.floor(rand() * n) * step) * 1e6) / 1e6
}

export function parseScript(src: string): DrillScript {
  const s = JSON.parse(src) as DrillScript
  if (!s.question || !Array.isArray(s.answers) || !s.answers.length || !Array.isArray(s.steps)) throw new Error('Script needs question, answers and steps')
  return s
}

export const fmtNum = (v: number, lang: Lang) => digits(String(Math.round(v * 1e6) / 1e6), lang).replace('-', '−')

export function fill(text: string, env: Env, lang: Lang): string {
  // Inside $...$ maths, numbers stay in Latin digits like the rest of the authored formulas;
  // in running text they follow the language.
  return text.split(/(\$\$?[^$]*\$\$?)/).map((part, i) => {
    const math = i % 2 === 1
    const l: Lang = math ? 'en' : lang
    const minus = math ? '-' : '−'
    const num = (v: number) => (math ? fmtNum(v, l).replace('−', '-') : fmtNum(v, l))
    return part.replace(/\{\{\s*([+]|coef:)?([^}]+?)\s*\}\}/g, (_m, mode: string | undefined, expr: string) => {
      const v = evaluate(expr, env)
      if (mode === '+') return v < 0 ? ` ${minus} ${num(-v)}` : ` + ${num(v)}`
      if (mode === 'coef:') return v === 1 ? '' : v === -1 ? minus : num(v)
      return num(v)
    })
  }).join('')
}

/** Draw numbers until all constraints hold (or give up after 500 tries). */
export function generate(tpl: DrillTemplate, lang: Lang, seed = Date.now()): DrillInstance {
  const script = parseScript(tpl.solution_js)
  const rand = rng(seed)
  for (let attempt = 0; attempt < 500; attempt++) {
    const env: Env = {}
    for (const [name, spec] of Object.entries(tpl.vars_json)) {
      let v = draw(spec, rand)
      for (let k = 0; k < 50 && spec.not?.includes(v); k++) v = draw(spec, rand)
      env[name] = v
    }
    try {
      for (const [name, expr] of Object.entries(script.derived ?? {})) env[name] = evaluate(expr, env)
      if (!(tpl.constraints_json ?? []).every((c) => evaluate(c, env) === 1)) continue
      return {
        env,
        question: fill(script.question[lang], env, lang),
        answers: script.answers.map((a) => ({ label: fill(a.label[lang], env, lang), value: evaluate(a.expr, env), tolerance: a.tolerance ?? 1e-6, unit: a.unit?.[lang] })),
        steps: script.steps.map((s) => fill(s[lang], env, lang)),
      }
    } catch { /* e.g. division by zero for these numbers: draw again */ }
  }
  throw new Error(`Could not satisfy constraints for ${tpl.id}`)
}

/** Accepts Bangla digits, "−", spaces and simple fractions like 3/4. */
export function parseAnswer(input: string): number | null {
  const s = input.trim().replace(/[০-৯]/g, (d) => String('০১২৩৪৫৬৭৮৯'.indexOf(d))).replace(/[−–]/g, '-').replace(/\s+/g, '').replace(/,/g, '')
  if (!s) return null
  const frac = /^(-?\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)$/.exec(s)
  if (frac) return Number(frac[2]) === 0 ? null : Number(frac[1]) / Number(frac[2])
  return /^-?\d+(?:\.\d+)?$|^-?\.\d+$/.test(s) ? Number(s) : null
}

export function isCorrect(given: number | null, expected: number, tolerance: number) {
  return given !== null && Math.abs(given - expected) <= Math.max(tolerance, Math.abs(expected) * 1e-9)
}

/** Drill titles live in the script as {bn, en}; the row's title column is the English fallback. */
export function drillTitle(d: DrillTemplateRow, lang: Lang): string {
  try {
    const s = JSON.parse(d.solution_js) as { title?: { bn: string; en: string } }
    return s.title?.[lang] ?? d.title
  } catch { return d.title }
}

