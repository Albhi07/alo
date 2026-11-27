import type { LessonSrc } from '../../types'

// Original lesson. One idea per scene, every term defined before use, no skipped steps.
// A "check yourself" question comes every 2-3 scenes and must be answered to continue.

const pathSvg = `<svg viewBox="0 0 260 150" xmlns="http://www.w3.org/2000/svg" role="img" font-family="inherit" font-size="15">
<path d="M30 110 C 70 20, 150 20, 220 110" fill="none" stroke="rgb(var(--g-science))" stroke-width="3" stroke-dasharray="6 5"/>
<line x1="30" y1="110" x2="214" y2="110" stroke="rgb(var(--accent))" stroke-width="3"/>
<polygon points="220,110 208,104 208,116" fill="rgb(var(--accent))"/>
<circle cx="30" cy="110" r="6" fill="currentColor"/>
<circle cx="220" cy="110" r="6" fill="currentColor"/>
<text x="30" y="135" text-anchor="middle" fill="currentColor">A</text>
<text x="220" y="135" text-anchor="middle" fill="currentColor">B</text>
<text x="125" y="30" text-anchor="middle" fill="rgb(var(--g-science))">s₁</text>
<text x="125" y="102" text-anchor="middle" fill="rgb(var(--accent))">s₂</text>
</svg>`

export const lesson: LessonSrc = {
  key: 'physics-136-ch02-lesson-01',
  title: { bn: 'গতি: দূরত্ব থেকে গতির সমীকরণ', en: 'Motion: from distance to the equations of motion' },
  scenes: [
    {
      type: 'text',
      title: { bn: 'স্থিতি আর গতি', en: 'Rest and motion' },
      bullets: [
        { bn: 'সময়ের সাথে কোনো বস্তুর অবস্থান না বদলালে বস্তুটি স্থিতিশীল। বদলালে বস্তুটি গতিশীল।', en: 'If an object\'s position does not change with time, it is at rest. If it changes, it is in motion.' },
        { bn: 'অবস্থান বলতে হলে একটি তুলনার জায়গা লাগে। একে বলে প্রসঙ্গ কাঠামো।', en: 'To describe a position we need something to compare with. This is called a frame of reference.' },
        { bn: 'চলন্ত বাসে বসা যাত্রী পাশের যাত্রীর তুলনায় স্থির, কিন্তু রাস্তার গাছের তুলনায় গতিশীল।', en: 'A passenger sitting in a moving bus is at rest compared with the next passenger, but moving compared with a tree by the road.' },
      ],
      narration: {
        bn: 'আজ আমরা গতি নিয়ে কথা বলব। একটা বস্তু যদি সময়ের সাথে জায়গা না বদলায়, তাকে বলি স্থিতিশীল। জায়গা বদলালে বলি গতিশীল। কিন্তু জায়গা বদলাল কিনা, সেটা বুঝতে কোনো কিছুর সাথে তুলনা করতে হয়। এই তুলনার জায়গাকে বলে প্রসঙ্গ কাঠামো। ধরো তুমি বাসে বসে আছ। পাশের যাত্রীর তুলনায় তুমি স্থির, কিন্তু রাস্তার পাশের গাছের তুলনায় তুমি চলছ। তাই স্থিতি আর গতি দুটোই আপেক্ষিক।',
        en: 'Today we talk about motion. If an object does not change its place over time, we say it is at rest. If it does, we say it is moving. But to tell whether the place changed, we must compare with something. That something is called a frame of reference. Say you are sitting in a bus. Compared with the person next to you, you are still. Compared with a tree by the road, you are moving. So rest and motion are both relative.',
      },
    },
    {
      type: 'diagram',
      title: { bn: 'দূরত্ব আর সরণ', en: 'Distance and displacement' },
      svg: pathSvg,
      bullets: [
        { bn: 'বস্তু আসলে যে পথ ধরে গেছে তার মোট দৈর্ঘ্য হলো দূরত্ব ($s_1$)। শুধু মান আছে, দিক নেই।', en: 'The total length of the path an object actually travels is the distance ($s_1$). It has size only, no direction.' },
        { bn: 'শুরুর বিন্দু থেকে শেষ বিন্দু পর্যন্ত সরলরেখার দৈর্ঘ্য, দিকসহ, হলো সরণ ($s_2$)।', en: 'The straight-line length from start to end, with its direction, is the displacement ($s_2$).' },
        { bn: 'যে রাশির শুধু মান আছে তা স্কেলার, যার মান ও দিক দুটোই আছে তা ভেক্টর। দূরত্ব স্কেলার, সরণ ভেক্টর।', en: 'A quantity with size only is a scalar; one with size and direction is a vector. Distance is a scalar, displacement a vector.' },
      ],
      narration: {
        bn: 'ছবিতে একটা বস্তু A থেকে B-তে গেছে বাঁকা পথ ধরে। পুরো বাঁকা পথের দৈর্ঘ্য হলো দূরত্ব। কিন্তু A থেকে সোজা B পর্যন্ত, তীর চিহ্নের দিকে, যে দৈর্ঘ্য, সেটা সরণ। দূরত্বের শুধু মান আছে, তাই এটা স্কেলার রাশি। সরণের মান আর দিক দুটোই আছে, তাই এটা ভেক্টর রাশি। খেয়াল করো, সরণ কখনো দূরত্বের চেয়ে বেশি হয় না।',
        en: 'In the picture an object goes from A to B along a curved path. The length of the whole curved path is the distance. The straight length from A to B, in the direction of the arrow, is the displacement. Distance has size only, so it is a scalar. Displacement has size and direction, so it is a vector. Notice that displacement is never more than distance.',
      },
    },
    {
      type: 'question',
      title: { bn: 'নিজেকে যাচাই করো', en: 'Check yourself' },
      question: {
        stem: { bn: 'একজন দৌড়বিদ $400\\,\\text{m}$ বৃত্তাকার ট্র্যাকে একবার পুরো ঘুরে শুরুর জায়গায় ফিরল। তার সরণ কত?', en: 'A runner goes once round a $400\\,\\text{m}$ circular track and returns to the start. What is the displacement?' },
        options: [{ bn: '$400\\,\\text{m}$', en: '$400\\,\\text{m}$' }, { bn: '$200\\,\\text{m}$', en: '$200\\,\\text{m}$' }, { bn: '$0\\,\\text{m}$', en: '$0\\,\\text{m}$' }, { bn: '$800\\,\\text{m}$', en: '$800\\,\\text{m}$' }],
        answer: 2,
        explanation: {
          bn: 'শুরু আর শেষ বিন্দু একই, তাই সরণ শূন্য। দূরত্ব অবশ্য $400\\,\\text{m}$।',
          en: 'The start and end points are the same, so displacement is zero. The distance, though, is $400\\,\\text{m}$.',
        },
      },
      narration: { bn: 'একটা প্রশ্ন। পুরো ট্র্যাক ঘুরে আবার শুরুর জায়গায় ফিরলে সরণ কত?', en: 'A question. If you run the whole track and come back to where you started, what is the displacement?' },
    },
    {
      type: 'text',
      title: { bn: 'দ্রুতি আর বেগ', en: 'Speed and velocity' },
      bullets: [
        { bn: 'দ্রুতি = দূরত্ব ÷ সময়। এটি স্কেলার। একক $\\text{m/s}$।', en: 'Speed = distance ÷ time. It is a scalar. Unit: $\\text{m/s}$.' },
        { bn: 'বেগ = সরণ ÷ সময়। এটি ভেক্টর, তাই দিক বলতে হয়।', en: 'Velocity = displacement ÷ time. It is a vector, so we must give its direction.' },
        { bn: 'সমান সময়ে সমান সরণ হলে বেগকে বলে সুষম বেগ।', en: 'If equal displacements happen in equal times, the velocity is uniform.' },
      ],
      narration: {
        bn: 'এখন জানব বস্তু কত তাড়াতাড়ি চলছে। দূরত্বকে সময় দিয়ে ভাগ করলে পাই দ্রুতি। এটা স্কেলার, একক মিটার প্রতি সেকেন্ড। আর সরণকে সময় দিয়ে ভাগ করলে পাই বেগ। বেগ ভেক্টর, তাই বলতে হয় কোন দিকে। যেমন, উত্তর দিকে দশ মিটার প্রতি সেকেন্ড। প্রতি সেকেন্ডে যদি একই পরিমাণ সরণ হয়, তাহলে বেগকে বলি সুষম বেগ।',
        en: 'Now we measure how fast something moves. Distance divided by time gives speed. It is a scalar, measured in metres per second. Displacement divided by time gives velocity. Velocity is a vector, so we say which way, for example ten metres per second north. If the displacement is the same every second, we call the velocity uniform.',
      },
    },
    {
      type: 'formula',
      title: { bn: 'ত্বরণ: বেগ কত দ্রুত বদলায়', en: 'Acceleration: how fast velocity changes' },
      tex: 'a = \\frac{v - u}{t}',
      bullets: [
        { bn: '$u$ আদিবেগ (শুরুর বেগ), $v$ শেষবেগ, $t$ সময়।', en: '$u$ is the initial velocity, $v$ the final velocity, $t$ the time.' },
        { bn: 'ত্বরণের একক $\\text{m/s}^2$। বেগ কমলে ত্বরণ ঋণাত্মক হয়, একে মন্দন বলে।', en: 'The unit of acceleration is $\\text{m/s}^2$. If velocity falls, acceleration is negative; this is called deceleration.' },
        { bn: 'প্রতি সেকেন্ডে বেগ সমান পরিমাণে বদলালে ত্বরণকে বলে সুষম ত্বরণ।', en: 'If velocity changes by the same amount every second, the acceleration is uniform.' },
      ],
      narration: {
        bn: 'বেগ সবসময় এক থাকে না। রিকশা ছাড়ার সময় বেগ বাড়ে, থামার সময় কমে। প্রতি সেকেন্ডে বেগ কতটা বদলায়, সেটাই ত্বরণ। শেষ বেগ v থেকে আদিবেগ u বিয়োগ করে সময় t দিয়ে ভাগ করলে ত্বরণ পাই। একক মিটার প্রতি বর্গ সেকেন্ড। বেগ কমলে ত্বরণ ঋণাত্মক হয়, তখন একে মন্দন বলি।',
        en: 'Velocity does not always stay the same. A rickshaw speeds up as it sets off and slows down as it stops. How much the velocity changes each second is the acceleration. Subtract the initial velocity u from the final velocity v and divide by the time t. The unit is metres per second squared. If the velocity falls, the acceleration is negative, and we call it deceleration.',
      },
    },
    {
      type: 'question',
      title: { bn: 'নিজেকে যাচাই করো', en: 'Check yourself' },
      question: {
        stem: { bn: 'একটি সাইকেলের বেগ $5\\,\\text{s}$-এ $2\\,\\text{m/s}$ থেকে $12\\,\\text{m/s}$ হলো। ত্বরণ কত?', en: 'A bicycle\'s velocity goes from $2\\,\\text{m/s}$ to $12\\,\\text{m/s}$ in $5\\,\\text{s}$. What is the acceleration?' },
        options: [{ bn: '$2\\,\\text{m/s}^2$', en: '$2\\,\\text{m/s}^2$' }, { bn: '$2.4\\,\\text{m/s}^2$', en: '$2.4\\,\\text{m/s}^2$' }, { bn: '$10\\,\\text{m/s}^2$', en: '$10\\,\\text{m/s}^2$' }, { bn: '$50\\,\\text{m/s}^2$', en: '$50\\,\\text{m/s}^2$' }],
        answer: 0,
        explanation: {
          bn: '$a = \\frac{v - u}{t} = \\frac{12 - 2}{5} = \\frac{10}{5} = 2\\,\\text{m/s}^2$।',
          en: '$a = \\frac{v - u}{t} = \\frac{12 - 2}{5} = \\frac{10}{5} = 2\\,\\text{m/s}^2$.',
        },
      },
      narration: { bn: 'এবার সূত্রটা ব্যবহার করে দেখো। ত্বরণ কত?', en: 'Now try the formula. What is the acceleration?' },
    },
    {
      type: 'formula',
      title: { bn: 'সুষম ত্বরণে গতির তিনটি সমীকরণ', en: 'Three equations for uniform acceleration' },
      tex: '\\begin{aligned} v &= u + at \\\\ s &= ut + \\tfrac{1}{2}at^2 \\\\ v^2 &= u^2 + 2as \\end{aligned}',
      bullets: [
        { bn: 'প্রথমটি ত্বরণের সংজ্ঞা থেকেই আসে: $a = \\frac{v - u}{t}$ কে সাজালে $v = u + at$।', en: 'The first comes straight from the definition: rearrange $a = \\frac{v - u}{t}$ to get $v = u + at$.' },
        { bn: 'দ্বিতীয়টি দেয় $t$ সময়ে অতিক্রান্ত দূরত্ব $s$।', en: 'The second gives the distance $s$ covered in time $t$.' },
        { bn: 'তৃতীয়টিতে সময় নেই। সময় না জানা থাকলে এটি ব্যবহার করো।', en: 'The third has no time in it. Use it when the time is not given.' },
      ],
      narration: {
        bn: 'ত্বরণ যদি সুষম হয়, তাহলে তিনটি সমীকরণ দিয়ে প্রায় সব অঙ্ক করা যায়। প্রথমটা, v সমান u যোগ a t, এটা ত্বরণের সংজ্ঞা থেকেই সাজিয়ে পাই। দ্বিতীয়টা, s সমান u t যোগ অর্ধেক a t বর্গ, এটা দেয় কত দূর গেল। তৃতীয়টা, v বর্গ সমান u বর্গ যোগ দুই a s। এতে সময় নেই, তাই সময় না দেওয়া থাকলে এটা কাজে লাগে।',
        en: 'If the acceleration is uniform, three equations solve almost every problem. The first, v equals u plus a t, is just the definition of acceleration rearranged. The second, s equals u t plus half a t squared, tells us how far the object goes. The third, v squared equals u squared plus two a s, has no time in it, so use it when the time is not given.',
      },
    },
    {
      type: 'worked_step',
      title: { bn: 'একটি উদাহরণ ধাপে ধাপে', en: 'A worked example, step by step' },
      problem: {
        bn: 'একটি গাড়ি স্থির অবস্থা থেকে $3\\,\\text{m/s}^2$ সুষম ত্বরণে চলতে শুরু করল। $4\\,\\text{s}$ পরে এর বেগ কত, আর এই সময়ে কত দূর গেল?',
        en: 'A car starts from rest with a uniform acceleration of $3\\,\\text{m/s}^2$. What is its velocity after $4\\,\\text{s}$, and how far has it gone?',
      },
      steps: [
        { text: { bn: 'স্থির অবস্থা থেকে শুরু, তাই $u = 0$। দেওয়া আছে $a = 3\\,\\text{m/s}^2$, $t = 4\\,\\text{s}$।', en: 'It starts from rest, so $u = 0$. Given $a = 3\\,\\text{m/s}^2$, $t = 4\\,\\text{s}$.' } },
        { tex: 'v = u + at = 0 + 3 \\times 4 = 12\\,\\text{m/s}' },
        { tex: 's = ut + \\tfrac{1}{2}at^2 = 0 + \\tfrac{1}{2} \\times 3 \\times 4^2 = 24\\,\\text{m}' },
        { text: { bn: 'যাচাই: $v^2 = u^2 + 2as = 0 + 2 \\times 3 \\times 24 = 144$, আর $12^2 = 144$। মিলে গেছে।', en: 'Check: $v^2 = u^2 + 2as = 0 + 2 \\times 3 \\times 24 = 144$, and $12^2 = 144$. It matches.' } },
      ],
      narration: {
        bn: 'একটা উদাহরণ করি। গাড়ি স্থির থেকে শুরু করল, তাই আদিবেগ শূন্য। ত্বরণ তিন, সময় চার সেকেন্ড। প্রথম সমীকরণে শেষ বেগ শূন্য যোগ তিন গুণ চার, অর্থাৎ বারো মিটার প্রতি সেকেন্ড। দ্বিতীয় সমীকরণে দূরত্ব অর্ধেক গুণ তিন গুণ চারের বর্গ, অর্থাৎ চব্বিশ মিটার। শেষে তৃতীয় সমীকরণ দিয়ে যাচাই করলাম, উত্তর মিলে গেছে।',
        en: 'Let us do an example. The car starts from rest, so the initial velocity is zero. Acceleration is three, time is four seconds. From the first equation, the final velocity is zero plus three times four, which is twelve metres per second. From the second, the distance is a half times three times four squared, which is twenty-four metres. Finally we check with the third equation, and it matches.',
      },
    },
    {
      type: 'question',
      title: { bn: 'নিজেকে যাচাই করো', en: 'Check yourself' },
      question: {
        stem: { bn: 'সময় দেওয়া নেই, কিন্তু $u$, $v$ ও $a$ জানা। দূরত্ব বের করতে কোন সমীকরণ সবচেয়ে সহজ?', en: 'The time is not given, but $u$, $v$ and $a$ are known. Which equation finds the distance most easily?' },
        options: [{ bn: '$v = u + at$', en: '$v = u + at$' }, { bn: '$s = ut + \\frac{1}{2}at^2$', en: '$s = ut + \\frac{1}{2}at^2$' }, { bn: '$v^2 = u^2 + 2as$', en: '$v^2 = u^2 + 2as$' }, { bn: '$a = \\frac{v - u}{t}$', en: '$a = \\frac{v - u}{t}$' }],
        answer: 2,
        explanation: {
          bn: '$v^2 = u^2 + 2as$ সমীকরণে $t$ নেই, তাই সরাসরি $s = \\frac{v^2 - u^2}{2a}$ পাওয়া যায়।',
          en: '$v^2 = u^2 + 2as$ has no $t$, so it gives $s = \\frac{v^2 - u^2}{2a}$ directly.',
        },
      },
      narration: { bn: 'সময় জানা না থাকলে কোন সমীকরণটা নেবে?', en: 'If you do not know the time, which equation do you choose?' },
    },
    {
      type: 'text',
      title: { bn: 'মুক্তভাবে পড়ন্ত বস্তু', en: 'Freely falling objects' },
      bullets: [
        { bn: 'বাতাসের বাধা না থাকলে সব বস্তু একই ত্বরণে নিচে পড়ে। একে অভিকর্ষজ ত্বরণ বলে, $g \\approx 9.8\\,\\text{m/s}^2$।', en: 'Without air resistance every object falls with the same acceleration, called the acceleration due to gravity, $g \\approx 9.8\\,\\text{m/s}^2$.' },
        { bn: 'তিনটি সমীকরণেই $a$ এর জায়গায় $g$ বসাও, আর $s$ এর জায়গায় উচ্চতা $h$।', en: 'In all three equations, put $g$ for $a$ and the height $h$ for $s$.' },
        { bn: 'উপর থেকে ছেড়ে দিলে $u = 0$, তাই $h = \\frac{1}{2}gt^2$।', en: 'An object simply dropped has $u = 0$, so $h = \\frac{1}{2}gt^2$.' },
      ],
      narration: {
        bn: 'শেষ কথা। একটা পাথর ছাদ থেকে ছেড়ে দিলে সেটা প্রতি সেকেন্ডে আরও জোরে পড়ে। বাতাসের বাধা না থাকলে ভারী হোক বা হালকা, সব বস্তুর ত্বরণ একই, প্রায় নয় দশমিক আট মিটার প্রতি বর্গ সেকেন্ড। একে বলে অভিকর্ষজ ত্বরণ, g। তাই আগের তিনটি সমীকরণে a-এর জায়গায় g বসালেই পড়ন্ত বস্তুর অঙ্ক করা যায়।',
        en: 'One last idea. A stone dropped from a roof falls faster every second. Without air resistance, heavy or light, every object has the same acceleration, about nine point eight metres per second squared. This is the acceleration due to gravity, g. So put g in place of a in the three equations and you can solve falling-object problems.',
      },
    },
  ],
}
