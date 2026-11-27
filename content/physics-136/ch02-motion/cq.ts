import type { CqSrc } from '../../types'

// 3 original creative questions. Marks: (a) knowledge 1, (b) comprehension 2,
// (c) application 3, (d) higher-order 4. Rubric points add up to each part's marks.

export const cqs: CqSrc[] = [
  {
    key: 'cq01', difficulty: 3, tags: ['equations', 'deceleration'],
    stem: {
      bn: 'রাফি $72\\,\\text{km/h}$ বেগে মোটরসাইকেল চালাচ্ছিল। হঠাৎ সে $50\\,\\text{m}$ সামনে রাস্তায় একটি গরু দেখল এবং সাথে সাথে ব্রেক কষল। মোটরসাইকেলটি $-5\\,\\text{m/s}^2$ সুষম ত্বরণে থামতে লাগল।',
      en: 'Rafi is riding a motorbike at $72\\,\\text{km/h}$. Suddenly he sees a cow on the road $50\\,\\text{m}$ ahead and brakes at once. The bike slows with a uniform acceleration of $-5\\,\\text{m/s}^2$.',
    },
    parts: [
      {
        part: 'a',
        prompt: { bn: 'মন্দন কাকে বলে?', en: 'What is deceleration?' },
        model: { bn: 'সময়ের সাথে বস্তুর বেগ কমতে থাকলে বেগ হ্রাসের হারকে মন্দন বলে। এটি ঋণাত্মক ত্বরণ।', en: 'When an object\'s velocity falls over time, the rate at which it falls is called deceleration. It is a negative acceleration.' },
        rubric: [{ points: 1, criterion: { bn: 'বেগ হ্রাসের হার বা ঋণাত্মক ত্বরণ হিসেবে সঠিক সংজ্ঞা', en: 'Correct definition as rate of decrease of velocity or negative acceleration' } }],
      },
      {
        part: 'b',
        prompt: { bn: 'সুষম বেগে চলমান বস্তুর ত্বরণ শূন্য কেন? ব্যাখ্যা করো।', en: 'Why is the acceleration of an object moving at uniform velocity zero? Explain.' },
        model: {
          bn: 'ত্বরণ হলো বেগ পরিবর্তনের হার, $a = \\frac{v - u}{t}$। সুষম বেগে বেগের মান ও দিক বদলায় না, তাই $v = u$।\n\nফলে $a = \\frac{u - u}{t} = 0$।',
          en: 'Acceleration is the rate of change of velocity, $a = \\frac{v - u}{t}$. At uniform velocity neither the size nor the direction of the velocity changes, so $v = u$.\n\nSo $a = \\frac{u - u}{t} = 0$.',
        },
        rubric: [
          { points: 1, criterion: { bn: 'ত্বরণকে বেগ পরিবর্তনের হার হিসেবে উল্লেখ করেছে', en: 'States acceleration is the rate of change of velocity' } },
          { points: 1, criterion: { bn: 'বেগ অপরিবর্তিত থাকায় $a = 0$ দেখিয়েছে', en: 'Shows $a = 0$ because velocity does not change' } },
        ],
      },
      {
        part: 'c',
        prompt: { bn: 'ব্রেক কষার পর মোটরসাইকেলটি থামতে কত সময় লাগবে, নির্ণয় করো।', en: 'Find how long the motorbike takes to stop after braking.' },
        model: {
          bn: '$u = 72\\,\\text{km/h} = \\frac{72 \\times 1000}{3600} = 20\\,\\text{m/s}$, $v = 0$, $a = -5\\,\\text{m/s}^2$\n\n$v = u + at \\Rightarrow 0 = 20 - 5t$\n\n$t = 4\\,\\text{s}$',
          en: '$u = 72\\,\\text{km/h} = \\frac{72 \\times 1000}{3600} = 20\\,\\text{m/s}$, $v = 0$, $a = -5\\,\\text{m/s}^2$\n\n$v = u + at \\Rightarrow 0 = 20 - 5t$\n\n$t = 4\\,\\text{s}$',
        },
        rubric: [
          { points: 1, criterion: { bn: '$72\\,\\text{km/h}$ কে $20\\,\\text{m/s}$ এ রূপান্তর করেছে', en: 'Converts $72\\,\\text{km/h}$ to $20\\,\\text{m/s}$' } },
          { points: 1, criterion: { bn: '$v = u + at$ সঠিকভাবে বসিয়েছে', en: 'Substitutes correctly into $v = u + at$' } },
          { points: 1, criterion: { bn: 'সঠিক উত্তর $4\\,\\text{s}$', en: 'Correct answer $4\\,\\text{s}$' } },
        ],
      },
      {
        part: 'd',
        prompt: { bn: 'রাফি কি গরুটিকে ধাক্কা দেওয়া এড়াতে পারবে? গাণিতিক যুক্তিসহ বিশ্লেষণ করো।', en: 'Will Rafi avoid hitting the cow? Analyse with a calculation.' },
        model: {
          bn: 'থামার আগে অতিক্রান্ত দূরত্ব: $v^2 = u^2 + 2as$\n\n$0 = 20^2 + 2(-5)s \\Rightarrow s = \\frac{400}{10} = 40\\,\\text{m}$\n\nগরুটি $50\\,\\text{m}$ দূরে, মোটরসাইকেল থামে $40\\,\\text{m}$ এ। তাই রাফি গরু থেকে $10\\,\\text{m}$ আগে থেমে যাবে এবং ধাক্কা এড়াতে পারবে।\n\nতবে বাস্তবে চালক দেখার পর ব্রেক কষতে কিছুটা সময় লাগে (প্রতিক্রিয়া সময়)। সেই সময়ে মোটরসাইকেল $20\\,\\text{m/s}$ বেগে চলতে থাকে। প্রতিক্রিয়া সময় $0.5\\,\\text{s}$ এর বেশি হলে আরও $10\\,\\text{m}$ এর বেশি যাবে এবং ধাক্কা লাগবে।',
          en: 'Distance covered before stopping: $v^2 = u^2 + 2as$\n\n$0 = 20^2 + 2(-5)s \\Rightarrow s = \\frac{400}{10} = 40\\,\\text{m}$\n\nThe cow is $50\\,\\text{m}$ away and the bike stops in $40\\,\\text{m}$. So Rafi stops $10\\,\\text{m}$ short of the cow and avoids it.\n\nIn real life, though, a rider takes a moment to react before braking. During that time the bike keeps going at $20\\,\\text{m/s}$. If the reaction time is more than $0.5\\,\\text{s}$, it goes over $10\\,\\text{m}$ further and hits the cow.',
        },
        rubric: [
          { points: 1, criterion: { bn: '$v^2 = u^2 + 2as$ ব্যবহার করেছে', en: 'Uses $v^2 = u^2 + 2as$' } },
          { points: 1, criterion: { bn: 'থামার দূরত্ব $40\\,\\text{m}$ পেয়েছে', en: 'Gets the stopping distance $40\\,\\text{m}$' } },
          { points: 1, criterion: { bn: '$50\\,\\text{m}$ এর সাথে তুলনা করে সিদ্ধান্ত দিয়েছে', en: 'Compares with $50\\,\\text{m}$ and concludes' } },
          { points: 1, criterion: { bn: 'প্রতিক্রিয়া সময় বা বাস্তব সীমাবদ্ধতা বিবেচনা করেছে', en: 'Considers reaction time or another real-world limit' } },
        ],
      },
    ],
  },
  {
    key: 'cq02', difficulty: 3, tags: ['free-fall'],
    stem: {
      bn: 'একটি ভবনের ছাদ থেকে একটি বল ছেড়ে দেওয়া হলো। বলটি $4\\,\\text{s}$ পরে মাটিতে পড়ল। ($g = 9.8\\,\\text{m/s}^2$, বাতাসের বাধা উপেক্ষণীয়)',
      en: 'A ball is dropped from the roof of a building. It reaches the ground after $4\\,\\text{s}$. ($g = 9.8\\,\\text{m/s}^2$; ignore air resistance)',
    },
    parts: [
      {
        part: 'a',
        prompt: { bn: 'অভিকর্ষজ ত্বরণ কাকে বলে?', en: 'What is the acceleration due to gravity?' },
        model: { bn: 'পৃথিবীর আকর্ষণে মুক্তভাবে পড়ন্ত বস্তুর বেগ বৃদ্ধির হারকে অভিকর্ষজ ত্বরণ বলে। এর মান প্রায় $9.8\\,\\text{m/s}^2$।', en: 'The rate at which a freely falling object\'s velocity increases because of the Earth\'s pull is the acceleration due to gravity. It is about $9.8\\,\\text{m/s}^2$.' },
        rubric: [{ points: 1, criterion: { bn: 'সঠিক সংজ্ঞা', en: 'Correct definition' } }],
      },
      {
        part: 'b',
        prompt: { bn: 'বায়ুশূন্য স্থানে একটি পালক ও একটি পাথর একসাথে পড়ে কেন? ব্যাখ্যা করো।', en: 'Why do a feather and a stone fall together in a vacuum? Explain.' },
        model: {
          bn: 'মুক্তভাবে পড়ন্ত বস্তুর ত্বরণ $g$ বস্তুর ভরের উপর নির্ভর করে না। বাতাসে পালক ধীরে পড়ে কারণ বাতাসের বাধা তার উপর বেশি প্রভাব ফেলে।\n\nবায়ুশূন্য স্থানে বাধা নেই, তাই দুটির ত্বরণ সমান ($g$), এবং একই উচ্চতা থেকে একই সময়ে মাটিতে পড়ে।',
          en: 'The acceleration $g$ of a falling object does not depend on its mass. In air a feather falls slowly because air resistance affects it much more.\n\nIn a vacuum there is no resistance, so both have the same acceleration $g$ and reach the ground at the same time from the same height.',
        },
        rubric: [
          { points: 1, criterion: { bn: '$g$ ভরের উপর নির্ভর করে না বলেছে', en: 'States $g$ does not depend on mass' } },
          { points: 1, criterion: { bn: 'বাতাসের বাধার ভূমিকা ব্যাখ্যা করেছে', en: 'Explains the role of air resistance' } },
        ],
      },
      {
        part: 'c',
        prompt: { bn: 'ভবনটির উচ্চতা নির্ণয় করো।', en: 'Find the height of the building.' },
        model: {
          bn: '$u = 0$, $t = 4\\,\\text{s}$, $g = 9.8\\,\\text{m/s}^2$\n\n$h = ut + \\frac{1}{2}gt^2 = 0 + \\frac{1}{2} \\times 9.8 \\times 16$\n\n$h = 78.4\\,\\text{m}$',
          en: '$u = 0$, $t = 4\\,\\text{s}$, $g = 9.8\\,\\text{m/s}^2$\n\n$h = ut + \\frac{1}{2}gt^2 = 0 + \\frac{1}{2} \\times 9.8 \\times 16$\n\n$h = 78.4\\,\\text{m}$',
        },
        rubric: [
          { points: 1, criterion: { bn: '$u = 0$ শনাক্ত করেছে', en: 'Identifies $u = 0$' } },
          { points: 1, criterion: { bn: '$h = \\frac{1}{2}gt^2$ ব্যবহার করেছে', en: 'Uses $h = \\frac{1}{2}gt^2$' } },
          { points: 1, criterion: { bn: 'সঠিক উত্তর $78.4\\,\\text{m}$', en: 'Correct answer $78.4\\,\\text{m}$' } },
        ],
      },
      {
        part: 'd',
        prompt: { bn: 'পতনের প্রথম $2\\,\\text{s}$ এ বলটি মোট উচ্চতার অর্ধেক পথ যায় কিনা, যাচাই করে মতামত দাও।', en: 'Does the ball cover half the height in the first $2\\,\\text{s}$ of its fall? Check and give your view.' },
        model: {
          bn: 'প্রথম $2\\,\\text{s}$ এ: $h_1 = \\frac{1}{2} \\times 9.8 \\times 2^2 = 19.6\\,\\text{m}$\n\nশেষ $2\\,\\text{s}$ এ: $78.4 - 19.6 = 58.8\\,\\text{m}$\n\n$19.6\\,\\text{m}$ হলো মোট উচ্চতার এক-চতুর্থাংশ, অর্ধেক নয়।\n\nকারণ: বল প্রতি সেকেন্ডে দ্রুততর হয়, তাই পরের সমান সময়ে বেশি পথ যায়। দূরত্ব $t^2$ এর সমানুপাতিক, তাই অর্ধেক সময়ে দূরত্ব $(\\frac{1}{2})^2 = \\frac{1}{4}$ অংশ।',
          en: 'In the first $2\\,\\text{s}$: $h_1 = \\frac{1}{2} \\times 9.8 \\times 2^2 = 19.6\\,\\text{m}$\n\nIn the last $2\\,\\text{s}$: $78.4 - 19.6 = 58.8\\,\\text{m}$\n\n$19.6\\,\\text{m}$ is a quarter of the total height, not half.\n\nWhy: the ball gets faster every second, so it covers more ground in each later equal interval. Distance is proportional to $t^2$, so half the time gives $(\\frac{1}{2})^2 = \\frac{1}{4}$ of the distance.',
        },
        rubric: [
          { points: 1, criterion: { bn: 'প্রথম $2\\,\\text{s}$ এর দূরত্ব $19.6\\,\\text{m}$', en: 'First $2\\,\\text{s}$ distance $19.6\\,\\text{m}$' } },
          { points: 1, criterion: { bn: 'মোট উচ্চতার সাথে তুলনা করেছে', en: 'Compares with the total height' } },
          { points: 1, criterion: { bn: 'অর্ধেক নয়, এক-চতুর্থাংশ সিদ্ধান্ত দিয়েছে', en: 'Concludes it is a quarter, not half' } },
          { points: 1, criterion: { bn: '$h \\propto t^2$ দিয়ে কারণ ব্যাখ্যা করেছে', en: 'Explains the reason using $h \\propto t^2$' } },
        ],
      },
    ],
  },
  {
    key: 'cq03', difficulty: 4, tags: ['graphs', 'equations'],
    stem: {
      bn: 'একটি গাড়ির গতির বিবরণ:\n\n- $0$ থেকে $10\\,\\text{s}$: বেগ সুষমভাবে $0$ থেকে $15\\,\\text{m/s}$ হলো\n- $10$ থেকে $30\\,\\text{s}$: বেগ $15\\,\\text{m/s}$ এ স্থির রইল\n- $30$ থেকে $35\\,\\text{s}$: বেগ সুষমভাবে কমে $0$ হলো',
      en: 'A car\'s motion:\n\n- $0$ to $10\\,\\text{s}$: velocity rises uniformly from $0$ to $15\\,\\text{m/s}$\n- $10$ to $30\\,\\text{s}$: velocity stays at $15\\,\\text{m/s}$\n- $30$ to $35\\,\\text{s}$: velocity falls uniformly to $0$',
    },
    parts: [
      {
        part: 'a',
        prompt: { bn: 'সুষম বেগ কাকে বলে?', en: 'What is uniform velocity?' },
        model: { bn: 'কোনো বস্তু নির্দিষ্ট দিকে সমান সময়ে সমান সরণ করলে তার বেগকে সুষম বেগ বলে।', en: 'If an object makes equal displacements in equal times in a fixed direction, its velocity is uniform.' },
        rubric: [{ points: 1, criterion: { bn: 'সঠিক সংজ্ঞা', en: 'Correct definition' } }],
      },
      {
        part: 'b',
        prompt: { bn: 'প্রথম ও শেষ অংশে গাড়ির ত্বরণ নির্ণয় করো।', en: 'Find the car\'s acceleration in the first and last stages.' },
        model: {
          bn: 'প্রথম অংশ: $a_1 = \\frac{15 - 0}{10} = 1.5\\,\\text{m/s}^2$\n\nশেষ অংশ: $a_3 = \\frac{0 - 15}{5} = -3\\,\\text{m/s}^2$',
          en: 'First stage: $a_1 = \\frac{15 - 0}{10} = 1.5\\,\\text{m/s}^2$\n\nLast stage: $a_3 = \\frac{0 - 15}{5} = -3\\,\\text{m/s}^2$',
        },
        rubric: [
          { points: 1, criterion: { bn: '$a_1 = 1.5\\,\\text{m/s}^2$', en: '$a_1 = 1.5\\,\\text{m/s}^2$' } },
          { points: 1, criterion: { bn: '$a_3 = -3\\,\\text{m/s}^2$ (চিহ্নসহ)', en: '$a_3 = -3\\,\\text{m/s}^2$ (with sign)' } },
        ],
      },
      {
        part: 'c',
        prompt: { bn: 'পুরো $35\\,\\text{s}$ এ গাড়িটির অতিক্রান্ত দূরত্ব নির্ণয় করো।', en: 'Find the distance the car covers in the full $35\\,\\text{s}$.' },
        model: {
          bn: 'বেগ-সময় লেখচিত্রের নিচের ক্ষেত্রফলই দূরত্ব।\n\nপ্রথম অংশ (ত্রিভুজ): $\\frac{1}{2} \\times 10 \\times 15 = 75\\,\\text{m}$\n\nমাঝের অংশ (আয়ত): $20 \\times 15 = 300\\,\\text{m}$\n\nশেষ অংশ (ত্রিভুজ): $\\frac{1}{2} \\times 5 \\times 15 = 37.5\\,\\text{m}$\n\nমোট $= 412.5\\,\\text{m}$',
          en: 'The area under the velocity-time graph is the distance.\n\nFirst stage (triangle): $\\frac{1}{2} \\times 10 \\times 15 = 75\\,\\text{m}$\n\nMiddle stage (rectangle): $20 \\times 15 = 300\\,\\text{m}$\n\nLast stage (triangle): $\\frac{1}{2} \\times 5 \\times 15 = 37.5\\,\\text{m}$\n\nTotal $= 412.5\\,\\text{m}$',
        },
        rubric: [
          { points: 1, criterion: { bn: 'তিন অংশে ভাগ করে ক্ষেত্রফল/সমীকরণ ব্যবহার করেছে', en: 'Splits into three stages and uses area or equations' } },
          { points: 1, criterion: { bn: 'অন্তত দুটি অংশের দূরত্ব সঠিক', en: 'At least two stage distances correct' } },
          { points: 1, criterion: { bn: 'মোট দূরত্ব $412.5\\,\\text{m}$', en: 'Total distance $412.5\\,\\text{m}$' } },
        ],
      },
      {
        part: 'd',
        prompt: { bn: 'গাড়িটি যদি পুরো পথ একই গড় বেগে চলত, তবে সেই বেগ কত হতো? এই গড় বেগ সর্বোচ্চ বেগের চেয়ে কম কেন, বিশ্লেষণ করো।', en: 'If the car had covered the whole trip at one steady speed, what would that average velocity be? Analyse why it is less than the top speed.' },
        model: {
          bn: 'গড় বেগ $= \\frac{\\text{মোট দূরত্ব}}{\\text{মোট সময়}} = \\frac{412.5}{35} \\approx 11.8\\,\\text{m/s}$\n\nসর্বোচ্চ বেগ $15\\,\\text{m/s}$। গাড়িটি প্রথম $10\\,\\text{s}$ আর শেষ $5\\,\\text{s}$ সর্বোচ্চের চেয়ে কম বেগে চলেছে। ওই $15\\,\\text{s}$ এ গড় বেগ ছিল মাত্র $7.5\\,\\text{m/s}$।\n\nতাই সমগ্র যাত্রার গড় বেগ সর্বোচ্চ বেগের চেয়ে কম। ত্বরণ ও মন্দনের সময় যত কম হবে, গড় বেগ তত সর্বোচ্চ বেগের কাছাকাছি হবে।',
          en: 'Average velocity $= \\frac{\\text{total distance}}{\\text{total time}} = \\frac{412.5}{35} \\approx 11.8\\,\\text{m/s}$\n\nThe top speed is $15\\,\\text{m/s}$. The car moved slower than that during the first $10\\,\\text{s}$ and the last $5\\,\\text{s}$; over those $15\\,\\text{s}$ its average was only $7.5\\,\\text{m/s}$.\n\nSo the trip\'s average is below the top speed. The shorter the speeding-up and slowing-down times, the closer the average gets to the top speed.',
        },
        rubric: [
          { points: 1, criterion: { bn: 'গড় বেগের সূত্র ব্যবহার করেছে', en: 'Uses the average velocity formula' } },
          { points: 1, criterion: { bn: 'সঠিক মান প্রায় $11.8\\,\\text{m/s}$', en: 'Correct value about $11.8\\,\\text{m/s}$' } },
          { points: 1, criterion: { bn: 'ত্বরণ/মন্দন অংশে কম বেগকে কারণ হিসেবে দেখিয়েছে', en: 'Identifies slower stages as the reason' } },
          { points: 1, criterion: { bn: 'যুক্তিসঙ্গত সাধারণ সিদ্ধান্ত দিয়েছে', en: 'Draws a sensible general conclusion' } },
        ],
      },
    ],
  },
]
