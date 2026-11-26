import type { LessonSrc } from '../../types'

// Original lesson. One idea per scene, every term defined before use, no skipped steps.
// A "check yourself" question comes every 2-3 scenes and must be answered to continue.

const squareSplitSvg = `<svg viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg" role="img" font-family="inherit" font-size="18">
<rect x="20" y="20" width="140" height="140" fill="rgb(var(--accent) / .35)" stroke="currentColor" stroke-width="2"/>
<rect x="160" y="20" width="60" height="140" fill="rgb(var(--g-science) / .25)" stroke="currentColor" stroke-width="2"/>
<rect x="20" y="160" width="140" height="60" fill="rgb(var(--g-science) / .25)" stroke="currentColor" stroke-width="2"/>
<rect x="160" y="160" width="60" height="60" fill="rgb(var(--g-compulsory) / .3)" stroke="currentColor" stroke-width="2"/>
<text x="90" y="96" text-anchor="middle" fill="currentColor">a²</text>
<text x="190" y="96" text-anchor="middle" fill="currentColor">ab</text>
<text x="90" y="196" text-anchor="middle" fill="currentColor">ab</text>
<text x="190" y="196" text-anchor="middle" fill="currentColor">b²</text>
<text x="90" y="14" text-anchor="middle" fill="currentColor">a</text>
<text x="190" y="14" text-anchor="middle" fill="currentColor">b</text>
<text x="10" y="96" text-anchor="middle" fill="currentColor">a</text>
<text x="10" y="196" text-anchor="middle" fill="currentColor">b</text>
</svg>`

export const lesson: LessonSrc = {
  key: 'math-109-ch03-lesson-01',
  title: { bn: 'বর্গের দুটি সূত্র: (a + b)² ও (a − b)²', en: 'Two square formulas: (a + b)² and (a − b)²' },
  scenes: [
    {
      type: 'text',
      title: { bn: 'বীজগাণিতিক রাশি কী?', en: 'What is an algebraic expression?' },
      bullets: [
        { bn: 'যে সংখ্যার মান আমরা এখনো জানি না, তাকে একটি অক্ষর দিয়ে লিখি। এই অক্ষরকে বলে চলক, যেমন $x$।', en: 'When we do not yet know a number, we write it as a letter. That letter is called a variable, like $x$.' },
        { bn: 'রহিম প্রতিটি ৫ টাকা দামের $x$টি আম কিনল। মোট দাম $5x$ টাকা। এখানে $5x$ একটি বীজগাণিতিক রাশি।', en: 'Rahim buys $x$ mangoes at 5 taka each. The total cost is $5x$ taka. $5x$ is an algebraic expression.' },
        { bn: '$+$ বা $-$ চিহ্ন দিয়ে আলাদা করা প্রতিটি অংশকে বলে পদ। $5x + 10$ রাশিতে দুটি পদ: $5x$ এবং $10$।', en: 'Each part separated by $+$ or $-$ is called a term. $5x + 10$ has two terms: $5x$ and $10$.' },
      ],
      narration: {
        bn: 'আজ আমরা একবারে একটি ধাপ এগোব। প্রথমে একটা শব্দ শিখি: চলক। যে সংখ্যা আমরা এখনো জানি না, তাকে x-এর মতো একটা অক্ষর দিয়ে লিখি। ধরো রহিম বাজার থেকে কয়েকটা আম কিনল, প্রতিটার দাম পাঁচ টাকা। কয়টা কিনল জানি না, তাই বলি x টা। তাহলে মোট দাম পাঁচ x টাকা। এই পাঁচ x হলো একটি বীজগাণিতিক রাশি। আর যোগ বা বিয়োগ চিহ্ন দিয়ে আলাদা প্রতিটি অংশকে বলে পদ।',
        en: 'Today we go one step at a time. First, a new word: variable. When we do not know a number yet, we write it with a letter like x. Say Rahim buys some mangoes at five taka each. We do not know how many, so we say x. The total cost is five x taka. Five x is an algebraic expression. Each part separated by a plus or minus sign is called a term.',
      },
    },
    {
      type: 'diagram',
      title: { bn: 'বর্গ মানে কী? একটি বর্গক্ষেত্র দিয়ে দেখি', en: 'What does "square" mean? Let us look at a square' },
      svg: squareSplitSvg,
      bullets: [
        { bn: '$a^2$ মানে $a \\times a$। একটি বর্গক্ষেত্রের বাহু $a$ হলে তার ক্ষেত্রফল $a^2$।', en: '$a^2$ means $a \\times a$. A square with side $a$ has area $a^2$.' },
        { bn: 'এবার বাহুটা একটু বড় করি: $a + b$। বড় বর্গটি ভেঙে চারটি টুকরো পাই।', en: 'Now make the side a little longer: $a + b$. The big square breaks into four pieces.' },
        { bn: 'একটি $a^2$, একটি $b^2$, আর দুটি সমান আয়ত $ab$।', en: 'One $a^2$, one $b^2$, and two equal rectangles $ab$.' },
      ],
      narration: {
        bn: 'a-এর বর্গ মানে a গুণ a। একটা বর্গাকার পুকুরের প্রতিটি পাড় যদি a মিটার হয়, তার ক্ষেত্রফল a গুণ a, অর্থাৎ a বর্গ। এখন পাড়টা b মিটার বাড়িয়ে দিলাম, পুরো পাড় হলো a যোগ b। ছবিতে দেখো, বড় বর্গটা চারটা টুকরোয় ভাগ হয়েছে: একটা a বর্গ, একটা b বর্গ, আর দুটো একই মাপের আয়ত, প্রতিটার ক্ষেত্রফল a গুণ b।',
        en: 'a squared means a times a. If each side of a square pond is a metres, its area is a times a, which is a squared. Now we make each side b metres longer, so the side is a plus b. In the picture, the big square breaks into four pieces: one a squared, one b squared, and two rectangles of the same size, each with area a times b.',
      },
    },
    {
      type: 'question',
      title: { bn: 'নিজেকে যাচাই করো', en: 'Check yourself' },
      question: {
        stem: { bn: '$a \\times a$ কে সংক্ষেপে কীভাবে লেখা হয়?', en: 'How do we write $a \\times a$ in short?' },
        options: [{ bn: '$2a$', en: '$2a$' }, { bn: '$a^2$', en: '$a^2$' }, { bn: '$a + a$', en: '$a + a$' }, { bn: '$a^3$', en: '$a^3$' }],
        answer: 1,
        explanation: {
          bn: 'একই সংখ্যাকে নিজের সাথে গুণ করলে বর্গ হয়: $a \\times a = a^2$। খেয়াল করো, $a + a = 2a$, এটা যোগ, গুণ নয়।',
          en: 'Multiplying a number by itself gives its square: $a \\times a = a^2$. Note that $a + a = 2a$ is addition, not multiplication.',
        },
      },
      narration: { bn: 'একটা ছোট প্রশ্ন। a গুণ a কে ছোট করে কীভাবে লিখি?', en: 'A quick question. How do we write a times a in short?' },
    },
    {
      type: 'formula',
      title: { bn: 'প্রথম সূত্র', en: 'The first formula' },
      tex: '(a+b)^2 = a^2 + 2ab + b^2',
      bullets: [
        { bn: 'ছবির চারটি টুকরো যোগ করলেই সূত্রটি পাই: $a^2 + ab + ab + b^2$।', en: 'Add the four pieces from the picture: $a^2 + ab + ab + b^2$.' },
        { bn: 'দুটি $ab$ মিলে হয় $2ab$।', en: 'The two $ab$ pieces make $2ab$.' },
        { bn: 'মনে রাখার উপায়: প্রথমটির বর্গ, যোগ দুই গুণ প্রথম গুণ দ্বিতীয়, যোগ দ্বিতীয়টির বর্গ।', en: 'To remember: first squared, plus two times first times second, plus second squared.' },
      ],
      narration: {
        bn: 'এখন চারটা টুকরো যোগ করি। a বর্গ, তারপর a b, আবার a b, তারপর b বর্গ। মাঝের দুটো a b মিলে হয় দুই a b। তাই a যোগ b-এর বর্গ সমান a বর্গ যোগ দুই a b যোগ b বর্গ। মনে রাখো এভাবে: প্রথমটার বর্গ, দুই গুণ প্রথম গুণ দ্বিতীয়, আর দ্বিতীয়টার বর্গ।',
        en: 'Now add the four pieces. a squared, then a b, another a b, then b squared. The two middle a b pieces make two a b. So a plus b, all squared, equals a squared plus two a b plus b squared. Remember it as: first squared, two times first times second, second squared.',
      },
    },
    {
      type: 'worked_step',
      title: { bn: 'উদাহরণ: সূত্রটি ব্যবহার করি', en: 'Example: using the formula' },
      problem: { bn: '$(x + 3)^2$ এবং $102^2$ নির্ণয় করো।', en: 'Find $(x + 3)^2$ and $102^2$.' },
      steps: [
        { text: { bn: 'এখানে $a = x$ এবং $b = 3$।', en: 'Here $a = x$ and $b = 3$.' } },
        { tex: '(x+3)^2 = x^2 + 2 \\cdot x \\cdot 3 + 3^2' },
        { tex: '= x^2 + 6x + 9' },
        { text: { bn: 'এবার $102$ কে লিখি $100 + 2$। তাহলে $a = 100$, $b = 2$।', en: 'Now write $102$ as $100 + 2$. So $a = 100$, $b = 2$.' } },
        { tex: '102^2 = 100^2 + 2 \\cdot 100 \\cdot 2 + 2^2 = 10000 + 400 + 4 = 10404' },
      ],
      narration: {
        bn: 'প্রথম উদাহরণে a হলো x আর b হলো তিন। সূত্রে বসাই: x বর্গ, যোগ দুই গুণ x গুণ তিন, যোগ তিনের বর্গ। দুই গুণ তিন ছয়, তাই ছয় x। তিনের বর্গ হলো নয়। উত্তর x বর্গ যোগ ছয় x যোগ নয়। দ্বিতীয় উদাহরণে একশো দুই-এর বর্গ মুখে মুখে বের করি। একশো দুই মানে একশো যোগ দুই। একশোর বর্গ দশ হাজার, দুই গুণ একশো গুণ দুই চারশো, আর দুইয়ের বর্গ চার। সব যোগ করে দশ হাজার চারশো চার।',
        en: 'In the first example a is x and b is three. Put them in the formula: x squared, plus two times x times three, plus three squared. Two times three is six, so six x. Three squared is nine. The answer is x squared plus six x plus nine. In the second example we find one hundred and two squared in our head. One hundred and two is one hundred plus two. One hundred squared is ten thousand, two times one hundred times two is four hundred, and two squared is four. Adding them gives ten thousand four hundred and four.',
      },
    },
    {
      type: 'question',
      title: { bn: 'নিজেকে যাচাই করো', en: 'Check yourself' },
      question: {
        stem: { bn: '$(y + 4)^2$ এর সমান কোনটি?', en: 'Which is equal to $(y + 4)^2$?' },
        options: [{ bn: '$y^2 + 16$', en: '$y^2 + 16$' }, { bn: '$y^2 + 4y + 16$', en: '$y^2 + 4y + 16$' }, { bn: '$y^2 + 8y + 16$', en: '$y^2 + 8y + 16$' }, { bn: '$y^2 + 8y + 8$', en: '$y^2 + 8y + 8$' }],
        answer: 2,
        explanation: {
          bn: '$a = y$, $b = 4$। মাঝের পদ $2 \\cdot y \\cdot 4 = 8y$, শেষ পদ $4^2 = 16$। তাই $y^2 + 8y + 16$। মাঝের পদটি বাদ দেওয়াই সবচেয়ে সাধারণ ভুল।',
          en: '$a = y$, $b = 4$. The middle term is $2 \\cdot y \\cdot 4 = 8y$ and the last term is $4^2 = 16$. So $y^2 + 8y + 16$. Forgetting the middle term is the most common mistake.',
        },
      },
      narration: { bn: 'এবার তুমি করো। y যোগ চার, এর বর্গ কত?', en: 'Your turn. What is y plus four, all squared?' },
    },
    {
      type: 'formula',
      title: { bn: 'দ্বিতীয় সূত্র: বিয়োগের বর্গ', en: 'The second formula: square of a difference' },
      tex: '(a-b)^2 = a^2 - 2ab + b^2',
      bullets: [
        { bn: '$a - b$ কে লিখতে পারি $a + (-b)$। প্রথম সূত্রে $b$ এর জায়গায় $-b$ বসাই।', en: 'We can write $a - b$ as $a + (-b)$. Put $-b$ in place of $b$ in the first formula.' },
        { bn: '$2a(-b) = -2ab$, আর $(-b)^2 = b^2$ (দুটি ঋণাত্মক গুণ করলে ধনাত্মক)।', en: '$2a(-b) = -2ab$, and $(-b)^2 = b^2$ (negative times negative is positive).' },
        { bn: 'শুধু মাঝের চিহ্নটি বদলায়। শেষের $b^2$ সবসময় যোগ।', en: 'Only the middle sign changes. The last $b^2$ is always added.' },
      ],
      narration: {
        bn: 'a বিয়োগ b আসলে a যোগ ঋণাত্মক b। তাই প্রথম সূত্রে b-এর জায়গায় ঋণাত্মক b বসাই। মাঝের পদ হয় দুই গুণ a গুণ ঋণাত্মক b, অর্থাৎ ঋণাত্মক দুই a b। আর ঋণাত্মক b-এর বর্গ ধনাত্মক b বর্গ, কারণ দুটো ঋণাত্মক সংখ্যা গুণ করলে ধনাত্মক হয়। তাই শুধু মাঝের চিহ্নটা বদলে বিয়োগ হয়।',
        en: 'a minus b is really a plus negative b. So in the first formula we put negative b in place of b. The middle term becomes two times a times negative b, which is negative two a b. And negative b squared is positive b squared, because a negative times a negative is positive. So only the middle sign changes to minus.',
      },
    },
    {
      type: 'worked_step',
      title: { bn: 'উদাহরণ: বিয়োগের বর্গ', en: 'Example: square of a difference' },
      problem: { bn: '$99^2$ এবং $(2x - 3y)^2$ নির্ণয় করো।', en: 'Find $99^2$ and $(2x - 3y)^2$.' },
      steps: [
        { text: { bn: '$99 = 100 - 1$, তাই $a = 100$, $b = 1$।', en: '$99 = 100 - 1$, so $a = 100$, $b = 1$.' } },
        { tex: '99^2 = 100^2 - 2 \\cdot 100 \\cdot 1 + 1^2 = 10000 - 200 + 1 = 9801' },
        { text: { bn: 'এবার $a = 2x$, $b = 3y$। পুরো পদটির বর্গ করতে হবে, শুধু অক্ষরের নয়।', en: 'Now $a = 2x$, $b = 3y$. Square the whole term, not just the letter.' } },
        { tex: '(2x)^2 = 4x^2, \\quad 2 \\cdot 2x \\cdot 3y = 12xy, \\quad (3y)^2 = 9y^2' },
        { tex: '(2x-3y)^2 = 4x^2 - 12xy + 9y^2' },
      ],
      narration: {
        bn: 'নিরানব্বই হলো একশো বিয়োগ এক। একশোর বর্গ দশ হাজার, দুই গুণ একশো গুণ এক দুইশো, আর একের বর্গ এক। দশ হাজার থেকে দুইশো বাদ দিয়ে এক যোগ করলে নয় হাজার আটশো এক। দ্বিতীয়টায় a হলো দুই x আর b হলো তিন y। সাবধান, দুই x-এর বর্গ চার x বর্গ, শুধু x বর্গ নয়। মাঝের পদ দুই গুণ দুই x গুণ তিন y, অর্থাৎ বারো x y, চিহ্ন বিয়োগ। শেষে তিন y-এর বর্গ নয় y বর্গ।',
        en: 'Ninety-nine is one hundred minus one. One hundred squared is ten thousand, two times one hundred times one is two hundred, and one squared is one. Ten thousand minus two hundred plus one is nine thousand eight hundred and one. In the second one, a is two x and b is three y. Careful: two x squared is four x squared, not just x squared. The middle term is two times two x times three y, which is twelve x y, with a minus sign. Last, three y squared is nine y squared.',
      },
    },
    {
      type: 'question',
      title: { bn: 'নিজেকে যাচাই করো', en: 'Check yourself' },
      question: {
        stem: { bn: '$(m - 5)^2$ এর সমান কোনটি?', en: 'Which is equal to $(m - 5)^2$?' },
        options: [{ bn: '$m^2 - 25$', en: '$m^2 - 25$' }, { bn: '$m^2 - 10m - 25$', en: '$m^2 - 10m - 25$' }, { bn: '$m^2 + 10m + 25$', en: '$m^2 + 10m + 25$' }, { bn: '$m^2 - 10m + 25$', en: '$m^2 - 10m + 25$' }],
        answer: 3,
        explanation: {
          bn: 'মাঝের পদ $-2 \\cdot m \\cdot 5 = -10m$। শেষের পদ $(-5)^2 = +25$, কারণ বর্গ কখনো ঋণাত্মক হয় না।',
          en: 'The middle term is $-2 \\cdot m \\cdot 5 = -10m$. The last term is $(-5)^2 = +25$, because a square is never negative.',
        },
      },
      narration: { bn: 'আরেকটা যাচাই। m বিয়োগ পাঁচ, এর বর্গ কত?', en: 'One more check. What is m minus five, all squared?' },
    },
    {
      type: 'text',
      title: { bn: 'সাবধান থাকার জায়গা ও সারসংক্ষেপ', en: 'Common traps and summary' },
      bullets: [
        { bn: 'ভুল: $(a + b)^2 = a^2 + b^2$। মাঝের $2ab$ কখনো বাদ দেবে না।', en: 'Wrong: $(a + b)^2 = a^2 + b^2$. Never drop the middle $2ab$.' },
        { bn: 'ভুল: $(2x)^2 = 2x^2$। সঠিক: $(2x)^2 = 4x^2$।', en: 'Wrong: $(2x)^2 = 2x^2$. Right: $(2x)^2 = 4x^2$.' },
        { bn: 'দুটি সূত্র বিয়োগ করলে পাই: $(a+b)^2 - (a-b)^2 = 4ab$। পরের পাঠে এটি কাজে লাগবে।', en: 'Subtracting the two formulas gives $(a+b)^2 - (a-b)^2 = 4ab$. This helps in the next lesson.' },
      ],
      narration: {
        bn: 'দুটো ফাঁদ মনে রাখো। প্রথমত, a যোগ b-এর বর্গ লিখতে গিয়ে মাঝের দুই a b বাদ দিও না। দ্বিতীয়ত, দুই x-এর বর্গ চার x বর্গ। শেষে একটা মজার কথা: প্রথম সূত্র থেকে দ্বিতীয় সূত্র বিয়োগ করলে থাকে চার a b। আজ এটুকুই। একবারে একটি পাঠ, তুমি ভালোই এগোচ্ছ।',
        en: 'Remember two traps. First, when you square a plus b, do not drop the middle two a b. Second, two x squared is four x squared. One last idea: subtract the second formula from the first and you get four a b. That is all for today. One lesson at a time, and you are doing well.',
      },
    },
  ],
}
