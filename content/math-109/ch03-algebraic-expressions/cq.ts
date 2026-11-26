import type { CqSrc } from '../../types'

// 4 original creative questions. Marks: (a) knowledge 1, (b) comprehension 2,
// (c) application 3, (d) higher-order 4. Each part has a model answer and a rubric
// whose points add up to the part's marks.

export const cqs: CqSrc[] = [
  {
    key: 'cq01', difficulty: 3, tags: ['reciprocal'],
    stem: { bn: '$x + \\frac{1}{x} = 3$', en: '$x + \\frac{1}{x} = 3$' },
    parts: [
      {
        part: 'a',
        prompt: { bn: '$x^2 + \\frac{1}{x^2}$ এর মান নির্ণয় করো।', en: 'Find the value of $x^2 + \\frac{1}{x^2}$.' },
        model: { bn: '$x^2 + \\frac{1}{x^2} = (x + \\frac{1}{x})^2 - 2 = 3^2 - 2 = 7$', en: '$x^2 + \\frac{1}{x^2} = (x + \\frac{1}{x})^2 - 2 = 3^2 - 2 = 7$' },
        rubric: [{ points: 1, criterion: { bn: 'সঠিক সূত্র ব্যবহার করে মান $7$ পেয়েছে', en: 'Uses the right identity and gets $7$' } }],
      },
      {
        part: 'b',
        prompt: { bn: 'দেখাও যে, $(x - \\frac{1}{x})^2 = 5$।', en: 'Show that $(x - \\frac{1}{x})^2 = 5$.' },
        model: {
          bn: '$(x - \\frac{1}{x})^2 = (x + \\frac{1}{x})^2 - 4 \\cdot x \\cdot \\frac{1}{x}$\n\n$= 3^2 - 4 = 9 - 4 = 5$ (দেখানো হলো)',
          en: '$(x - \\frac{1}{x})^2 = (x + \\frac{1}{x})^2 - 4 \\cdot x \\cdot \\frac{1}{x}$\n\n$= 3^2 - 4 = 9 - 4 = 5$ (shown)',
        },
        rubric: [
          { points: 1, criterion: { bn: '$(a - b)^2 = (a + b)^2 - 4ab$ সম্পর্কটি লিখেছে', en: 'Writes $(a - b)^2 = (a + b)^2 - 4ab$' } },
          { points: 1, criterion: { bn: 'মান বসিয়ে $5$ দেখিয়েছে', en: 'Substitutes and shows $5$' } },
        ],
      },
      {
        part: 'c',
        prompt: { bn: '$x^3 + \\frac{1}{x^3}$ এর মান নির্ণয় করো।', en: 'Find the value of $x^3 + \\frac{1}{x^3}$.' },
        model: {
          bn: '$a^3 + b^3 = (a + b)^3 - 3ab(a + b)$ সূত্রে $a = x$, $b = \\frac{1}{x}$, $ab = 1$:\n\n$x^3 + \\frac{1}{x^3} = (x + \\frac{1}{x})^3 - 3(x + \\frac{1}{x})$\n\n$= 27 - 9 = 18$',
          en: 'Use $a^3 + b^3 = (a + b)^3 - 3ab(a + b)$ with $a = x$, $b = \\frac{1}{x}$, $ab = 1$:\n\n$x^3 + \\frac{1}{x^3} = (x + \\frac{1}{x})^3 - 3(x + \\frac{1}{x})$\n\n$= 27 - 9 = 18$',
        },
        rubric: [
          { points: 1, criterion: { bn: 'ঘনের সঠিক সূত্র লিখেছে', en: 'Writes the correct cube identity' } },
          { points: 1, criterion: { bn: '$ab = 1$ ধরে সঠিকভাবে মান বসিয়েছে', en: 'Uses $ab = 1$ and substitutes correctly' } },
          { points: 1, criterion: { bn: 'সঠিক উত্তর $18$', en: 'Correct answer $18$' } },
        ],
      },
      {
        part: 'd',
        prompt: { bn: 'প্রমাণ করো যে, $x^5 + \\frac{1}{x^5} = 123$।', en: 'Prove that $x^5 + \\frac{1}{x^5} = 123$.' },
        model: {
          bn: '$(x^2 + \\frac{1}{x^2})(x^3 + \\frac{1}{x^3}) = x^5 + \\frac{1}{x} + x + \\frac{1}{x^5}$\n\nতাই $x^5 + \\frac{1}{x^5} = (x^2 + \\frac{1}{x^2})(x^3 + \\frac{1}{x^3}) - (x + \\frac{1}{x})$\n\n(ক) ও (গ) থেকে: $= 7 \\times 18 - 3 = 126 - 3 = 123$ (প্রমাণিত)',
          en: '$(x^2 + \\frac{1}{x^2})(x^3 + \\frac{1}{x^3}) = x^5 + \\frac{1}{x} + x + \\frac{1}{x^5}$\n\nSo $x^5 + \\frac{1}{x^5} = (x^2 + \\frac{1}{x^2})(x^3 + \\frac{1}{x^3}) - (x + \\frac{1}{x})$\n\nFrom (a) and (c): $= 7 \\times 18 - 3 = 126 - 3 = 123$ (proved)',
        },
        rubric: [
          { points: 1, criterion: { bn: 'বর্গ ও ঘনের রাশি গুণ করার কৌশল বেছে নিয়েছে', en: 'Chooses to multiply the square and cube expressions' } },
          { points: 1, criterion: { bn: 'গুণফল সঠিকভাবে বিস্তৃত করেছে', en: 'Expands the product correctly' } },
          { points: 1, criterion: { bn: '$x + \\frac{1}{x}$ বিয়োগ করে সম্পর্ক সাজিয়েছে', en: 'Rearranges by subtracting $x + \\frac{1}{x}$' } },
          { points: 1, criterion: { bn: 'আগের ফল ব্যবহার করে $123$ প্রমাণ করেছে', en: 'Uses earlier results to reach $123$' } },
        ],
      },
    ],
  },
  {
    key: 'cq02', difficulty: 4, tags: ['factorise', 'middle-term', 'cube-sum'],
    stem: { bn: '$A = x^2 + 5x + 6$, $B = x^2 - 4$, $C = x^3 + 8$', en: '$A = x^2 + 5x + 6$, $B = x^2 - 4$, $C = x^3 + 8$' },
    parts: [
      {
        part: 'a',
        prompt: { bn: '$B$ কে উৎপাদকে বিশ্লেষণ করো।', en: 'Factorise $B$.' },
        model: { bn: '$B = x^2 - 2^2 = (x + 2)(x - 2)$', en: '$B = x^2 - 2^2 = (x + 2)(x - 2)$' },
        rubric: [{ points: 1, criterion: { bn: 'সঠিক উৎপাদক', en: 'Correct factors' } }],
      },
      {
        part: 'b',
        prompt: { bn: 'মধ্যপদ বিভক্তিকরণের মাধ্যমে $A$ কে উৎপাদকে বিশ্লেষণ করো।', en: 'Factorise $A$ by splitting the middle term.' },
        model: {
          bn: 'গুণফল $6$, যোগফল $5$: সংখ্যা দুটি $2$ ও $3$।\n\n$A = x^2 + 2x + 3x + 6 = x(x + 2) + 3(x + 2) = (x + 2)(x + 3)$',
          en: 'Product $6$, sum $5$: the numbers are $2$ and $3$.\n\n$A = x^2 + 2x + 3x + 6 = x(x + 2) + 3(x + 2) = (x + 2)(x + 3)$',
        },
        rubric: [
          { points: 1, criterion: { bn: 'মধ্যপদ $2x + 3x$ এ ভেঙেছে', en: 'Splits the middle term as $2x + 3x$' } },
          { points: 1, criterion: { bn: 'সাধারণ উৎপাদক বের করে সঠিক উত্তর', en: 'Takes common factors and gets the right answer' } },
        ],
      },
      {
        part: 'c',
        prompt: { bn: '$C$ কে উৎপাদকে বিশ্লেষণ করো এবং $A$, $B$, $C$ এর সাধারণ উৎপাদক নির্ণয় করো।', en: 'Factorise $C$ and find the common factor of $A$, $B$ and $C$.' },
        model: {
          bn: '$C = x^3 + 2^3 = (x + 2)(x^2 - 2x + 4)$\n\n$A = (x + 2)(x + 3)$, $B = (x + 2)(x - 2)$\n\nতিনটিতেই আছে $(x + 2)$, তাই সাধারণ উৎপাদক $x + 2$।',
          en: '$C = x^3 + 2^3 = (x + 2)(x^2 - 2x + 4)$\n\n$A = (x + 2)(x + 3)$, $B = (x + 2)(x - 2)$\n\nAll three contain $(x + 2)$, so the common factor is $x + 2$.',
        },
        rubric: [
          { points: 1, criterion: { bn: '$a^3 + b^3$ সূত্র ব্যবহার', en: 'Uses the $a^3 + b^3$ identity' } },
          { points: 1, criterion: { bn: '$C$ এর সঠিক উৎপাদক', en: 'Correct factors of $C$' } },
          { points: 1, criterion: { bn: 'সাধারণ উৎপাদক $x + 2$', en: 'Common factor $x + 2$' } },
        ],
      },
      {
        part: 'd',
        prompt: { bn: '$\\frac{A - B}{C}$ কে লঘিষ্ঠ আকারে প্রকাশ করো এবং দেখাও যে বাস্তব $x$ এর জন্য এর সর্বোচ্চ মান $\\frac{5}{3}$।', en: 'Express $\\frac{A - B}{C}$ in lowest terms and show that its greatest value for real $x$ is $\\frac{5}{3}$.' },
        model: {
          bn: '$A - B = (x^2 + 5x + 6) - (x^2 - 4) = 5x + 10 = 5(x + 2)$\n\n$\\frac{A - B}{C} = \\frac{5(x + 2)}{(x + 2)(x^2 - 2x + 4)} = \\frac{5}{x^2 - 2x + 4}$ (যখন $x \\ne -2$)\n\nহর: $x^2 - 2x + 4 = (x - 1)^2 + 3 \\ge 3$, কারণ কোনো বর্গ ঋণাত্মক নয়।\n\nহর সবচেয়ে ছোট হলে ভগ্নাংশ সবচেয়ে বড়। $x = 1$ হলে হর $3$, তাই সর্বোচ্চ মান $\\frac{5}{3}$।',
          en: '$A - B = (x^2 + 5x + 6) - (x^2 - 4) = 5x + 10 = 5(x + 2)$\n\n$\\frac{A - B}{C} = \\frac{5(x + 2)}{(x + 2)(x^2 - 2x + 4)} = \\frac{5}{x^2 - 2x + 4}$ (for $x \\ne -2$)\n\nDenominator: $x^2 - 2x + 4 = (x - 1)^2 + 3 \\ge 3$, since no square is negative.\n\nThe fraction is largest when the denominator is smallest. At $x = 1$ the denominator is $3$, so the greatest value is $\\frac{5}{3}$.',
        },
        rubric: [
          { points: 1, criterion: { bn: '$A - B = 5(x + 2)$', en: '$A - B = 5(x + 2)$' } },
          { points: 1, criterion: { bn: 'সাধারণ উৎপাদক কেটে $\\frac{5}{x^2 - 2x + 4}$', en: 'Cancels to $\\frac{5}{x^2 - 2x + 4}$' } },
          { points: 1, criterion: { bn: 'হরকে $(x - 1)^2 + 3$ আকারে লিখেছে', en: 'Writes the denominator as $(x - 1)^2 + 3$' } },
          { points: 1, criterion: { bn: 'যুক্তিসহ সর্বোচ্চ মান $\\frac{5}{3}$', en: 'Reasons to the greatest value $\\frac{5}{3}$' } },
        ],
      },
    ],
  },
  {
    key: 'cq03', difficulty: 3, tags: ['difference-of-squares', 'area', 'real-life'],
    stem: {
      bn: 'একটি আয়তাকার জমির দৈর্ঘ্য $(2x + 3)$ মিটার ও প্রস্থ $(2x - 3)$ মিটার। পাশের একটি বর্গাকার জমির প্রতিটি বাহু $(2x + 1)$ মিটার।',
      en: 'A rectangular plot is $(2x + 3)$ m long and $(2x - 3)$ m wide. Next to it, a square plot has sides of $(2x + 1)$ m.',
    },
    parts: [
      {
        part: 'a',
        prompt: { bn: 'আয়তাকার জমির ক্ষেত্রফল $x$ এর মাধ্যমে প্রকাশ করো।', en: 'Express the area of the rectangular plot in terms of $x$.' },
        model: { bn: '$(2x + 3)(2x - 3) = (2x)^2 - 3^2 = 4x^2 - 9$ বর্গমিটার', en: '$(2x + 3)(2x - 3) = (2x)^2 - 3^2 = 4x^2 - 9$ square metres' },
        rubric: [{ points: 1, criterion: { bn: '$4x^2 - 9$', en: '$4x^2 - 9$' } }],
      },
      {
        part: 'b',
        prompt: { bn: 'কোন জমিটি বড় এবং কত বর্গমিটার বড়?', en: 'Which plot is larger, and by how many square metres?' },
        model: {
          bn: 'বর্গাকার জমি: $(2x + 1)^2 = 4x^2 + 4x + 1$\n\nপার্থক্য: $(4x^2 + 4x + 1) - (4x^2 - 9) = 4x + 10$\n\nজমির মাপ ধনাত্মক হতে হলে $x > 1.5$, তাই $4x + 10 > 0$। বর্গাকার জমিটি $(4x + 10)$ বর্গমিটার বড়।',
          en: 'Square plot: $(2x + 1)^2 = 4x^2 + 4x + 1$\n\nDifference: $(4x^2 + 4x + 1) - (4x^2 - 9) = 4x + 10$\n\nFor real lengths $x > 1.5$, so $4x + 10 > 0$. The square plot is larger by $(4x + 10)$ square metres.',
        },
        rubric: [
          { points: 1, criterion: { bn: 'বর্গের ক্ষেত্রফল সঠিক', en: 'Correct area of the square' } },
          { points: 1, criterion: { bn: 'পার্থক্য $4x + 10$ ও কোনটি বড় তা বলেছে', en: 'Difference $4x + 10$ and says which is larger' } },
        ],
      },
      {
        part: 'c',
        prompt: { bn: 'আয়তাকার জমির পরিসীমা $40$ মিটার হলে $x$ এর মান এবং দুটি জমির ক্ষেত্রফল নির্ণয় করো।', en: 'If the perimeter of the rectangular plot is $40$ m, find $x$ and the area of both plots.' },
        model: {
          bn: 'পরিসীমা $= 2\\{(2x + 3) + (2x - 3)\\} = 2 \\times 4x = 8x$\n\n$8x = 40$, তাই $x = 5$\n\nআয়তাকার: $13 \\times 7 = 91$ বর্গমিটার; বর্গাকার: $11^2 = 121$ বর্গমিটার',
          en: 'Perimeter $= 2\\{(2x + 3) + (2x - 3)\\} = 2 \\times 4x = 8x$\n\n$8x = 40$, so $x = 5$\n\nRectangle: $13 \\times 7 = 91$ sq m; square: $11^2 = 121$ sq m',
        },
        rubric: [
          { points: 1, criterion: { bn: 'পরিসীমা $8x$ লিখে $x = 5$', en: 'Perimeter $8x$, so $x = 5$' } },
          { points: 1, criterion: { bn: 'আয়তের ক্ষেত্রফল $91$', en: 'Rectangle area $91$' } },
          { points: 1, criterion: { bn: 'বর্গের ক্ষেত্রফল $121$', en: 'Square area $121$' } },
        ],
      },
      {
        part: 'd',
        prompt: {
          bn: '(গ) এর মান ধরে বর্গাকার জমির ভেতরে চারদিকে $1$ মিটার চওড়া একটি রাস্তা আছে। $a^2 - b^2$ সূত্র ব্যবহার করে রাস্তার ক্ষেত্রফল নির্ণয় করো এবং প্রতি বর্গমিটার $50$ টাকা হিসেবে রাস্তা বাঁধাতে কত খরচ হবে বের করো।',
          en: 'Using the value from (c), a path $1$ m wide runs along the inside of the square plot. Use $a^2 - b^2$ to find the area of the path, and the cost of paving it at Tk $50$ per square metre.',
        },
        model: {
          bn: 'বাইরের বাহু $11$ মিটার। দুই পাশে $1$ মিটার করে রাস্তা, তাই ভেতরের বাহু $11 - 2 = 9$ মিটার।\n\nরাস্তার ক্ষেত্রফল $= 11^2 - 9^2 = (11 + 9)(11 - 9) = 20 \\times 2 = 40$ বর্গমিটার\n\nখরচ $= 40 \\times 50 = 2000$ টাকা',
          en: 'Outer side $11$ m. The path takes $1$ m on each side, so the inner side is $11 - 2 = 9$ m.\n\nPath area $= 11^2 - 9^2 = (11 + 9)(11 - 9) = 20 \\times 2 = 40$ sq m\n\nCost $= 40 \\times 50 = $ Tk $2000$',
        },
        rubric: [
          { points: 1, criterion: { bn: 'ভেতরের বাহু $9$ মিটার (দুই পাশ বাদ)', en: 'Inner side $9$ m (both sides removed)' } },
          { points: 1, criterion: { bn: '$a^2 - b^2 = (a + b)(a - b)$ প্রয়োগ', en: 'Applies $a^2 - b^2 = (a + b)(a - b)$' } },
          { points: 1, criterion: { bn: 'রাস্তার ক্ষেত্রফল $40$', en: 'Path area $40$' } },
          { points: 1, criterion: { bn: 'খরচ $2000$ টাকা', en: 'Cost Tk $2000$' } },
        ],
      },
    ],
  },
  {
    key: 'cq04', difficulty: 3, tags: ['sum-product', 'cube-sum'],
    stem: { bn: '$a + b = 6$ এবং $ab = 8$', en: '$a + b = 6$ and $ab = 8$' },
    parts: [
      {
        part: 'a',
        prompt: { bn: '$a^2 + b^2$ এর মান নির্ণয় করো।', en: 'Find $a^2 + b^2$.' },
        model: { bn: '$a^2 + b^2 = (a + b)^2 - 2ab = 36 - 16 = 20$', en: '$a^2 + b^2 = (a + b)^2 - 2ab = 36 - 16 = 20$' },
        rubric: [{ points: 1, criterion: { bn: 'সঠিক মান $20$', en: 'Correct value $20$' } }],
      },
      {
        part: 'b',
        prompt: { bn: '$(a - b)^2$ এর মান নির্ণয় করো।', en: 'Find $(a - b)^2$.' },
        model: { bn: '$(a - b)^2 = (a + b)^2 - 4ab = 36 - 32 = 4$', en: '$(a - b)^2 = (a + b)^2 - 4ab = 36 - 32 = 4$' },
        rubric: [
          { points: 1, criterion: { bn: 'সম্পর্ক $(a - b)^2 = (a + b)^2 - 4ab$', en: 'Relation $(a - b)^2 = (a + b)^2 - 4ab$' } },
          { points: 1, criterion: { bn: 'সঠিক মান $4$', en: 'Correct value $4$' } },
        ],
      },
      {
        part: 'c',
        prompt: { bn: '$a^3 + b^3$ এর মান নির্ণয় করো।', en: 'Find $a^3 + b^3$.' },
        model: { bn: '$a^3 + b^3 = (a + b)^3 - 3ab(a + b) = 216 - 3 \\times 8 \\times 6 = 216 - 144 = 72$', en: '$a^3 + b^3 = (a + b)^3 - 3ab(a + b) = 216 - 3 \\times 8 \\times 6 = 216 - 144 = 72$' },
        rubric: [
          { points: 1, criterion: { bn: 'সঠিক সূত্র', en: 'Correct identity' } },
          { points: 1, criterion: { bn: 'মান বসানো', en: 'Substitution' } },
          { points: 1, criterion: { bn: 'সঠিক উত্তর $72$', en: 'Correct answer $72$' } },
        ],
      },
      {
        part: 'd',
        prompt: { bn: 'উৎপাদকে বিশ্লেষণ ব্যবহার করে দেখাও যে, $a^4 + a^2b^2 + b^4 = 336$।', en: 'Using factorisation, show that $a^4 + a^2b^2 + b^4 = 336$.' },
        model: {
          bn: '$a^4 + a^2b^2 + b^4 = (a^2 + b^2)^2 - a^2b^2 = (a^2 + b^2 + ab)(a^2 + b^2 - ab)$\n\n(ক) থেকে $a^2 + b^2 = 20$, আর $ab = 8$:\n\n$= (20 + 8)(20 - 8) = 28 \\times 12 = 336$ (দেখানো হলো)',
          en: '$a^4 + a^2b^2 + b^4 = (a^2 + b^2)^2 - a^2b^2 = (a^2 + b^2 + ab)(a^2 + b^2 - ab)$\n\nFrom (a), $a^2 + b^2 = 20$, and $ab = 8$:\n\n$= (20 + 8)(20 - 8) = 28 \\times 12 = 336$ (shown)',
        },
        rubric: [
          { points: 1, criterion: { bn: '$(a^2 + b^2)^2 - a^2b^2$ আকারে লিখেছে', en: 'Writes it as $(a^2 + b^2)^2 - a^2b^2$' } },
          { points: 1, criterion: { bn: 'বর্গের অন্তর হিসেবে উৎপাদক', en: 'Factorises as a difference of squares' } },
          { points: 1, criterion: { bn: 'আগের মান বসিয়েছে', en: 'Substitutes earlier values' } },
          { points: 1, criterion: { bn: 'সঠিক ফল $336$', en: 'Correct result $336$' } },
        ],
      },
    ],
  },
]
