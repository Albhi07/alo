/**
 * A tiny, safe arithmetic language for drill templates. Content authors (admins) write
 * expressions like `a^2 + 2*a*b` or `round(v / t, 2)`; nothing here can reach the DOM,
 * the network or JavaScript globals, unlike eval'd code.
 *
 * Grammar: comparison := sum (('=='|'!='|'<'|'<='|'>'|'>=') sum)?
 *          sum := product (('+'|'-') product)*;  product := unary (('*'|'/'|'%') unary)*
 *          unary := '-' unary | power;  power := atom ('^' unary)?
 *          atom := number | name | name '(' args ')' | '(' comparison ')'
 * Logic: `and`, `or`, `not` on comparisons (true = 1, false = 0).
 */
export type Env = Record<string, number>

const gcd = (a: number, b: number): number => { a = Math.abs(Math.round(a)); b = Math.abs(Math.round(b)); while (b) [a, b] = [b, a % b]; return a }
const FUNCS: Record<string, (...x: number[]) => number> = {
  abs: Math.abs, sqrt: Math.sqrt, floor: Math.floor, ceil: Math.ceil, sign: Math.sign,
  min: Math.min, max: Math.max, sin: (d) => Math.sin((d * Math.PI) / 180), cos: (d) => Math.cos((d * Math.PI) / 180),
  tan: (d) => Math.tan((d * Math.PI) / 180), log10: Math.log10, ln: Math.log,
  round: (x, dp = 0) => { const f = 10 ** dp; return Math.round((x + Number.EPSILON) * f) / f },
  gcd, lcm: (a, b) => Math.abs(a * b) / (gcd(a, b) || 1),
}
const CONSTS: Record<string, number> = { pi: Math.PI, g: 9.8 }

type Tok = { t: 'num'; v: number } | { t: 'id'; v: string } | { t: 'op'; v: string }

function lex(src: string): Tok[] {
  const out: Tok[] = []
  const re = /\s*(?:(\d+\.?\d*(?:e[+-]?\d+)?|\.\d+)|([A-Za-z_][A-Za-z0-9_]*)|(==|!=|<=|>=|[-+*/%^(),<>]))/y
  let i = 0
  while (i < src.length) {
    if (/^\s*$/.test(src.slice(i))) break
    re.lastIndex = i
    const m = re.exec(src)
    if (!m) throw new Error(`Unexpected "${src.slice(i, i + 8)}"`)
    if (m[1] !== undefined) out.push({ t: 'num', v: Number(m[1]) })
    else if (m[2] !== undefined) out.push({ t: 'id', v: m[2] })
    else out.push({ t: 'op', v: m[3] })
    i = re.lastIndex
  }
  return out
}

export function evaluate(src: string, env: Env = {}): number {
  const toks = lex(src)
  let p = 0
  const peek = () => toks[p]
  const isOp = (v: string) => peek()?.t === 'op' && peek()!.v === v
  const isId = (v: string) => peek()?.t === 'id' && peek()!.v === v
  const expect = (v: string) => { if (!isOp(v)) throw new Error(`Expected "${v}"`); p++ }

  function or(): number { let l = and(); while (isId('or')) { p++; const r = and(); l = l || r ? 1 : 0 } return l }
  function and(): number { let l = not(); while (isId('and')) { p++; const r = not(); l = l && r ? 1 : 0 } return l }
  function not(): number { if (isId('not')) { p++; return not() ? 0 : 1 } return cmp() }
  function cmp(): number {
    const l = sum()
    const t = peek()
    if (t?.t === 'op' && ['==', '!=', '<', '<=', '>', '>='].includes(t.v)) {
      p++
      const r = sum()
      const eq = Math.abs(l - r) < 1e-9
      return ({ '==': eq, '!=': !eq, '<': l < r && !eq, '<=': l < r || eq, '>': l > r && !eq, '>=': l > r || eq } as Record<string, boolean>)[t.v] ? 1 : 0
    }
    return l
  }
  function sum(): number { let l = product(); while (isOp('+') || isOp('-')) { const o = toks[p++].v; const r = product(); l = o === '+' ? l + r : l - r } return l }
  function product(): number {
    let l = unary()
    while (isOp('*') || isOp('/') || isOp('%')) {
      const o = toks[p++].v
      const r = unary()
      if ((o === '/' || o === '%') && r === 0) throw new Error('Division by zero')
      l = o === '*' ? l * r : o === '/' ? l / r : l % r
    }
    return l
  }
  function unary(): number { if (isOp('-')) { p++; return -unary() } if (isOp('+')) { p++; return unary() } return power() }
  function power(): number { const b = atom(); if (isOp('^')) { p++; return b ** unary() } return b }
  function atom(): number {
    const t = toks[p++]
    if (!t) throw new Error('Unexpected end')
    if (t.t === 'num') return t.v
    if (t.t === 'op' && t.v === '(') { const v = or(); expect(')'); return v }
    if (t.t === 'id') {
      if (isOp('(')) {
        p++
        const fn = Object.prototype.hasOwnProperty.call(FUNCS, t.v) ? FUNCS[t.v] : undefined
        if (!fn) throw new Error(`Unknown function ${t.v}`)
        const args: number[] = []
        if (!isOp(')')) { args.push(or()); while (isOp(',')) { p++; args.push(or()) } }
        expect(')')
        return fn(...args)
      }
      // Own properties only: names like `constructor` must never reach the prototype chain.
      if (Object.prototype.hasOwnProperty.call(env, t.v)) return env[t.v]
      if (Object.prototype.hasOwnProperty.call(CONSTS, t.v)) return CONSTS[t.v]
      throw new Error(`Unknown name ${t.v}`)
    }
    throw new Error(`Unexpected "${t.v}"`)
  }
  const v = or()
  if (p !== toks.length) throw new Error(`Unexpected "${toks[p].v}"`)
  if (!Number.isFinite(v)) throw new Error('Not a finite number')
  return v
}
