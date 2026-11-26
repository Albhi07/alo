import type { McqSrc, Bi } from '../../types'

// 20 original MCQs: 14 single-answer, 3 multiple-completion (বহুপদী সমাপ্তিসূচক),
// 3 situation-based (অনুচ্ছেদ-ভিত্তিক) sharing one passage.

const same = (s: string): Bi => ({ bn: s, en: s })
const o4 = (a: string, b: string, c: string, d: string): [Bi, Bi, Bi, Bi] => [same(a), same(b), same(c), same(d)]
const MC_OPTS: [Bi, Bi, Bi, Bi] = [
  { bn: 'i ও ii', en: 'i and ii' }, { bn: 'i ও iii', en: 'i and iii' },
  { bn: 'ii ও iii', en: 'ii and iii' }, { bn: 'i, ii ও iii', en: 'i, ii and iii' },
]

const garden: Bi = {
  bn: 'একটি বর্গাকার বাগানের প্রতিটি বাহুর দৈর্ঘ্য $(x + 2)$ মিটার। বাগানের ঠিক মাঝখানে $(x - 2)$ মিটার বাহুবিশিষ্ট একটি বর্গাকার পুকুর কাটা হলো।',
  en: 'Each side of a square garden is $(x + 2)$ metres. A square pond with side $(x - 2)$ metres is dug right in the middle of the garden.',
}

export const mcqs: McqSrc[] = [
  {
    key: 'q01', subtype: 'single', difficulty: 1, tags: ['square-sum'],
    stem: { bn: '$(x + 5)^2$ এর বিস্তৃত রূপ কোনটি?', en: 'What is the expanded form of $(x + 5)^2$?' },
    options: o4('$x^2 + 10x + 25$', '$x^2 + 25$', '$x^2 + 5x + 25$', '$x^2 + 10x + 10$'), answer: 0,
    explanation: { bn: '$a = x$, $b = 5$: $x^2 + 2 \\cdot 5x + 25 = x^2 + 10x + 25$।', en: '$a = x$, $b = 5$: $x^2 + 2 \\cdot 5x + 25 = x^2 + 10x + 25$.' },
  },
  {
    key: 'q02', subtype: 'single', difficulty: 2, tags: ['square-difference'],
    stem: { bn: '$(2a - 3)^2 = ?$', en: '$(2a - 3)^2 = ?$' },
    options: o4('$4a^2 - 9$', '$4a^2 - 6a + 9$', '$4a^2 - 12a + 9$', '$2a^2 - 12a + 9$'), answer: 2,
    explanation: { bn: '$(2a)^2 = 4a^2$, মাঝের পদ $-2 \\cdot 2a \\cdot 3 = -12a$, শেষ পদ $9$।', en: '$(2a)^2 = 4a^2$, middle term $-2 \\cdot 2a \\cdot 3 = -12a$, last term $9$.' },
  },
  {
    key: 'q03', subtype: 'single', difficulty: 2, tags: ['sum-product'],
    stem: { bn: '$a + b = 7$ এবং $ab = 10$ হলে, $a^2 + b^2$ এর মান কত?', en: 'If $a + b = 7$ and $ab = 10$, what is $a^2 + b^2$?' },
    options: o4('$39$', '$29$', '$69$', '$17$'), answer: 1,
    explanation: { bn: '$a^2 + b^2 = (a + b)^2 - 2ab = 49 - 20 = 29$।', en: '$a^2 + b^2 = (a + b)^2 - 2ab = 49 - 20 = 29$.' },
  },
  {
    key: 'q04', subtype: 'single', difficulty: 3, tags: ['sum-product'],
    stem: { bn: '$a - b = 3$ এবং $ab = 4$ হলে, $(a + b)^2$ এর মান কত?', en: 'If $a - b = 3$ and $ab = 4$, what is $(a + b)^2$?' },
    options: o4('$13$', '$7$', '$1$', '$25$'), answer: 3,
    explanation: { bn: '$(a + b)^2 = (a - b)^2 + 4ab = 9 + 16 = 25$।', en: '$(a + b)^2 = (a - b)^2 + 4ab = 9 + 16 = 25$.' },
  },
  {
    key: 'q05', subtype: 'single', difficulty: 1, tags: ['factorise', 'difference-of-squares'],
    stem: { bn: '$x^2 - 9$ এর উৎপাদক কোনটি?', en: 'Which is the factorisation of $x^2 - 9$?' },
    options: o4('$(x - 3)^2$', '$(x + 3)(x - 3)$', '$(x + 9)(x - 1)$', '$(x + 3)^2$'), answer: 1,
    explanation: { bn: '$a^2 - b^2 = (a + b)(a - b)$, এখানে $b = 3$।', en: '$a^2 - b^2 = (a + b)(a - b)$ with $b = 3$.' },
  },
  {
    key: 'q06', subtype: 'single', difficulty: 2, tags: ['difference-of-squares', 'mental-math'],
    stem: { bn: '$51^2 - 49^2$ এর মান কত?', en: 'What is $51^2 - 49^2$?' },
    options: o4('$2$', '$100$', '$200$', '$400$'), answer: 2,
    explanation: { bn: '$(51 + 49)(51 - 49) = 100 \\times 2 = 200$।', en: '$(51 + 49)(51 - 49) = 100 \\times 2 = 200$.' },
  },
  {
    key: 'q07', subtype: 'single', difficulty: 3, tags: ['reciprocal'],
    stem: { bn: '$x + \\frac{1}{x} = 4$ হলে, $x^2 + \\frac{1}{x^2}$ এর মান কত?', en: 'If $x + \\frac{1}{x} = 4$, what is $x^2 + \\frac{1}{x^2}$?' },
    options: o4('$16$', '$14$', '$18$', '$12$'), answer: 1,
    explanation: { bn: '$x^2 + \\frac{1}{x^2} = (x + \\frac{1}{x})^2 - 2 \\cdot x \\cdot \\frac{1}{x} = 16 - 2 = 14$।', en: '$x^2 + \\frac{1}{x^2} = (x + \\frac{1}{x})^2 - 2 \\cdot x \\cdot \\frac{1}{x} = 16 - 2 = 14$.' },
  },
  {
    key: 'q08', subtype: 'single', difficulty: 2, tags: ['cube-sum'],
    stem: { bn: '$(a + b)^3$ এর বিস্তৃত রূপ কোনটি?', en: 'What is the expanded form of $(a + b)^3$?' },
    options: o4('$a^3 + b^3$', '$a^3 + 3a^2b + 3ab^2 + b^3$', '$a^3 + b^3 + 3ab$', '$a^3 + a^2b + ab^2 + b^3$'), answer: 1,
    explanation: { bn: '$(a + b)^3 = a^3 + 3a^2b + 3ab^2 + b^3$, যাকে $a^3 + b^3 + 3ab(a + b)$ লেখা যায়।', en: '$(a + b)^3 = a^3 + 3a^2b + 3ab^2 + b^3$, which can be written $a^3 + b^3 + 3ab(a + b)$.' },
  },
  {
    key: 'q09', subtype: 'single', difficulty: 2, tags: ['cube-difference', 'factorise'],
    stem: { bn: '$a^3 - b^3$ এর উৎপাদক কোনটি?', en: 'Which is the factorisation of $a^3 - b^3$?' },
    options: o4('$(a - b)(a^2 - ab + b^2)$', '$(a + b)(a^2 - ab + b^2)$', '$(a - b)^3$', '$(a - b)(a^2 + ab + b^2)$'), answer: 3,
    explanation: { bn: 'গুণ করে মিলিয়ে দেখো: $(a - b)(a^2 + ab + b^2) = a^3 + a^2b + ab^2 - a^2b - ab^2 - b^3 = a^3 - b^3$।', en: 'Multiply to check: $(a - b)(a^2 + ab + b^2) = a^3 + a^2b + ab^2 - a^2b - ab^2 - b^3 = a^3 - b^3$.' },
  },
  {
    key: 'q10', subtype: 'single', difficulty: 2, tags: ['factorise', 'middle-term'],
    stem: { bn: '$x^2 + 7x + 12$ এর উৎপাদক কোনটি?', en: 'Which is the factorisation of $x^2 + 7x + 12$?' },
    options: o4('$(x + 2)(x + 6)$', '$(x + 3)(x + 4)$', '$(x + 1)(x + 12)$', '$(x - 3)(x - 4)$'), answer: 1,
    explanation: { bn: 'এমন দুটি সংখ্যা খুঁজি যাদের গুণফল $12$ আর যোগফল $7$: $3$ ও $4$।', en: 'Find two numbers with product $12$ and sum $7$: $3$ and $4$.' },
  },
  {
    key: 'q11', subtype: 'single', difficulty: 2, tags: ['factorise', 'middle-term'],
    stem: { bn: '$x^2 - 5x + 6$ এর উৎপাদক কোনটি?', en: 'Which is the factorisation of $x^2 - 5x + 6$?' },
    options: o4('$(x + 2)(x + 3)$', '$(x - 1)(x - 6)$', '$(x - 2)(x - 3)$', '$(x - 2)(x + 3)$'), answer: 2,
    explanation: { bn: 'গুণফল $+6$, যোগফল $-5$: দুটিই ঋণাত্মক, $-2$ ও $-3$।', en: 'Product $+6$, sum $-5$: both negative, $-2$ and $-3$.' },
  },
  {
    key: 'q12', subtype: 'single', difficulty: 2, tags: ['square-three-terms'],
    stem: { bn: '$(a + b + c)^2 = ?$', en: '$(a + b + c)^2 = ?$' },
    options: o4('$a^2 + b^2 + c^2$', '$a^2 + b^2 + c^2 + ab + bc + ca$', '$a^2 + b^2 + c^2 + 2ab + 2bc + 2ca$', '$a^2 + b^2 + c^2 + 2abc$'), answer: 2,
    explanation: { bn: '$(a + b + c)^2 = a^2 + b^2 + c^2 + 2(ab + bc + ca)$। প্রতিটি জোড়ার গুণফল দুবার আসে।', en: '$(a + b + c)^2 = a^2 + b^2 + c^2 + 2(ab + bc + ca)$. Each pair product appears twice.' },
  },
  {
    key: 'q13', subtype: 'single', difficulty: 2, tags: ['square-sum', 'evaluate'],
    stem: { bn: '$x = 2$ এবং $y = -1$ হলে, $x^2 + 2xy + y^2$ এর মান কত?', en: 'If $x = 2$ and $y = -1$, what is $x^2 + 2xy + y^2$?' },
    options: o4('$9$', '$5$', '$1$', '$3$'), answer: 2,
    explanation: { bn: 'রাশিটি $(x + y)^2 = (2 - 1)^2 = 1$।', en: 'The expression is $(x + y)^2 = (2 - 1)^2 = 1$.' },
  },
  {
    key: 'q14', subtype: 'single', difficulty: 2, tags: ['square-difference', 'coefficient'],
    stem: { bn: '$(3x - 2)^2$ এর বিস্তৃতিতে $x$ এর সহগ কত?', en: 'In the expansion of $(3x - 2)^2$, what is the coefficient of $x$?' },
    options: o4('$12$', '$-6$', '$-12$', '$9$'), answer: 2,
    explanation: { bn: 'মাঝের পদ $-2 \\cdot 3x \\cdot 2 = -12x$, তাই সহগ $-12$।', en: 'The middle term is $-2 \\cdot 3x \\cdot 2 = -12x$, so the coefficient is $-12$.' },
  },
  {
    key: 'q15', subtype: 'multi_completion', difficulty: 3, tags: ['identities'],
    stem: {
      bn: 'নিচের তথ্যগুলো লক্ষ করো:\n\ni. $(a + b)^2 - (a - b)^2 = 4ab$\nii. $a^2 + b^2 = (a + b)^2 - 2ab$\niii. $(a - b)^2 = a^2 - b^2$\n\nনিচের কোনটি সঠিক?',
      en: 'Consider the statements:\n\ni. $(a + b)^2 - (a - b)^2 = 4ab$\nii. $a^2 + b^2 = (a + b)^2 - 2ab$\niii. $(a - b)^2 = a^2 - b^2$\n\nWhich of the following is correct?',
    },
    options: MC_OPTS, answer: 0,
    explanation: { bn: 'i ও ii সূত্র থেকেই আসে। iii ভুল: $(a - b)^2 = a^2 - 2ab + b^2$।', en: 'i and ii follow from the formulas. iii is wrong: $(a - b)^2 = a^2 - 2ab + b^2$.' },
  },
  {
    key: 'q16', subtype: 'multi_completion', difficulty: 2, tags: ['difference-of-squares'],
    stem: {
      bn: '$x^2 - 4$ রাশিটির ক্ষেত্রে:\n\ni. এটি দুটি বর্গের অন্তর\nii. $x^2 - 4 = (x + 2)(x - 2)$\niii. $x = 2$ হলে রাশিটির মান $0$\n\nনিচের কোনটি সঠিক?',
      en: 'For the expression $x^2 - 4$:\n\ni. it is a difference of two squares\nii. $x^2 - 4 = (x + 2)(x - 2)$\niii. its value is $0$ when $x = 2$\n\nWhich of the following is correct?',
    },
    options: MC_OPTS, answer: 3,
    explanation: { bn: '$x^2 - 2^2$ দুটি বর্গের অন্তর, উৎপাদক $(x + 2)(x - 2)$, আর $x = 2$ বসালে $4 - 4 = 0$। তিনটিই সঠিক।', en: '$x^2 - 2^2$ is a difference of squares, it factorises as $(x + 2)(x - 2)$, and at $x = 2$ it is $4 - 4 = 0$. All three are correct.' },
  },
  {
    key: 'q17', subtype: 'multi_completion', difficulty: 3, tags: ['sum-product'],
    stem: {
      bn: '$a + b = 5$ এবং $a - b = 1$ হলে:\n\ni. $a = 3$\nii. $ab = 6$\niii. $a^2 + b^2 = 15$\n\nনিচের কোনটি সঠিক?',
      en: 'If $a + b = 5$ and $a - b = 1$:\n\ni. $a = 3$\nii. $ab = 6$\niii. $a^2 + b^2 = 15$\n\nWhich of the following is correct?',
    },
    options: MC_OPTS, answer: 0,
    explanation: { bn: 'যোগ করলে $2a = 6$, তাই $a = 3$, $b = 2$। $ab = 6$। কিন্তু $a^2 + b^2 = 9 + 4 = 13$, তাই iii ভুল।', en: 'Adding gives $2a = 6$, so $a = 3$, $b = 2$. $ab = 6$. But $a^2 + b^2 = 9 + 4 = 13$, so iii is wrong.' },
  },
  {
    key: 'q18', subtype: 'situation', context: garden, difficulty: 2, tags: ['square-sum', 'area'],
    stem: { bn: 'বাগানের মোট ক্ষেত্রফল কত বর্গমিটার?', en: 'What is the total area of the garden in square metres?' },
    options: o4('$x^2 + 4$', '$x^2 + 4x + 4$', '$x^2 + 2x + 4$', '$4x + 4$'), answer: 1,
    explanation: { bn: '$(x + 2)^2 = x^2 + 4x + 4$।', en: '$(x + 2)^2 = x^2 + 4x + 4$.' },
  },
  {
    key: 'q19', subtype: 'situation', context: garden, difficulty: 3, tags: ['identities', 'area'],
    stem: { bn: 'পুকুর বাদে বাগানের বাকি অংশের ক্ষেত্রফল কত?', en: 'What is the area of the garden excluding the pond?' },
    options: o4('$4x$', '$8$', '$8x$', '$2x^2 + 8$'), answer: 2,
    explanation: { bn: '$(x + 2)^2 - (x - 2)^2 = 4 \\cdot x \\cdot 2 = 8x$ (সূত্র: $(a+b)^2 - (a-b)^2 = 4ab$)।', en: '$(x + 2)^2 - (x - 2)^2 = 4 \\cdot x \\cdot 2 = 8x$ (using $(a+b)^2 - (a-b)^2 = 4ab$).' },
  },
  {
    key: 'q20', subtype: 'situation', context: garden, difficulty: 2, tags: ['evaluate', 'area'],
    stem: { bn: '$x = 10$ হলে পুকুরের ক্ষেত্রফল কত বর্গমিটার?', en: 'If $x = 10$, what is the area of the pond in square metres?' },
    options: o4('$144$', '$80$', '$100$', '$64$'), answer: 3,
    explanation: { bn: 'পুকুরের বাহু $10 - 2 = 8$ মিটার, ক্ষেত্রফল $8^2 = 64$।', en: 'The pond side is $10 - 2 = 8$ m, so the area is $8^2 = 64$.' },
  },
]
