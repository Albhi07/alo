import type { Bi, McqSrc, MockCqSrc, MockSrc } from '../types'

// Full Mathematics (109) mock paper, written for Alo. All questions are original.
// Format: MCQ 30 marks / 30 min, then CQ 70 marks / 2 h 30 min: 11 questions in three
// sections, answer 7 taking at least 2 from each section, each worth 10 (2 + 4 + 4).
// The section rule should be re-checked against the board's 2027 question format.

const same = (s: string): Bi => ({ bn: s, en: s })
const bi = (bn: string, en: string): Bi => ({ bn, en })
const MC_OPTS: [Bi, Bi, Bi, Bi] = [
  bi('i ও ii', 'i and ii'), bi('i ও iii', 'i and iii'), bi('ii ও iii', 'ii and iii'), bi('i, ii ও iii', 'i, ii and iii'),
]

/** Single-answer item, written with the right option first and then rotated so answers spread over ক-ঘ. */
let n = 0
function single(stem: Bi, right: Bi, wrong: [Bi, Bi, Bi], explanation: Bi, tags: string[], difficulty: McqSrc['difficulty'] = 2): McqSrc {
  const k = (n * 3 + 1) % 4
  n++
  const opts = [right, ...wrong]
  const rotated = [...opts.slice(4 - k), ...opts.slice(0, 4 - k)] as [Bi, Bi, Bi, Bi]
  return { key: `m${String(n).padStart(2, '0')}`, subtype: 'single', stem, options: rotated, answer: k as 0 | 1 | 2 | 3, explanation, difficulty, tags }
}
const s = same

const mcqs: McqSrc[] = [
  single(bi('$\\sqrt{2}$ কোন ধরনের সংখ্যা?', 'What kind of number is $\\sqrt{2}$?'), bi('অমূলদ', 'Irrational'),
    [bi('মূলদ', 'Rational'), bi('স্বাভাবিক', 'Natural'), bi('পূর্ণ', 'Integer')],
    bi('$\\sqrt{2}$ কে দুটি পূর্ণসংখ্যার অনুপাতে লেখা যায় না, তাই এটি অমূলদ।', '$\\sqrt{2}$ cannot be written as a ratio of two integers, so it is irrational.'), ['real-numbers'], 1),
  single(bi('$0.\\dot{3}$ কে ভগ্নাংশে প্রকাশ করলে কত হয়?', 'Written as a fraction, $0.\\dot{3}$ is'), s('$\\frac{1}{3}$'),
    [s('$\\frac{3}{10}$'), s('$\\frac{3}{100}$'), s('$\\frac{1}{30}$')],
    bi('$x = 0.333\\ldots$ হলে $10x - x = 3$, তাই $x = \\frac{1}{3}$।', 'If $x = 0.333\\ldots$ then $10x - x = 3$, so $x = \\frac{1}{3}$.'), ['real-numbers']),
  single(bi('$A = \\{1, 2, 3\\}$ হলে $P(A)$ এর উপাদান সংখ্যা কত?', 'If $A = \\{1, 2, 3\\}$, how many elements does $P(A)$ have?'), s('$8$'),
    [s('$3$'), s('$6$'), s('$9$')],
    bi('$n$ উপাদানের সেটের উপসেট $2^n$টি: $2^3 = 8$।', 'A set with $n$ elements has $2^n$ subsets: $2^3 = 8$.'), ['sets']),
  single(bi('$f(x) = x^2 - 2x$ হলে $f(3)$ এর মান কত?', 'If $f(x) = x^2 - 2x$, what is $f(3)$?'), s('$3$'),
    [s('$15$'), s('$-3$'), s('$9$')],
    bi('$f(3) = 9 - 6 = 3$।', '$f(3) = 9 - 6 = 3$.'), ['functions']),
  single(bi('$a + b = 5$ এবং $ab = 6$ হলে $a^2 + b^2$ এর মান কত?', 'If $a + b = 5$ and $ab = 6$, what is $a^2 + b^2$?'), s('$13$'),
    [s('$25$'), s('$37$'), s('$19$')],
    bi('$a^2 + b^2 = (a + b)^2 - 2ab = 25 - 12 = 13$।', '$a^2 + b^2 = (a + b)^2 - 2ab = 25 - 12 = 13$.'), ['algebraic-expressions']),
  single(bi('$x^2 - 5x + 6$ এর উৎপাদক কোনটি?', 'Which is the factorisation of $x^2 - 5x + 6$?'), s('$(x - 2)(x - 3)$'),
    [s('$(x + 2)(x + 3)$'), s('$(x - 1)(x - 6)$'), s('$(x + 1)(x - 6)$')],
    bi('গুণফল $6$ এবং যোগফল $-5$ এমন দুটি সংখ্যা $-2$ ও $-3$।', 'Two numbers with product $6$ and sum $-5$ are $-2$ and $-3$.'), ['factorisation']),
  single(s('$2^0 + 2^{-1} = ?$'), s('$\\frac{3}{2}$'),
    [s('$\\frac{1}{2}$'), s('$1$'), s('$2$')],
    bi('$2^0 = 1$ এবং $2^{-1} = \\frac{1}{2}$, যোগফল $\\frac{3}{2}$।', '$2^0 = 1$ and $2^{-1} = \\frac{1}{2}$, so the sum is $\\frac{3}{2}$.'), ['exponents']),
  single(s('$\\log_2 32 = ?$'), s('$5$'),
    [s('$4$'), s('$6$'), s('$16$')],
    bi('$2^5 = 32$, তাই $\\log_2 32 = 5$।', '$2^5 = 32$, so $\\log_2 32 = 5$.'), ['logarithms']),
  single(bi('$3x - 7 = 8$ হলে $x$ এর মান কত?', 'If $3x - 7 = 8$, what is $x$?'), s('$5$'),
    [s('$3$'), s('$\\frac{1}{3}$'), s('$-5$')],
    bi('$3x = 15$, তাই $x = 5$।', '$3x = 15$, so $x = 5$.'), ['linear-equations'], 1),
  single(bi('ত্রিভুজের তিন কোণের সমষ্টি কত?', 'What is the sum of the three angles of a triangle?'), s('$180^\\circ$'),
    [s('$90^\\circ$'), s('$270^\\circ$'), s('$360^\\circ$')],
    bi('যেকোনো ত্রিভুজের তিন কোণের সমষ্টি দুই সমকোণ, অর্থাৎ $180^\\circ$।', 'The angles of any triangle add up to two right angles, $180^\\circ$.'), ['triangles'], 1),
  single(bi('সমবাহু ত্রিভুজের প্রতিটি কোণ কত?', 'Each angle of an equilateral triangle is'), s('$60^\\circ$'),
    [s('$30^\\circ$'), s('$45^\\circ$'), s('$90^\\circ$')],
    bi('তিনটি কোণ সমান এবং সমষ্টি $180^\\circ$, তাই প্রতিটি $60^\\circ$।', 'All three angles are equal and add to $180^\\circ$, so each is $60^\\circ$.'), ['triangles'], 1),
  single(bi('অর্ধবৃত্তস্থ কোণ কোন ধরনের কোণ?', 'An angle in a semicircle is'), bi('সমকোণ', 'a right angle'),
    [bi('সূক্ষ্মকোণ', 'an acute angle'), bi('স্থূলকোণ', 'an obtuse angle'), bi('সরলকোণ', 'a straight angle')],
    bi('ব্যাসের ওপর দাঁড়ানো বৃত্তস্থ কোণ কেন্দ্রস্থ কোণের ($180^\\circ$) অর্ধেক, অর্থাৎ $90^\\circ$।', 'It is half the centre angle on the diameter ($180^\\circ$), so $90^\\circ$.'), ['circle']),
  single(s('$\\sin^2\\theta + \\cos^2\\theta = ?$'), s('$1$'),
    [s('$0$'), s('$2$'), s('$\\tan\\theta$')],
    bi('এটি ত্রিকোণমিতির মৌলিক অভেদ।', 'This is the basic trigonometric identity.'), ['trigonometry'], 1),
  single(bi('$\\tan 45^\\circ$ এর মান কত?', 'What is $\\tan 45^\\circ$?'), s('$1$'),
    [s('$0$'), s('$\\frac{1}{\\sqrt{3}}$'), s('$\\sqrt{3}$')],
    bi('$45^\\circ$ কোণে লম্ব ও ভূমি সমান, তাই অনুপাত $1$।', 'At $45^\\circ$ the opposite and adjacent sides are equal, so the ratio is $1$.'), ['trigonometry'], 1),
  single(bi('$\\cos 60^\\circ$ এর মান কত?', 'What is $\\cos 60^\\circ$?'), s('$\\frac{1}{2}$'),
    [s('$\\frac{\\sqrt{3}}{2}$'), s('$1$'), s('$0$')],
    bi('সমবাহু ত্রিভুজকে অর্ধেক করলে দেখা যায় $\\cos 60^\\circ = \\frac{1}{2}$।', 'Halving an equilateral triangle shows $\\cos 60^\\circ = \\frac{1}{2}$.'), ['trigonometry']),
  single(bi('একটি খুঁটির ছায়ার দৈর্ঘ্য খুঁটির উচ্চতার সমান হলে সূর্যের উন্নতি কোণ কত?', 'When a pole\'s shadow is as long as the pole is tall, the sun\'s angle of elevation is'), s('$45^\\circ$'),
    [s('$30^\\circ$'), s('$60^\\circ$'), s('$90^\\circ$')],
    bi('$\\tan\\theta = \\frac{\\text{উচ্চতা}}{\\text{ছায়া}} = 1$, তাই $\\theta = 45^\\circ$।', '$\\tan\\theta = \\frac{\\text{height}}{\\text{shadow}} = 1$, so $\\theta = 45^\\circ$.'), ['height-distance']),
  single(bi('$a : b = 2 : 3$ এবং $b : c = 4 : 5$ হলে $a : c$ কত?', 'If $a : b = 2 : 3$ and $b : c = 4 : 5$, then $a : c$ is'), s('$8 : 15$'),
    [s('$2 : 5$'), s('$6 : 5$'), s('$8 : 12$')],
    bi('$\\frac{a}{c} = \\frac{a}{b} \\cdot \\frac{b}{c} = \\frac{2}{3} \\cdot \\frac{4}{5} = \\frac{8}{15}$।', '$\\frac{a}{c} = \\frac{a}{b} \\cdot \\frac{b}{c} = \\frac{2}{3} \\cdot \\frac{4}{5} = \\frac{8}{15}$.'), ['ratio'], 3),
  single(bi('$x + y = 7$ এবং $x - y = 1$ হলে $(x, y)$ কত?', 'If $x + y = 7$ and $x - y = 1$, then $(x, y)$ is'), s('$(4, 3)$'),
    [s('$(3, 4)$'), s('$(5, 2)$'), s('$(6, 1)$')],
    bi('যোগ করলে $2x = 8$, $x = 4$; তাহলে $y = 3$।', 'Adding gives $2x = 8$, $x = 4$; then $y = 3$.'), ['simultaneous-equations']),
  single(bi('প্রথম $10$টি বিজোড় স্বাভাবিক সংখ্যার যোগফল কত?', 'What is the sum of the first $10$ odd natural numbers?'), s('$100$'),
    [s('$81$'), s('$121$'), s('$90$')],
    bi('প্রথম $n$টি বিজোড় সংখ্যার যোগফল $n^2 = 100$।', 'The sum of the first $n$ odd numbers is $n^2 = 100$.'), ['series'], 3),
  single(bi('$2, 5, 8, \\ldots$ ধারার $10$ম পদ কত?', 'What is the $10$th term of $2, 5, 8, \\ldots$?'), s('$29$'),
    [s('$30$'), s('$32$'), s('$27$')],
    bi('$a + (n - 1)d = 2 + 9 \\times 3 = 29$।', '$a + (n - 1)d = 2 + 9 \\times 3 = 29$.'), ['series']),
  single(bi('একটি আয়তক্ষেত্রের দৈর্ঘ্য $8$ সেমি ও প্রস্থ $6$ সেমি হলে কর্ণের দৈর্ঘ্য কত?', 'A rectangle is $8$ cm long and $6$ cm wide. How long is its diagonal?'), bi('$10$ সেমি', '$10$ cm'),
    [bi('$14$ সেমি', '$14$ cm'), bi('$12$ সেমি', '$12$ cm'), bi('$48$ সেমি', '$48$ cm')],
    bi('$\\sqrt{8^2 + 6^2} = \\sqrt{100} = 10$।', '$\\sqrt{8^2 + 6^2} = \\sqrt{100} = 10$.'), ['mensuration']),
  single(bi('$r$ ব্যাসার্ধের বৃত্তের ক্ষেত্রফল কত?', 'The area of a circle of radius $r$ is'), s('$\\pi r^2$'),
    [s('$2\\pi r$'), s('$\\pi d$'), s('$2\\pi r^2$')],
    bi('$2\\pi r$ হলো পরিধি; ক্ষেত্রফল $\\pi r^2$।', '$2\\pi r$ is the circumference; the area is $\\pi r^2$.'), ['mensuration'], 1),
  single(bi('একটি ঘনকের এক ধার $3$ সেমি হলে আয়তন কত?', 'A cube has edge $3$ cm. What is its volume?'), bi('$27$ ঘন সেমি', '$27$ cm³'),
    [bi('$9$ ঘন সেমি', '$9$ cm³'), bi('$18$ ঘন সেমি', '$18$ cm³'), bi('$54$ ঘন সেমি', '$54$ cm³')],
    bi('$3^3 = 27$।', '$3^3 = 27$.'), ['mensuration'], 1),
  single(bi('$2, 3, 3, 5, 7$ এর প্রচুরক কত?', 'What is the mode of $2, 3, 3, 5, 7$?'), s('$3$'),
    [s('$2$'), s('$5$'), s('$7$')],
    bi('$3$ সবচেয়ে বেশি বার ($2$ বার) আছে।', '$3$ appears most often (twice).'), ['statistics'], 1),
  single(bi('$4, 8, 6, 2$ এর গাণিতিক গড় কত?', 'What is the mean of $4, 8, 6, 2$?'), s('$5$'),
    [s('$4$'), s('$6$'), s('$20$')],
    bi('$\\frac{4 + 8 + 6 + 2}{4} = \\frac{20}{4} = 5$।', '$\\frac{4 + 8 + 6 + 2}{4} = \\frac{20}{4} = 5$.'), ['statistics'], 1),
  {
    key: 'm26', subtype: 'multi_completion', difficulty: 2, tags: ['real-numbers'],
    stem: bi(
      'i. সকল স্বাভাবিক সংখ্যা পূর্ণসংখ্যা\n\nii. সকল পূর্ণসংখ্যা মূলদ সংখ্যা\n\niii. $\\pi$ একটি মূলদ সংখ্যা\n\nনিচের কোনটি সঠিক?',
      'i. Every natural number is an integer\n\nii. Every integer is a rational number\n\niii. $\\pi$ is a rational number\n\nWhich is correct?'),
    options: MC_OPTS, answer: 0,
    explanation: bi('$n = \\frac{n}{1}$ বলে প্রতিটি পূর্ণসংখ্যা মূলদ। $\\pi$ অমূলদ, তাই iii ভুল।', 'Every integer is rational because $n = \\frac{n}{1}$. $\\pi$ is irrational, so iii is wrong.'),
  },
  {
    key: 'm27', subtype: 'multi_completion', difficulty: 3, tags: ['trigonometry'],
    stem: bi(
      '$\\sin\\theta = \\frac{3}{5}$ এবং $\\theta$ সূক্ষ্মকোণ হলে—\n\ni. $\\cos\\theta = \\frac{4}{5}$\n\nii. $\\tan\\theta = \\frac{3}{4}$\n\niii. $\\sec\\theta = \\frac{5}{4}$\n\nনিচের কোনটি সঠিক?',
      'If $\\sin\\theta = \\frac{3}{5}$ and $\\theta$ is acute:\n\ni. $\\cos\\theta = \\frac{4}{5}$\n\nii. $\\tan\\theta = \\frac{3}{4}$\n\niii. $\\sec\\theta = \\frac{5}{4}$\n\nWhich is correct?'),
    options: MC_OPTS, answer: 3,
    explanation: bi('লম্ব $3$, অতিভুজ $5$ হলে ভূমি $4$। তাই $\\cos\\theta = \\frac{4}{5}$, $\\tan\\theta = \\frac{3}{4}$, $\\sec\\theta = \\frac{5}{4}$; তিনটিই সঠিক।', 'Opposite $3$, hypotenuse $5$ gives adjacent $4$. So $\\cos\\theta = \\frac{4}{5}$, $\\tan\\theta = \\frac{3}{4}$, $\\sec\\theta = \\frac{5}{4}$: all three are right.'),
  },
  {
    key: 'm28', subtype: 'multi_completion', difficulty: 2, tags: ['triangles'],
    stem: bi(
      '$\\triangle ABC$ এ $\\angle A = 90^\\circ$ হলে—\n\ni. $BC$ বৃহত্তম বাহু\n\nii. $\\angle B$ স্থূলকোণ হতে পারে\n\niii. $\\angle B + \\angle C = 90^\\circ$\n\nনিচের কোনটি সঠিক?',
      'In $\\triangle ABC$, $\\angle A = 90^\\circ$:\n\ni. $BC$ is the longest side\n\nii. $\\angle B$ can be obtuse\n\niii. $\\angle B + \\angle C = 90^\\circ$\n\nWhich is correct?'),
    options: MC_OPTS, answer: 1,
    explanation: bi('সমকোণের বিপরীত বাহু বৃহত্তম। বাকি দুই কোণের সমষ্টি $90^\\circ$, তাই কোনোটিই স্থূলকোণ হতে পারে না।', 'The side opposite the right angle is longest. The other two angles add to $90^\\circ$, so neither can be obtuse.'),
  },
]

const triangle: Bi = bi('একটি সমকোণী ত্রিভুজের সমকোণ সংলগ্ন বাহু দুটি $6$ সেমি ও $8$ সেমি।', 'The two sides next to the right angle of a right triangle are $6$ cm and $8$ cm.')
mcqs.push(
  {
    key: 'm29', subtype: 'situation', context: triangle, difficulty: 2, tags: ['pythagoras'],
    stem: bi('ত্রিভুজটির অতিভুজের দৈর্ঘ্য কত?', 'How long is the hypotenuse?'),
    options: [bi('$14$ সেমি', '$14$ cm'), bi('$10$ সেমি', '$10$ cm'), bi('$12$ সেমি', '$12$ cm'), bi('$7$ সেমি', '$7$ cm')], answer: 1,
    explanation: bi('$\\sqrt{6^2 + 8^2} = \\sqrt{100} = 10$।', '$\\sqrt{6^2 + 8^2} = \\sqrt{100} = 10$.'),
  },
  {
    key: 'm30', subtype: 'situation', context: triangle, difficulty: 2, tags: ['mensuration'],
    stem: bi('ত্রিভুজটির ক্ষেত্রফল কত?', 'What is the area of the triangle?'),
    options: [bi('$48$ বর্গ সেমি', '$48$ cm²'), bi('$14$ বর্গ সেমি', '$14$ cm²'), bi('$28$ বর্গ সেমি', '$28$ cm²'), bi('$24$ বর্গ সেমি', '$24$ cm²')], answer: 3,
    explanation: bi('$\\frac{1}{2} \\times 6 \\times 8 = 24$।', '$\\frac{1}{2} \\times 6 \\times 8 = 24$.'),
  },
)

const r = (points: number, bn: string, en: string) => ({ points, criterion: bi(bn, en) })

const algebra: MockCqSrc[] = [
  {
    key: 'c01', stem: same('$x = \\sqrt{3} + \\sqrt{2}$'),
    parts: [
      { part: 'a', marks: 2, prompt: bi('$x^2$ এর মান নির্ণয় করো।', 'Find $x^2$.'),
        model: same('$x^2 = 3 + 2\\sqrt{6} + 2 = 5 + 2\\sqrt{6}$'),
        rubric: [r(1, '$(a + b)^2$ সূত্র প্রয়োগ', 'Uses $(a + b)^2$'), r(1, 'সঠিক মান $5 + 2\\sqrt{6}$', 'Correct value $5 + 2\\sqrt{6}$')] },
      { part: 'b', marks: 4, prompt: bi('দেখাও যে, $x + \\frac{1}{x} = 2\\sqrt{3}$ এবং $x^2 + \\frac{1}{x^2}$ এর মান নির্ণয় করো।', 'Show that $x + \\frac{1}{x} = 2\\sqrt{3}$ and find $x^2 + \\frac{1}{x^2}$.'),
        model: bi(
          '$\\frac{1}{x} = \\frac{\\sqrt{3} - \\sqrt{2}}{(\\sqrt{3} + \\sqrt{2})(\\sqrt{3} - \\sqrt{2})} = \\frac{\\sqrt{3} - \\sqrt{2}}{3 - 2} = \\sqrt{3} - \\sqrt{2}$\n\nতাই $x + \\frac{1}{x} = 2\\sqrt{3}$ (দেখানো হলো)।\n\n$x^2 + \\frac{1}{x^2} = (x + \\frac{1}{x})^2 - 2 = 12 - 2 = 10$',
          '$\\frac{1}{x} = \\frac{\\sqrt{3} - \\sqrt{2}}{(\\sqrt{3} + \\sqrt{2})(\\sqrt{3} - \\sqrt{2})} = \\frac{\\sqrt{3} - \\sqrt{2}}{3 - 2} = \\sqrt{3} - \\sqrt{2}$\n\nSo $x + \\frac{1}{x} = 2\\sqrt{3}$ (shown).\n\n$x^2 + \\frac{1}{x^2} = (x + \\frac{1}{x})^2 - 2 = 12 - 2 = 10$'),
        rubric: [r(1, 'হরকে মূলদ করে $\\frac{1}{x}$ বের করেছে', 'Rationalises to get $\\frac{1}{x}$'), r(1, '$x + \\frac{1}{x} = 2\\sqrt{3}$ দেখিয়েছে', 'Shows $x + \\frac{1}{x} = 2\\sqrt{3}$'), r(1, 'সঠিক সূত্র ব্যবহার', 'Uses the right identity'), r(1, 'উত্তর $10$', 'Answer $10$')] },
      { part: 'c', marks: 4, prompt: bi('$x^3 + \\frac{1}{x^3}$ এর মান নির্ণয় করো।', 'Find $x^3 + \\frac{1}{x^3}$.'),
        model: same('$x^3 + \\frac{1}{x^3} = (x + \\frac{1}{x})^3 - 3(x + \\frac{1}{x})$\n\n$= (2\\sqrt{3})^3 - 3 \\cdot 2\\sqrt{3} = 24\\sqrt{3} - 6\\sqrt{3} = 18\\sqrt{3}$'),
        rubric: [r(1, 'ঘনের সূত্র লিখেছে', 'Writes the cube identity'), r(1, '$(2\\sqrt{3})^3 = 24\\sqrt{3}$', '$(2\\sqrt{3})^3 = 24\\sqrt{3}$'), r(1, '$3 \\cdot 2\\sqrt{3} = 6\\sqrt{3}$', '$3 \\cdot 2\\sqrt{3} = 6\\sqrt{3}$'), r(1, 'উত্তর $18\\sqrt{3}$', 'Answer $18\\sqrt{3}$')] },
    ],
  },
  {
    key: 'c02', stem: bi('$U = \\{1, 2, 3, \\ldots, 10\\}$, $A = \\{x \\in U : x$ জোড় সংখ্যা$\\}$, $B = \\{x \\in U : x$ মৌলিক সংখ্যা$\\}$', '$U = \\{1, 2, 3, \\ldots, 10\\}$, $A = \\{x \\in U : x$ is even$\\}$, $B = \\{x \\in U : x$ is prime$\\}$'),
    parts: [
      { part: 'a', marks: 2, prompt: bi('$A$ ও $B$ কে তালিকা পদ্ধতিতে লেখো এবং $A \\cap B$ নির্ণয় করো।', 'List $A$ and $B$ and find $A \\cap B$.'),
        model: same('$A = \\{2, 4, 6, 8, 10\\}$, $B = \\{2, 3, 5, 7\\}$, $A \\cap B = \\{2\\}$'),
        rubric: [r(1, '$A$ ও $B$ সঠিক', '$A$ and $B$ correct'), r(1, '$A \\cap B = \\{2\\}$', '$A \\cap B = \\{2\\}$')] },
      { part: 'b', marks: 4, prompt: bi('$(A \\cup B)\'$ নির্ণয় করো।', 'Find $(A \\cup B)\'$.'),
        model: same('$A \\cup B = \\{2, 3, 4, 5, 6, 7, 8, 10\\}$\n\n$(A \\cup B)\' = U - (A \\cup B) = \\{1, 9\\}$'),
        rubric: [r(2, '$A \\cup B$ সঠিক', '$A \\cup B$ correct'), r(1, 'পূরক সেটের সংজ্ঞা প্রয়োগ', 'Uses the complement definition'), r(1, 'উত্তর $\\{1, 9\\}$', 'Answer $\\{1, 9\\}$')] },
      { part: 'c', marks: 4, prompt: bi('দেখাও যে, $(A \\cup B)\' = A\' \\cap B\'$।', 'Show that $(A \\cup B)\' = A\' \\cap B\'$.'),
        model: bi(
          '$A\' = \\{1, 3, 5, 7, 9\\}$, $B\' = \\{1, 4, 6, 8, 9, 10\\}$\n\n$A\' \\cap B\' = \\{1, 9\\}$\n\n(খ) থেকে $(A \\cup B)\' = \\{1, 9\\}$, তাই $(A \\cup B)\' = A\' \\cap B\'$ (দেখানো হলো)।',
          '$A\' = \\{1, 3, 5, 7, 9\\}$, $B\' = \\{1, 4, 6, 8, 9, 10\\}$\n\n$A\' \\cap B\' = \\{1, 9\\}$\n\nFrom (b), $(A \\cup B)\' = \\{1, 9\\}$, so $(A \\cup B)\' = A\' \\cap B\'$ (shown).'),
        rubric: [r(1, '$A\'$ সঠিক', '$A\'$ correct'), r(1, '$B\'$ সঠিক', '$B\'$ correct'), r(1, '$A\' \\cap B\'$ সঠিক', '$A\' \\cap B\'$ correct'), r(1, 'দুই পক্ষ মিলিয়ে সিদ্ধান্ত', 'Compares both sides and concludes')] },
    ],
  },
  {
    key: 'c03', stem: bi('$\\log 2 = 0.3010$ এবং $\\log 3 = 0.4771$ (ভিত্তি $10$)।', '$\\log 2 = 0.3010$ and $\\log 3 = 0.4771$ (base $10$).'),
    parts: [
      { part: 'a', marks: 2, prompt: bi('$\\log_3 81$ এর মান নির্ণয় করো।', 'Find $\\log_3 81$.'),
        model: same('$81 = 3^4$, $\\log_3 81 = 4$'),
        rubric: [r(1, '$81 = 3^4$ লিখেছে', 'Writes $81 = 3^4$'), r(1, 'উত্তর $4$', 'Answer $4$')] },
      { part: 'b', marks: 4, prompt: bi('সমাধান করো: $2^{x + 1} = 32$', 'Solve: $2^{x + 1} = 32$'),
        model: bi('$32 = 2^5$, তাই $2^{x + 1} = 2^5$\n\nভিত্তি সমান বলে $x + 1 = 5$, $x = 4$', '$32 = 2^5$, so $2^{x + 1} = 2^5$\n\nThe bases are equal, so $x + 1 = 5$, $x = 4$'),
        rubric: [r(1, '$32 = 2^5$', '$32 = 2^5$'), r(2, 'সূচক সমান করেছে', 'Equates the exponents'), r(1, 'উত্তর $x = 4$', 'Answer $x = 4$')] },
      { part: 'c', marks: 4, prompt: bi('$\\log 72$ এর মান নির্ণয় করো।', 'Find $\\log 72$.'),
        model: same('$72 = 2^3 \\times 3^2$\n\n$\\log 72 = 3\\log 2 + 2\\log 3 = 0.9030 + 0.9542 = 1.8572$'),
        rubric: [r(1, '$72 = 2^3 \\times 3^2$', '$72 = 2^3 \\times 3^2$'), r(1, 'লগের গুণ ও ঘাতের সূত্র প্রয়োগ', 'Uses product and power rules'), r(1, 'মান বসিয়েছে', 'Substitutes the values'), r(1, 'উত্তর $1.8572$', 'Answer $1.8572$')] },
    ],
  },
  {
    key: 'c04', stem: bi('সমীকরণজোট: $x + 2y = 8$ এবং $3x - y = 3$', 'Equations: $x + 2y = 8$ and $3x - y = 3$'),
    parts: [
      { part: 'a', marks: 2, prompt: bi('$(2, 3)$ প্রথম সমীকরণকে সিদ্ধ করে কি না যাচাই করো।', 'Check whether $(2, 3)$ satisfies the first equation.'),
        model: bi('$2 + 2 \\times 3 = 8$, তাই সিদ্ধ করে।', '$2 + 2 \\times 3 = 8$, so it does.'),
        rubric: [r(1, 'মান বসিয়েছে', 'Substitutes'), r(1, 'সঠিক সিদ্ধান্ত', 'Correct conclusion')] },
      { part: 'b', marks: 4, prompt: bi('প্রতিস্থাপন পদ্ধতিতে সমীকরণজোটের সমাধান করো।', 'Solve the pair by substitution.'),
        model: bi('প্রথমটি থেকে $x = 8 - 2y$। দ্বিতীয়টিতে বসিয়ে $3(8 - 2y) - y = 3$\n\n$24 - 7y = 3$, $y = 3$; তাহলে $x = 8 - 6 = 2$\n\nসমাধান $(x, y) = (2, 3)$', 'From the first, $x = 8 - 2y$. Put it in the second: $3(8 - 2y) - y = 3$\n\n$24 - 7y = 3$, $y = 3$; then $x = 8 - 6 = 2$\n\nSolution $(x, y) = (2, 3)$'),
        rubric: [r(1, '$x$ কে $y$ এর মাধ্যমে প্রকাশ', 'Expresses $x$ in terms of $y$'), r(1, 'সঠিকভাবে প্রতিস্থাপন', 'Substitutes correctly'), r(1, '$y = 3$', '$y = 3$'), r(1, '$x = 2$', '$x = 2$')] },
      { part: 'c', marks: 4, prompt: bi('$k$ এর কোন মানের জন্য $x + 2y = 8$ এবং $2x + ky = 5$ সমীকরণজোটের কোনো সমাধান থাকবে না?', 'For what value of $k$ do $x + 2y = 8$ and $2x + ky = 5$ have no solution?'),
        model: bi('সমাধান না থাকার শর্ত: $\\frac{1}{2} = \\frac{2}{k} \\neq \\frac{8}{5}$\n\n$\\frac{1}{2} = \\frac{2}{k}$ থেকে $k = 4$; এবং $\\frac{1}{2} \\neq \\frac{8}{5}$ সত্য।\n\nতাই $k = 4$ (রেখা দুটি সমান্তরাল)।', 'Condition for no solution: $\\frac{1}{2} = \\frac{2}{k} \\neq \\frac{8}{5}$\n\n$\\frac{1}{2} = \\frac{2}{k}$ gives $k = 4$; and $\\frac{1}{2} \\neq \\frac{8}{5}$ holds.\n\nSo $k = 4$ (the lines are parallel).'),
        rubric: [r(2, 'সঠিক শর্ত লিখেছে', 'Writes the correct condition'), r(1, '$k = 4$', '$k = 4$'), r(1, 'ধ্রুবকের অনুপাত যাচাই করেছে', 'Checks the constant ratio')] },
    ],
  },
]

const geometry: MockCqSrc[] = [
  {
    key: 'c05', stem: bi('$\\triangle ABC$ এ $AB = AC$ এবং $D$, $BC$ এর মধ্যবিন্দু।', 'In $\\triangle ABC$, $AB = AC$ and $D$ is the midpoint of $BC$.'),
    parts: [
      { part: 'a', marks: 2, prompt: bi('$\\angle B = 50^\\circ$ হলে $\\angle A$ নির্ণয় করো।', 'If $\\angle B = 50^\\circ$, find $\\angle A$.'),
        model: bi('$AB = AC$ বলে $\\angle C = \\angle B = 50^\\circ$। $\\angle A = 180^\\circ - 100^\\circ = 80^\\circ$', 'Since $AB = AC$, $\\angle C = \\angle B = 50^\\circ$. $\\angle A = 180^\\circ - 100^\\circ = 80^\\circ$'),
        rubric: [r(1, '$\\angle C = 50^\\circ$', '$\\angle C = 50^\\circ$'), r(1, '$\\angle A = 80^\\circ$', '$\\angle A = 80^\\circ$')] },
      { part: 'b', marks: 4, prompt: bi('প্রমাণ করো যে, $\\triangle ABD \\cong \\triangle ACD$।', 'Prove that $\\triangle ABD \\cong \\triangle ACD$.'),
        model: bi('$\\triangle ABD$ ও $\\triangle ACD$ এ: $AB = AC$ (দেওয়া আছে), $BD = CD$ ($D$ মধ্যবিন্দু), $AD$ সাধারণ বাহু।\n\nতিন বাহু সমান বলে (বাহু-বাহু-বাহু) $\\triangle ABD \\cong \\triangle ACD$।', 'In $\\triangle ABD$ and $\\triangle ACD$: $AB = AC$ (given), $BD = CD$ ($D$ is the midpoint), $AD$ is common.\n\nThree sides equal (SSS), so $\\triangle ABD \\cong \\triangle ACD$.'),
        rubric: [r(1, '$AB = AC$ উল্লেখ', 'States $AB = AC$'), r(1, '$BD = CD$ কারণসহ', '$BD = CD$ with reason'), r(1, '$AD$ সাধারণ', '$AD$ common'), r(1, 'বাহু-বাহু-বাহু উপপাদ্যে সিদ্ধান্ত', 'Concludes by SSS')] },
      { part: 'c', marks: 4, prompt: bi('প্রমাণ করো যে, $AD \\perp BC$।', 'Prove that $AD \\perp BC$.'),
        model: bi('(খ) থেকে $\\triangle ABD \\cong \\triangle ACD$, তাই $\\angle ADB = \\angle ADC$।\n\nকিন্তু $\\angle ADB + \\angle ADC = 180^\\circ$ (সরলকোণ)।\n\nতাই প্রতিটি $90^\\circ$, অর্থাৎ $AD \\perp BC$।', 'From (b), $\\triangle ABD \\cong \\triangle ACD$, so $\\angle ADB = \\angle ADC$.\n\nBut $\\angle ADB + \\angle ADC = 180^\\circ$ (straight angle).\n\nSo each is $90^\\circ$, i.e. $AD \\perp BC$.'),
        rubric: [r(1, 'সর্বসমতা থেকে কোণ সমান', 'Equal angles from congruence'), r(1, 'সরলকোণ $180^\\circ$', 'Straight angle $180^\\circ$'), r(1, 'প্রতিটি $90^\\circ$', 'Each is $90^\\circ$'), r(1, 'সিদ্ধান্ত', 'Conclusion')] },
    ],
  },
  {
    key: 'c06', stem: bi('$O$ কেন্দ্রবিশিষ্ট বৃত্তের ব্যাসার্ধ $5$ সেমি। $AB$ একটি জ্যা এবং $OM \\perp AB$।', 'A circle with centre $O$ has radius $5$ cm. $AB$ is a chord and $OM \\perp AB$.'),
    parts: [
      { part: 'a', marks: 2, prompt: bi('$OM = 3$ সেমি হলে $AM$ এর দৈর্ঘ্য নির্ণয় করো।', 'If $OM = 3$ cm, find $AM$.'),
        model: same('$AM = \\sqrt{OA^2 - OM^2} = \\sqrt{25 - 9} = 4$'),
        rubric: [r(1, 'পিথাগোরাস প্রয়োগ', 'Uses Pythagoras'), r(1, '$AM = 4$ সেমি', '$AM = 4$ cm')] },
      { part: 'b', marks: 4, prompt: bi('প্রমাণ করো যে, $AM = MB$।', 'Prove that $AM = MB$.'),
        model: bi('$O, A$ ও $O, B$ যোগ করি। সমকোণী $\\triangle OMA$ ও $\\triangle OMB$ এ অতিভুজ $OA = OB$ (ব্যাসার্ধ), $OM$ সাধারণ।\n\nসমকোণী ত্রিভুজের অতিভুজ-বাহু উপপাদ্যে $\\triangle OMA \\cong \\triangle OMB$, তাই $AM = MB$।', 'Join $OA$ and $OB$. In right triangles $OMA$ and $OMB$, hypotenuses $OA = OB$ (radii) and $OM$ is common.\n\nBy RHS, $\\triangle OMA \\cong \\triangle OMB$, so $AM = MB$.'),
        rubric: [r(1, 'অঙ্কন: $OA$, $OB$ যোগ', 'Construction: join $OA$, $OB$'), r(1, '$OA = OB$ ও $OM$ সাধারণ', '$OA = OB$ and $OM$ common'), r(1, 'অতিভুজ-বাহু সর্বসমতা', 'RHS congruence'), r(1, 'সিদ্ধান্ত', 'Conclusion')] },
      { part: 'c', marks: 4, prompt: bi('কেন্দ্র থেকে $4$ সেমি দূরের জ্যায়ের দৈর্ঘ্য নির্ণয় করো এবং দেখাও যে কেন্দ্রের নিকটতর জ্যা বৃহত্তর।', 'Find the length of a chord $4$ cm from the centre, and show that the chord nearer the centre is longer.'),
        model: bi('দূরত্ব $4$ হলে অর্ধজ্যা $\\sqrt{25 - 16} = 3$, জ্যা $= 6$ সেমি।\n\n(ক) থেকে দূরত্ব $3$ হলে জ্যা $AB = 2 \\times 4 = 8$ সেমি।\n\n$3 < 4$ এবং $8 > 6$, তাই কেন্দ্রের নিকটতর জ্যা বৃহত্তর।', 'At distance $4$, half-chord $= \\sqrt{25 - 16} = 3$, so the chord is $6$ cm.\n\nFrom (a), at distance $3$ the chord $AB = 2 \\times 4 = 8$ cm.\n\n$3 < 4$ and $8 > 6$, so the chord nearer the centre is longer.'),
        rubric: [r(1, 'অর্ধজ্যা $3$', 'Half-chord $3$'), r(1, 'জ্যা $6$ সেমি', 'Chord $6$ cm'), r(1, '$AB = 8$ সেমি', '$AB = 8$ cm'), r(1, 'তুলনা করে সিদ্ধান্ত', 'Compares and concludes')] },
    ],
  },
  {
    key: 'c07', stem: bi('$ABCD$ একটি আয়তক্ষেত্র, যার কর্ণ $AC$ ও $BD$ পরস্পর $O$ বিন্দুতে ছেদ করে।', '$ABCD$ is a rectangle whose diagonals $AC$ and $BD$ meet at $O$.'),
    parts: [
      { part: 'a', marks: 2, prompt: bi('$AB = 12$ সেমি ও $BC = 5$ সেমি হলে $AC$ নির্ণয় করো।', 'If $AB = 12$ cm and $BC = 5$ cm, find $AC$.'),
        model: same('$AC = \\sqrt{12^2 + 5^2} = \\sqrt{169} = 13$'),
        rubric: [r(1, 'পিথাগোরাস প্রয়োগ', 'Uses Pythagoras'), r(1, '$AC = 13$ সেমি', '$AC = 13$ cm')] },
      { part: 'b', marks: 4, prompt: bi('প্রমাণ করো যে, $AC = BD$।', 'Prove that $AC = BD$.'),
        model: bi('$\\triangle ABC$ ও $\\triangle BAD$ এ: $BC = AD$ (আয়তের বিপরীত বাহু), $AB$ সাধারণ, $\\angle ABC = \\angle BAD = 90^\\circ$।\n\nবাহু-কোণ-বাহু উপপাদ্যে $\\triangle ABC \\cong \\triangle BAD$, তাই $AC = BD$।', 'In $\\triangle ABC$ and $\\triangle BAD$: $BC = AD$ (opposite sides), $AB$ common, $\\angle ABC = \\angle BAD = 90^\\circ$.\n\nBy SAS, $\\triangle ABC \\cong \\triangle BAD$, so $AC = BD$.'),
        rubric: [r(1, '$BC = AD$', '$BC = AD$'), r(1, 'অন্তর্ভুক্ত কোণ সমকোণ', 'Included angles are right angles'), r(1, 'বাহু-কোণ-বাহু', 'SAS'), r(1, 'সিদ্ধান্ত', 'Conclusion')] },
      { part: 'c', marks: 4, prompt: bi('প্রমাণ করো যে, কর্ণদ্বয় পরস্পরকে সমদ্বিখণ্ডিত করে।', 'Prove that the diagonals bisect each other.'),
        model: bi('$\\triangle AOB$ ও $\\triangle COD$ এ: $AB = CD$, $AB \\parallel CD$ বলে $\\angle OAB = \\angle OCD$ এবং $\\angle OBA = \\angle ODC$ (একান্তর কোণ)।\n\nকোণ-বাহু-কোণ উপপাদ্যে $\\triangle AOB \\cong \\triangle COD$, তাই $OA = OC$ এবং $OB = OD$।', 'In $\\triangle AOB$ and $\\triangle COD$: $AB = CD$, and since $AB \\parallel CD$, $\\angle OAB = \\angle OCD$ and $\\angle OBA = \\angle ODC$ (alternate angles).\n\nBy ASA, $\\triangle AOB \\cong \\triangle COD$, so $OA = OC$ and $OB = OD$.'),
        rubric: [r(1, 'একান্তর কোণ সমান', 'Alternate angles equal'), r(1, '$AB = CD$', '$AB = CD$'), r(1, 'কোণ-বাহু-কোণ সর্বসমতা', 'ASA congruence'), r(1, '$OA = OC$, $OB = OD$', '$OA = OC$, $OB = OD$')] },
    ],
  },
  {
    key: 'c08', stem: bi('$O$ কেন্দ্রবিশিষ্ট বৃত্তে $BC$ চাপের ওপর বৃত্তস্থ কোণ $\\angle BAC$ এবং কেন্দ্রস্থ কোণ $\\angle BOC$।', 'In a circle with centre $O$, arc $BC$ makes the inscribed angle $\\angle BAC$ and the centre angle $\\angle BOC$.'),
    parts: [
      { part: 'a', marks: 2, prompt: bi('$\\angle BOC = 100^\\circ$ হলে $\\angle BAC$ কত?', 'If $\\angle BOC = 100^\\circ$, find $\\angle BAC$.'),
        model: bi('বৃত্তস্থ কোণ কেন্দ্রস্থ কোণের অর্ধেক: $\\angle BAC = 50^\\circ$', 'The inscribed angle is half the centre angle: $\\angle BAC = 50^\\circ$'),
        rubric: [r(1, 'সম্পর্ক উল্লেখ', 'States the relation'), r(1, '$50^\\circ$', '$50^\\circ$')] },
      { part: 'b', marks: 4, prompt: bi('প্রমাণ করো যে, $\\angle BOC = 2\\angle BAC$।', 'Prove that $\\angle BOC = 2\\angle BAC$.'),
        model: bi('$A, O$ যোগ করে $D$ পর্যন্ত বাড়াই। $\\triangle AOB$ এ $OA = OB$, তাই $\\angle OAB = \\angle OBA$।\n\nবহিঃস্থ কোণ $\\angle BOD = \\angle OAB + \\angle OBA = 2\\angle OAB$।\n\nএকইভাবে $\\angle COD = 2\\angle OAC$।\n\nযোগ করে $\\angle BOC = 2(\\angle OAB + \\angle OAC) = 2\\angle BAC$।', 'Join $AO$ and extend it to $D$. In $\\triangle AOB$, $OA = OB$, so $\\angle OAB = \\angle OBA$.\n\nExterior angle $\\angle BOD = \\angle OAB + \\angle OBA = 2\\angle OAB$.\n\nSimilarly $\\angle COD = 2\\angle OAC$.\n\nAdding, $\\angle BOC = 2(\\angle OAB + \\angle OAC) = 2\\angle BAC$.'),
        rubric: [r(1, 'অঙ্কন: $AO$ বর্ধিত', 'Construction: extend $AO$'), r(1, 'সমদ্বিবাহু ত্রিভুজের কোণ সমান', 'Base angles of isosceles triangle'), r(1, 'বহিঃস্থ কোণের উপপাদ্য', 'Exterior angle theorem'), r(1, 'যোগ করে সিদ্ধান্ত', 'Adds and concludes')] },
      { part: 'c', marks: 4, prompt: bi('$ABCD$ বৃত্তে অন্তর্লিখিত চতুর্ভুজ হলে প্রমাণ করো যে, $\\angle A + \\angle C = 180^\\circ$।', 'If $ABCD$ is a cyclic quadrilateral, prove that $\\angle A + \\angle C = 180^\\circ$.'),
        model: bi('$O$ এর সাথে $B$ ও $D$ যোগ করি। (খ) অনুযায়ী $BCD$ চাপের ওপর কেন্দ্রস্থ কোণ $= 2\\angle A$ এবং $BAD$ চাপের ওপর প্রবৃদ্ধ কেন্দ্রস্থ কোণ $= 2\\angle C$।\n\nকেন্দ্রে মোট কোণ $360^\\circ$: $2\\angle A + 2\\angle C = 360^\\circ$\n\nতাই $\\angle A + \\angle C = 180^\\circ$।', 'Join $OB$ and $OD$. By (b), the centre angle on arc $BCD$ is $2\\angle A$ and the reflex centre angle on arc $BAD$ is $2\\angle C$.\n\nAngles at the centre total $360^\\circ$: $2\\angle A + 2\\angle C = 360^\\circ$\n\nSo $\\angle A + \\angle C = 180^\\circ$.'),
        rubric: [r(1, 'অঙ্কন', 'Construction'), r(1, 'কেন্দ্রস্থ কোণ $2\\angle A$ ও $2\\angle C$', 'Centre angles $2\\angle A$ and $2\\angle C$'), r(1, 'সমষ্টি $360^\\circ$', 'Sum $360^\\circ$'), r(1, 'সিদ্ধান্ত', 'Conclusion')] },
    ],
  },
]

const trigMensuration: MockCqSrc[] = [
  {
    key: 'c09', stem: bi('$\\tan\\theta = \\frac{3}{4}$, যেখানে $\\theta$ সূক্ষ্মকোণ।', '$\\tan\\theta = \\frac{3}{4}$, where $\\theta$ is acute.'),
    parts: [
      { part: 'a', marks: 2, prompt: bi('$\\sin\\theta$ ও $\\cos\\theta$ এর মান নির্ণয় করো।', 'Find $\\sin\\theta$ and $\\cos\\theta$.'),
        model: bi('লম্ব $3$, ভূমি $4$, অতিভুজ $5$। $\\sin\\theta = \\frac{3}{5}$, $\\cos\\theta = \\frac{4}{5}$', 'Opposite $3$, adjacent $4$, hypotenuse $5$. $\\sin\\theta = \\frac{3}{5}$, $\\cos\\theta = \\frac{4}{5}$'),
        rubric: [r(1, 'অতিভুজ $5$', 'Hypotenuse $5$'), r(1, 'দুটি মান সঠিক', 'Both values correct')] },
      { part: 'b', marks: 4, prompt: bi('$\\frac{1 - \\tan^2\\theta}{1 + \\tan^2\\theta}$ এবং $\\cos^2\\theta - \\sin^2\\theta$ এর মান নির্ণয় করে তুলনা করো।', 'Find $\\frac{1 - \\tan^2\\theta}{1 + \\tan^2\\theta}$ and $\\cos^2\\theta - \\sin^2\\theta$ and compare them.'),
        model: bi('$\\frac{1 - \\frac{9}{16}}{1 + \\frac{9}{16}} = \\frac{7/16}{25/16} = \\frac{7}{25}$\n\n$\\cos^2\\theta - \\sin^2\\theta = \\frac{16}{25} - \\frac{9}{25} = \\frac{7}{25}$\n\nদুটি মান সমান।', '$\\frac{1 - \\frac{9}{16}}{1 + \\frac{9}{16}} = \\frac{7/16}{25/16} = \\frac{7}{25}$\n\n$\\cos^2\\theta - \\sin^2\\theta = \\frac{16}{25} - \\frac{9}{25} = \\frac{7}{25}$\n\nThe two values are equal.'),
        rubric: [r(1, 'প্রথম রাশিতে মান বসানো', 'Substitutes in the first'), r(1, 'প্রথম মান $\\frac{7}{25}$', 'First value $\\frac{7}{25}$'), r(1, 'দ্বিতীয় মান $\\frac{7}{25}$', 'Second value $\\frac{7}{25}$'), r(1, 'তুলনা', 'Comparison')] },
      { part: 'c', marks: 4, prompt: bi('যেকোনো সূক্ষ্মকোণ $\\theta$ এর জন্য প্রমাণ করো: $\\frac{1 - \\tan^2\\theta}{1 + \\tan^2\\theta} = \\cos^2\\theta - \\sin^2\\theta$', 'Prove for any acute $\\theta$: $\\frac{1 - \\tan^2\\theta}{1 + \\tan^2\\theta} = \\cos^2\\theta - \\sin^2\\theta$'),
        model: bi('বামপক্ষে লব ও হরকে $\\cos^2\\theta$ দিয়ে গুণ করি:\n\n$\\frac{\\cos^2\\theta - \\sin^2\\theta}{\\cos^2\\theta + \\sin^2\\theta} = \\frac{\\cos^2\\theta - \\sin^2\\theta}{1} = $ ডানপক্ষ (প্রমাণিত)', 'Multiply the top and bottom of the left side by $\\cos^2\\theta$:\n\n$\\frac{\\cos^2\\theta - \\sin^2\\theta}{\\cos^2\\theta + \\sin^2\\theta} = \\frac{\\cos^2\\theta - \\sin^2\\theta}{1} = $ right side (proved)'),
        rubric: [r(1, '$\\tan\\theta = \\frac{\\sin\\theta}{\\cos\\theta}$ ব্যবহার', 'Uses $\\tan\\theta = \\frac{\\sin\\theta}{\\cos\\theta}$'), r(1, '$\\cos^2\\theta$ দিয়ে গুণ', 'Multiplies by $\\cos^2\\theta$'), r(1, '$\\sin^2\\theta + \\cos^2\\theta = 1$', '$\\sin^2\\theta + \\cos^2\\theta = 1$'), r(1, 'সিদ্ধান্ত', 'Conclusion')] },
    ],
  },
  {
    key: 'c10', stem: bi('একটি গাছের গোড়া থেকে $30$ মিটার দূরে মাটির একটি বিন্দু থেকে গাছের মাথার উন্নতি কোণ $60^\\circ$।', 'From a point on the ground $30$ m from the foot of a tree, the angle of elevation of the top is $60^\\circ$.'),
    parts: [
      { part: 'a', marks: 2, prompt: bi('তথ্যটি চিত্রে দেখাও এবং গাছের উচ্চতা $h$ এর সাথে সম্পর্কটি লেখো।', 'Draw the situation and write the relation for the height $h$.'),
        model: bi('সমকোণী ত্রিভুজে ভূমি $30$ মিটার, লম্ব $h$, উন্নতি কোণ $60^\\circ$। $\\tan 60^\\circ = \\frac{h}{30}$', 'Right triangle with base $30$ m, height $h$, angle $60^\\circ$. $\\tan 60^\\circ = \\frac{h}{30}$'),
        rubric: [r(1, 'সঠিক চিত্র', 'Correct diagram'), r(1, '$\\tan 60^\\circ = \\frac{h}{30}$', '$\\tan 60^\\circ = \\frac{h}{30}$')] },
      { part: 'b', marks: 4, prompt: bi('গাছের উচ্চতা নির্ণয় করো।', 'Find the height of the tree.'),
        model: bi('$h = 30\\tan 60^\\circ = 30\\sqrt{3} \\approx 51.96$ মিটার', '$h = 30\\tan 60^\\circ = 30\\sqrt{3} \\approx 51.96$ m'),
        rubric: [r(1, '$\\tan 60^\\circ = \\sqrt{3}$', '$\\tan 60^\\circ = \\sqrt{3}$'), r(2, '$h = 30\\sqrt{3}$', '$h = 30\\sqrt{3}$'), r(1, 'আসন্ন মান $51.96$ মিটার', 'Approximate value $51.96$ m')] },
      { part: 'c', marks: 4, prompt: bi('বিন্দুটি থেকে গাছের দিক থেকে সরাসরি আর কত মিটার দূরে গেলে উন্নতি কোণ $30^\\circ$ হবে?', 'How much farther from the tree must you walk for the angle to become $30^\\circ$?'),
        model: bi('নতুন দূরত্ব $d$ হলে $\\tan 30^\\circ = \\frac{h}{d}$, $d = h\\sqrt{3} = 30\\sqrt{3} \\cdot \\sqrt{3} = 90$ মিটার।\n\nআরও যেতে হবে $90 - 30 = 60$ মিটার।', 'If the new distance is $d$, $\\tan 30^\\circ = \\frac{h}{d}$, so $d = h\\sqrt{3} = 30\\sqrt{3} \\cdot \\sqrt{3} = 90$ m.\n\nYou must walk $90 - 30 = 60$ m more.'),
        rubric: [r(1, '$\\tan 30^\\circ = \\frac{h}{d}$', '$\\tan 30^\\circ = \\frac{h}{d}$'), r(1, '$d = 90$ মিটার', '$d = 90$ m'), r(1, 'পার্থক্য নেওয়া', 'Takes the difference'), r(1, 'উত্তর $60$ মিটার', 'Answer $60$ m')] },
    ],
  },
  {
    key: 'c11', stem: bi('একটি আয়তাকার মাঠের দৈর্ঘ্য $40$ মিটার ও প্রস্থ $30$ মিটার। মাঠের ভেতরে চারদিক ঘিরে $2$ মিটার চওড়া একটি রাস্তা আছে।', 'A rectangular field is $40$ m long and $30$ m wide. A path $2$ m wide runs inside it along all four sides.'),
    parts: [
      { part: 'a', marks: 2, prompt: bi('মাঠের ক্ষেত্রফল ও কর্ণের দৈর্ঘ্য নির্ণয় করো।', 'Find the area and the diagonal of the field.'),
        model: bi('ক্ষেত্রফল $40 \\times 30 = 1200$ বর্গমিটার; কর্ণ $\\sqrt{40^2 + 30^2} = 50$ মিটার', 'Area $40 \\times 30 = 1200$ m²; diagonal $\\sqrt{40^2 + 30^2} = 50$ m'),
        rubric: [r(1, 'ক্ষেত্রফল $1200$', 'Area $1200$'), r(1, 'কর্ণ $50$', 'Diagonal $50$')] },
      { part: 'b', marks: 4, prompt: bi('রাস্তার ক্ষেত্রফল নির্ণয় করো।', 'Find the area of the path.'),
        model: bi('ভেতরের অংশ: $(40 - 4) \\times (30 - 4) = 36 \\times 26 = 936$ বর্গমিটার\n\nরাস্তা: $1200 - 936 = 264$ বর্গমিটার', 'Inner part: $(40 - 4) \\times (30 - 4) = 36 \\times 26 = 936$ m²\n\nPath: $1200 - 936 = 264$ m²'),
        rubric: [r(1, 'ভেতরের মাপ $36$ ও $26$', 'Inner sides $36$ and $26$'), r(1, 'ভেতরের ক্ষেত্রফল $936$', 'Inner area $936$'), r(1, 'বিয়োগ', 'Subtracts'), r(1, 'উত্তর $264$', 'Answer $264$')] },
      { part: 'c', marks: 4, prompt: bi('প্রতি বর্গমিটারে $50$ টাকা হিসেবে রাস্তা ইট দিয়ে বাঁধাতে কত খরচ হবে? প্রতিটি ইট $0.05$ বর্গমিটার জায়গা ঢাকলে কয়টি ইট লাগবে?', 'At $50$ taka per m², what does it cost to pave the path? If each brick covers $0.05$ m², how many bricks are needed?'),
        model: bi('খরচ $264 \\times 50 = 13200$ টাকা\n\nইট $\\frac{264}{0.05} = 5280$টি', 'Cost $264 \\times 50 = 13200$ taka\n\nBricks $\\frac{264}{0.05} = 5280$'),
        rubric: [r(1, 'খরচের হিসাব', 'Cost method'), r(1, '$13200$ টাকা', '$13200$ taka'), r(1, 'ইটের হিসাব', 'Brick method'), r(1, '$5280$টি', '$5280$ bricks')] },
    ],
  },
]

export const mathMock01: MockSrc = {
  key: 'mock-109-01',
  subject_code: '109',
  title: bi('গণিত মডেল টেস্ট ১', 'Mathematics model test 1'),
  exam_year: 2027,
  duration_mcq_min: 30,
  duration_cq_min: 150,
  marks: { mcq: 30, cq: 70 },
  cq_rules: { answer: 7, min_per_section: 2 },
  mcqs,
  sections: [
    { key: 'ka', title: bi('ক বিভাগ: বীজগণিত', 'Section A: Algebra'), cqs: algebra },
    { key: 'kha', title: bi('খ বিভাগ: জ্যামিতি', 'Section B: Geometry'), cqs: geometry },
    { key: 'ga', title: bi('গ বিভাগ: ত্রিকোণমিতি ও পরিমিতি', 'Section C: Trigonometry and mensuration'), cqs: trigMensuration },
  ],
}
