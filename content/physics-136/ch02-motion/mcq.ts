import type { Bi, McqSrc } from '../../types'

// 16 original MCQs: 11 single-answer, 3 multiple-completion (বহুপদী সমাপ্তিসূচক),
// 2 situation-based (অনুচ্ছেদ-ভিত্তিক) sharing one passage.

const same = (s: string): Bi => ({ bn: s, en: s })
const o4 = (a: string, b: string, c: string, d: string): [Bi, Bi, Bi, Bi] => [same(a), same(b), same(c), same(d)]
const MC_OPTS: [Bi, Bi, Bi, Bi] = [
  { bn: 'i ও ii', en: 'i and ii' }, { bn: 'i ও iii', en: 'i and iii' },
  { bn: 'ii ও iii', en: 'ii and iii' }, { bn: 'i, ii ও iii', en: 'i, ii and iii' },
]

const train: Bi = {
  bn: 'একটি ট্রেন স্টেশন থেকে স্থির অবস্থা থেকে ছেড়ে $0.5\\,\\text{m/s}^2$ সুষম ত্বরণে $40\\,\\text{s}$ চলল। এরপর পরবর্তী $60\\,\\text{s}$ ট্রেনটি সুষম বেগে চলল।',
  en: 'A train leaves a station from rest and moves with a uniform acceleration of $0.5\\,\\text{m/s}^2$ for $40\\,\\text{s}$. It then moves at a uniform velocity for the next $60\\,\\text{s}$.',
}

export const mcqs: McqSrc[] = [
  {
    key: 'q01', subtype: 'single', difficulty: 1, tags: ['scalar-vector'],
    stem: { bn: 'নিচের কোনটি ভেক্টর রাশি?', en: 'Which of these is a vector quantity?' },
    options: [{ bn: 'দূরত্ব', en: 'Distance' }, { bn: 'দ্রুতি', en: 'Speed' }, { bn: 'সরণ', en: 'Displacement' }, { bn: 'সময়', en: 'Time' }], answer: 2,
    explanation: { bn: 'সরণের মান ও দিক দুটোই আছে, তাই এটি ভেক্টর। বাকি তিনটির শুধু মান আছে।', en: 'Displacement has both size and direction, so it is a vector. The other three have size only.' },
  },
  {
    key: 'q02', subtype: 'single', difficulty: 1, tags: ['acceleration'],
    stem: { bn: 'ত্বরণের SI একক কোনটি?', en: 'What is the SI unit of acceleration?' },
    options: o4('$\\text{m/s}$', '$\\text{m/s}^2$', '$\\text{m}^2\\text{/s}$', '$\\text{m s}$'), answer: 1,
    explanation: { bn: 'ত্বরণ = বেগের পরিবর্তন ÷ সময় = $\\frac{\\text{m/s}}{\\text{s}} = \\text{m/s}^2$।', en: 'Acceleration = change in velocity ÷ time = $\\frac{\\text{m/s}}{\\text{s}} = \\text{m/s}^2$.' },
  },
  {
    key: 'q03', subtype: 'single', difficulty: 1, tags: ['rest-motion'],
    stem: { bn: 'স্থিতি ও গতি আপেক্ষিক, কারণ এগুলো নির্ভর করে—', en: 'Rest and motion are relative because they depend on' },
    options: [{ bn: 'বস্তুর ভরের উপর', en: 'the mass of the object' }, { bn: 'প্রসঙ্গ কাঠামোর উপর', en: 'the frame of reference' }, { bn: 'বস্তুর আকারের উপর', en: 'the shape of the object' }, { bn: 'অভিকর্ষজ ত্বরণের উপর', en: 'the acceleration due to gravity' }], answer: 1,
    explanation: { bn: 'কোনো বস্তু স্থির না গতিশীল, তা বলা যায় শুধু কোনো প্রসঙ্গ কাঠামোর তুলনায়।', en: 'Whether something is at rest or moving can only be said compared with a frame of reference.' },
  },
  {
    key: 'q04', subtype: 'single', difficulty: 2, tags: ['speed'],
    stem: { bn: 'একটি বাস $2$ ঘণ্টায় $90\\,\\text{km}$ পথ গেল। এর গড় দ্রুতি কত $\\text{m/s}$?', en: 'A bus covers $90\\,\\text{km}$ in $2$ hours. What is its average speed in $\\text{m/s}$?' },
    options: o4('$45$', '$12.5$', '$25$', '$7.5$'), answer: 1,
    explanation: { bn: '$45\\,\\text{km/h} = \\frac{45 \\times 1000}{3600} = 12.5\\,\\text{m/s}$।', en: '$45\\,\\text{km/h} = \\frac{45 \\times 1000}{3600} = 12.5\\,\\text{m/s}$.' },
  },
  {
    key: 'q05', subtype: 'single', difficulty: 2, tags: ['acceleration'],
    stem: { bn: '$20\\,\\text{m/s}$ বেগে চলা একটি গাড়ি ব্রেক কষে $4\\,\\text{s}$-এ থেমে গেল। ত্বরণ কত?', en: 'A car moving at $20\\,\\text{m/s}$ brakes and stops in $4\\,\\text{s}$. What is its acceleration?' },
    options: o4('$5\\,\\text{m/s}^2$', '$-5\\,\\text{m/s}^2$', '$80\\,\\text{m/s}^2$', '$-80\\,\\text{m/s}^2$'), answer: 1,
    explanation: { bn: '$a = \\frac{0 - 20}{4} = -5\\,\\text{m/s}^2$। ঋণাত্মক চিহ্ন মানে বেগ কমছে (মন্দন)।', en: '$a = \\frac{0 - 20}{4} = -5\\,\\text{m/s}^2$. The minus sign means the velocity is falling (deceleration).' },
  },
  {
    key: 'q06', subtype: 'single', difficulty: 2, tags: ['equations'],
    stem: { bn: 'স্থির অবস্থা থেকে $2\\,\\text{m/s}^2$ ত্বরণে চলা একটি বস্তু $5\\,\\text{s}$-এ কত দূরত্ব যাবে?', en: 'An object starts from rest with acceleration $2\\,\\text{m/s}^2$. How far does it go in $5\\,\\text{s}$?' },
    options: o4('$10\\,\\text{m}$', '$20\\,\\text{m}$', '$25\\,\\text{m}$', '$50\\,\\text{m}$'), answer: 2,
    explanation: { bn: '$s = ut + \\frac{1}{2}at^2 = 0 + \\frac{1}{2} \\times 2 \\times 25 = 25\\,\\text{m}$।', en: '$s = ut + \\frac{1}{2}at^2 = 0 + \\frac{1}{2} \\times 2 \\times 25 = 25\\,\\text{m}$.' },
  },
  {
    key: 'q07', subtype: 'single', difficulty: 3, tags: ['equations'],
    stem: { bn: '$10\\,\\text{m/s}$ বেগে চলা একটি বস্তুর বেগ $2\\,\\text{m/s}^2$ ত্বরণে বেড়ে $30\\,\\text{m/s}$ হলো। এ সময়ে এটি কত দূরত্ব গেল?', en: 'An object at $10\\,\\text{m/s}$ speeds up to $30\\,\\text{m/s}$ with acceleration $2\\,\\text{m/s}^2$. How far does it go meanwhile?' },
    options: o4('$100\\,\\text{m}$', '$200\\,\\text{m}$', '$400\\,\\text{m}$', '$250\\,\\text{m}$'), answer: 1,
    explanation: { bn: '$s = \\frac{v^2 - u^2}{2a} = \\frac{900 - 100}{4} = 200\\,\\text{m}$।', en: '$s = \\frac{v^2 - u^2}{2a} = \\frac{900 - 100}{4} = 200\\,\\text{m}$.' },
  },
  {
    key: 'q08', subtype: 'single', difficulty: 2, tags: ['free-fall'],
    stem: { bn: 'একটি পাথর ছাদ থেকে ছেড়ে দেওয়া হলো। $2\\,\\text{s}$ পরে এর বেগ কত? ($g = 9.8\\,\\text{m/s}^2$)', en: 'A stone is dropped from a roof. What is its velocity after $2\\,\\text{s}$? ($g = 9.8\\,\\text{m/s}^2$)' },
    options: o4('$4.9\\,\\text{m/s}$', '$9.8\\,\\text{m/s}$', '$19.6\\,\\text{m/s}$', '$39.2\\,\\text{m/s}$'), answer: 2,
    explanation: { bn: '$u = 0$, তাই $v = gt = 9.8 \\times 2 = 19.6\\,\\text{m/s}$।', en: '$u = 0$, so $v = gt = 9.8 \\times 2 = 19.6\\,\\text{m/s}$.' },
  },
  {
    key: 'q09', subtype: 'single', difficulty: 3, tags: ['free-fall'],
    stem: { bn: 'একটি বস্তু ছেড়ে দেওয়ার $3\\,\\text{s}$ পরে মাটিতে পড়ল। এটি কত উঁচু থেকে পড়েছিল? ($g = 9.8\\,\\text{m/s}^2$)', en: 'A dropped object hits the ground after $3\\,\\text{s}$. From what height did it fall? ($g = 9.8\\,\\text{m/s}^2$)' },
    options: o4('$29.4\\,\\text{m}$', '$44.1\\,\\text{m}$', '$88.2\\,\\text{m}$', '$14.7\\,\\text{m}$'), answer: 1,
    explanation: { bn: '$h = \\frac{1}{2}gt^2 = \\frac{1}{2} \\times 9.8 \\times 9 = 44.1\\,\\text{m}$।', en: '$h = \\frac{1}{2}gt^2 = \\frac{1}{2} \\times 9.8 \\times 9 = 44.1\\,\\text{m}$.' },
  },
  {
    key: 'q10', subtype: 'single', difficulty: 3, tags: ['distance-displacement'],
    stem: { bn: 'একজন লোক $3\\,\\text{m}$ পূর্বে, তারপর $4\\,\\text{m}$ উত্তরে গেল। তার সরণের মান কত?', en: 'A man walks $3\\,\\text{m}$ east, then $4\\,\\text{m}$ north. What is the size of his displacement?' },
    options: o4('$7\\,\\text{m}$', '$1\\,\\text{m}$', '$5\\,\\text{m}$', '$12\\,\\text{m}$'), answer: 2,
    explanation: { bn: 'পথ দুটি সমকোণে, তাই সরণ $= \\sqrt{3^2 + 4^2} = 5\\,\\text{m}$। দূরত্ব অবশ্য $7\\,\\text{m}$।', en: 'The two legs are at right angles, so displacement $= \\sqrt{3^2 + 4^2} = 5\\,\\text{m}$. The distance is $7\\,\\text{m}$.' },
  },
  {
    key: 'q11', subtype: 'single', difficulty: 3, tags: ['graphs'],
    stem: { bn: 'বেগ-সময় লেখচিত্রের নিচের ক্ষেত্রফল কী নির্দেশ করে?', en: 'What does the area under a velocity-time graph give?' },
    options: [{ bn: 'ত্বরণ', en: 'Acceleration' }, { bn: 'অতিক্রান্ত দূরত্ব', en: 'Distance travelled' }, { bn: 'বেগ', en: 'Velocity' }, { bn: 'সময়', en: 'Time' }], answer: 1,
    explanation: { bn: 'ক্ষেত্রফল = বেগ × সময় = দূরত্ব। আর লেখচিত্রের ঢাল দেয় ত্বরণ।', en: 'Area = velocity × time = distance. The slope of the graph gives acceleration.' },
  },
  {
    key: 'q12', subtype: 'multi_completion', difficulty: 2, tags: ['scalar-vector'],
    stem: {
      bn: 'লক্ষ করো:\n\ni. দ্রুতি একটি স্কেলার রাশি\n\nii. সুষম বেগে চলা বস্তুর ত্বরণ শূন্য\n\niii. সরণ কখনো দূরত্বের চেয়ে বেশি হতে পারে না\n\nনিচের কোনটি সঠিক?',
      en: 'Consider:\n\ni. Speed is a scalar quantity\n\nii. An object moving at uniform velocity has zero acceleration\n\niii. Displacement can never be more than distance\n\nWhich is correct?',
    },
    options: MC_OPTS, answer: 3,
    explanation: { bn: 'তিনটিই সঠিক। বেগ না বদলালে ত্বরণ শূন্য, আর সোজা পথই সবচেয়ে ছোট, তাই সরণ ≤ দূরত্ব।', en: 'All three are true. If velocity does not change, acceleration is zero, and the straight line is the shortest path, so displacement ≤ distance.' },
  },
  {
    key: 'q13', subtype: 'multi_completion', difficulty: 3, tags: ['free-fall'],
    stem: {
      bn: 'বায়ুশূন্য স্থানে একটি পালক ও একটি লোহার বল একসাথে একই উচ্চতা থেকে ছেড়ে দেওয়া হলো।\n\ni. দুটি একসাথে মাটিতে পড়বে\n\nii. লোহার বলের ত্বরণ বেশি হবে\n\niii. যেকোনো মুহূর্তে দুটির বেগ সমান\n\nনিচের কোনটি সঠিক?',
      en: 'In a vacuum, a feather and an iron ball are dropped together from the same height.\n\ni. Both reach the ground together\n\nii. The iron ball has the larger acceleration\n\niii. At any moment both have the same velocity\n\nWhich is correct?',
    },
    options: MC_OPTS, answer: 1,
    explanation: { bn: 'বাতাসের বাধা না থাকলে দুটির ত্বরণই $g$, তাই i ও iii সঠিক; ii ভুল।', en: 'With no air resistance both accelerate at $g$, so i and iii are true; ii is false.' },
  },
  {
    key: 'q14', subtype: 'multi_completion', difficulty: 3, tags: ['equations'],
    stem: {
      bn: 'সুষম ত্বরণে চলমান একটি বস্তুর জন্য—\n\ni. $v = u + at$\n\nii. $s = \\frac{u + v}{2} \\times t$\n\niii. $s = vt$\n\nনিচের কোনটি সঠিক?',
      en: 'For an object with uniform acceleration:\n\ni. $v = u + at$\n\nii. $s = \\frac{u + v}{2} \\times t$\n\niii. $s = vt$\n\nWhich is correct?',
    },
    options: MC_OPTS, answer: 0,
    explanation: { bn: 'সুষম ত্বরণে গড় বেগ $\\frac{u + v}{2}$, তাই ii সঠিক। $s = vt$ শুধু সুষম বেগে খাটে।', en: 'Under uniform acceleration the average velocity is $\\frac{u + v}{2}$, so ii holds. $s = vt$ only works for uniform velocity.' },
  },
  {
    key: 'q15', subtype: 'situation', difficulty: 3, tags: ['equations'], context: train,
    stem: { bn: '$40\\,\\text{s}$ পরে ট্রেনটির বেগ কত?', en: 'What is the train\'s velocity after $40\\,\\text{s}$?' },
    options: o4('$10\\,\\text{m/s}$', '$20\\,\\text{m/s}$', '$40\\,\\text{m/s}$', '$80\\,\\text{m/s}$'), answer: 1,
    explanation: { bn: '$v = u + at = 0 + 0.5 \\times 40 = 20\\,\\text{m/s}$।', en: '$v = u + at = 0 + 0.5 \\times 40 = 20\\,\\text{m/s}$.' },
  },
  {
    key: 'q16', subtype: 'situation', difficulty: 4, tags: ['equations'], context: train,
    stem: { bn: 'মোট $100\\,\\text{s}$-এ ট্রেনটি কত দূরত্ব অতিক্রম করল?', en: 'How far does the train go in the whole $100\\,\\text{s}$?' },
    options: o4('$400\\,\\text{m}$', '$1200\\,\\text{m}$', '$1600\\,\\text{m}$', '$2000\\,\\text{m}$'), answer: 2,
    explanation: { bn: 'প্রথম অংশ: $\\frac{1}{2} \\times 0.5 \\times 40^2 = 400\\,\\text{m}$। দ্বিতীয় অংশ: $20 \\times 60 = 1200\\,\\text{m}$। মোট $1600\\,\\text{m}$।', en: 'First part: $\\frac{1}{2} \\times 0.5 \\times 40^2 = 400\\,\\text{m}$. Second part: $20 \\times 60 = 1200\\,\\text{m}$. Total $1600\\,\\text{m}$.' },
  },
]
