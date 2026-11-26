import type { DrillSrc } from '../../types'

export const drills: DrillSrc[] = [
  {
    key: 'drill-sum-product',
    title: { bn: 'যোগফল ও গুণফল থেকে বর্গের যোগফল', en: 'Sum of squares from sum and product' },
    vars: { a: { min: 1, max: 9 }, b: { min: 1, max: 9 } },
    constraints: ['a != b'],
    script: {
      derived: { s: 'a + b', p: 'a * b' },
      question: {
        bn: '$a + b = {{s}}$ এবং $ab = {{p}}$ হলে, $a^2 + b^2$ এর মান কত?',
        en: 'If $a + b = {{s}}$ and $ab = {{p}}$, what is $a^2 + b^2$?',
      },
      answers: [{ label: { bn: '$a^2 + b^2$', en: '$a^2 + b^2$' }, expr: 's^2 - 2*p' }],
      steps: [
        { bn: 'সূত্রটি মনে করি: $(a + b)^2 = a^2 + 2ab + b^2$, তাই $a^2 + b^2 = (a + b)^2 - 2ab$।', en: 'Recall $(a + b)^2 = a^2 + 2ab + b^2$, so $a^2 + b^2 = (a + b)^2 - 2ab$.' },
        { bn: 'মান বসাই: $({{s}})^2 - 2 \\times {{p}}$', en: 'Substitute: $({{s}})^2 - 2 \\times {{p}}$' },
        { bn: '$= {{s^2}} - {{2*p}} = {{s^2 - 2*p}}$', en: '$= {{s^2}} - {{2*p}} = {{s^2 - 2*p}}$' },
      ],
    },
  },
  {
    key: 'drill-expand-square',
    title: { bn: 'দ্বিপদী রাশির বর্গ বিস্তার', en: 'Expanding the square of a binomial' },
    vars: { p: { min: 1, max: 5 }, q: { min: -9, max: 9, not: [0] } },
    constraints: [],
    script: {
      derived: { A: 'p^2', B: '2*p*q', C: 'q^2' },
      question: {
        bn: '$({{coef:p}}x{{+q}})^2$ কে $Ax^2 + Bx + C$ আকারে লেখো। $A$, $B$ ও $C$ এর মান কত?',
        en: 'Write $({{coef:p}}x{{+q}})^2$ in the form $Ax^2 + Bx + C$. What are $A$, $B$ and $C$?',
      },
      answers: [
        { label: { bn: '$A$', en: '$A$' }, expr: 'A' },
        { label: { bn: '$B$', en: '$B$' }, expr: 'B' },
        { label: { bn: '$C$', en: '$C$' }, expr: 'C' },
      ],
      steps: [
        { bn: 'প্রথম পদ $a = {{coef:p}}x$, দ্বিতীয় পদ $b = {{q}}$। সূত্র: $(a + b)^2 = a^2 + 2ab + b^2$।', en: 'First term $a = {{coef:p}}x$, second term $b = {{q}}$. Formula: $(a + b)^2 = a^2 + 2ab + b^2$.' },
        { bn: '$a^2 = ({{coef:p}}x)^2 = {{coef:A}}x^2$, তাই $A = {{A}}$।', en: '$a^2 = ({{coef:p}}x)^2 = {{coef:A}}x^2$, so $A = {{A}}$.' },
        { bn: '$2ab = 2 \\times {{p}} \\times ({{q}}) \\times x = {{B}}x$, তাই $B = {{B}}$। চিহ্ন খেয়াল করো।', en: '$2ab = 2 \\times {{p}} \\times ({{q}}) \\times x = {{B}}x$, so $B = {{B}}$. Watch the sign.' },
        { bn: '$b^2 = ({{q}})^2 = {{C}}$, তাই $C = {{C}}$। বর্গ কখনো ঋণাত্মক নয়।', en: '$b^2 = ({{q}})^2 = {{C}}$, so $C = {{C}}$. A square is never negative.' },
      ],
    },
  },
]
