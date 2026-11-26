import { describe, it, expect } from 'vitest'
import { evaluate } from './expr'
import { generate, parseAnswer, isCorrect, fill, type DrillTemplate } from './drill'

describe('expr', () => {
  it('does arithmetic with precedence and functions', () => {
    expect(evaluate('2 + 3*4^2')).toBe(50)
    expect(evaluate('-2^2')).toBe(-4)
    expect(evaluate('(a+b)^2 - 2*a*b', { a: 3, b: 4 })).toBe(25)
    expect(evaluate('round(10/3, 2)')).toBe(3.33)
    expect(evaluate('gcd(12, 18) + lcm(4, 6)')).toBe(18)
    expect(evaluate('a != b and a*b < 20', { a: 2, b: 3 })).toBe(1)
    expect(evaluate('not (a > 1)', { a: 2 })).toBe(0)
  })
  it('refuses anything that is not arithmetic', () => {
    expect(() => evaluate('alert(1)')).toThrow(/Unknown function/)
    expect(() => evaluate('constructor')).toThrow(/Unknown name/)
    expect(() => evaluate('constructor(1)')).toThrow(/Unknown function/)
    expect(() => evaluate('toString')).toThrow(/Unknown name/)
    expect(() => evaluate('a; b')).toThrow()
    expect(() => evaluate('1/0')).toThrow(/Division/)
  })
})

const tpl: DrillTemplate = {
  id: 't', title: 't',
  vars_json: { a: { min: 1, max: 9 }, b: { min: 1, max: 9 } },
  constraints_json: ['a != b'],
  solution_js: JSON.stringify({
    derived: { s: 'a+b', p: 'a*b' },
    question: { bn: 'a+b={{s}}, ab={{p}}', en: 'a+b={{s}}, ab={{p}}' },
    answers: [{ label: { bn: 'a²+b²', en: 'a²+b²' }, expr: 's^2-2*p' }],
    steps: [{ bn: '{{s}}² − ২×{{p}}', en: '{{s}}^2 - 2×{{p}}' }],
  }),
}

describe('drills', () => {
  it('generates fresh numbers that satisfy constraints, reproducible by seed', () => {
    const seen = new Set<string>()
    for (let seed = 1; seed < 40; seed++) {
      const d = generate(tpl, 'en', seed)
      expect(d.env.a).not.toBe(d.env.b)
      expect(d.answers[0].value).toBe(d.env.a ** 2 + d.env.b ** 2)
      seen.add(d.question)
    }
    expect(seen.size).toBeGreaterThan(10)
    expect(generate(tpl, 'en', 7)).toEqual(generate(tpl, 'en', 7))
  })
  it('prints Bangla digits and signed terms', () => {
    expect(fill('x{{+b}} = {{coef:a}}y', { a: 1, b: -3 }, 'bn')).toBe('x − ৩ = y')
    expect(generate(tpl, 'bn', 3).question).toMatch(/^a\+b=[০-৯]+/)
    // Inside maths, digits stay Latin to match the authored formulas.
    expect(fill('$({{coef:a}}x{{+b}})^2$ = {{b}}', { a: 5, b: -7 }, 'bn')).toBe('$(5x - 7)^2$ = −৭')
  })
  it('reads answers typed in Bangla digits, minus signs and fractions', () => {
    expect(parseAnswer('২৫')).toBe(25)
    expect(parseAnswer('−3.5')).toBe(-3.5)
    expect(parseAnswer('3/4')).toBe(0.75)
    expect(parseAnswer('abc')).toBeNull()
    expect(isCorrect(parseAnswer('৩.৩৩'), 10 / 3, 0.01)).toBe(true)
  })
})
