import type { CqSrc } from '../../types'

// 2 original creative questions. Marks: (a) knowledge 1, (b) comprehension 2,
// (c) application 3, (d) higher-order 4. Rubric points add up to each part's marks.

export const cqs: CqSrc[] = [
  {
    key: 'cq01', difficulty: 3, tags: ['malware', 'backup'],
    stem: {
      bn: 'তানভীর বন্ধুর কাছ থেকে একটি পেনড্রাইভ এনে স্ক্যান না করেই তার কম্পিউটারে খুলল। কিছুদিন পর কম্পিউটারটি খুব ধীর হয়ে গেল এবং তার প্রজেক্টের কয়েকটি ফাইল খুলছিল না। তার বোন রিমা নিয়মিত তার ফাইলগুলো গুগল ড্রাইভে রাখে এবং অ্যান্টিভাইরাস হালনাগাদ রাখে।',
      en: 'Tanvir brought a pen drive from a friend and opened it on his computer without scanning it. A few days later the computer became very slow and some of his project files would not open. His sister Rima regularly keeps her files on Google Drive and keeps her antivirus updated.',
    },
    parts: [
      {
        part: 'a',
        prompt: { bn: 'কম্পিউটার ভাইরাস কী?', en: 'What is a computer virus?' },
        model: { bn: 'কম্পিউটার ভাইরাস এক ধরনের ক্ষতিকর প্রোগ্রাম যা অন্য ফাইল বা প্রোগ্রামের সাথে জুড়ে নিজের কপি তৈরি করে ছড়ায় এবং ফাইল বা সিস্টেমের ক্ষতি করে।', en: 'A computer virus is a harmful program that attaches itself to other files or programs, copies itself to spread, and damages files or the system.' },
        rubric: [{ points: 1, criterion: { bn: 'ক্ষতিকর প্রোগ্রাম যা অন্য ফাইলের সাথে জুড়ে ছড়ায়, উল্লেখ করেছে', en: 'States it is a harmful program that spreads by attaching to other files' } }],
      },
      {
        part: 'b',
        prompt: { bn: 'ভাইরাস ও ওয়ার্মের মধ্যে পার্থক্য ব্যাখ্যা করো।', en: 'Explain the difference between a virus and a worm.' },
        model: {
          bn: 'ভাইরাস ছড়াতে অন্য ফাইলের সাথে জুড়ে থাকে এবং ব্যবহারকারী ফাইলটি চালালে সক্রিয় হয়।\n\nওয়ার্মের অন্য ফাইলের দরকার হয় না; এটি নিজেই নেটওয়ার্কের মাধ্যমে এক কম্পিউটার থেকে অন্যটিতে নিজের কপি পাঠিয়ে ছড়ায়।',
          en: 'A virus needs to attach to another file and becomes active when the user runs that file.\n\nA worm needs no host file; it spreads by itself, sending copies of itself across a network from one computer to another.',
        },
        rubric: [
          { points: 1, criterion: { bn: 'ভাইরাস অন্য ফাইলের উপর নির্ভরশীল', en: 'Virus depends on a host file' } },
          { points: 1, criterion: { bn: 'ওয়ার্ম নিজে নিজে নেটওয়ার্কে ছড়ায়', en: 'Worm spreads by itself over a network' } },
        ],
      },
      {
        part: 'c',
        prompt: { bn: 'তানভীরের কম্পিউটারের সমস্যার কারণ ও প্রতিকার ব্যাখ্যা করো।', en: 'Explain the cause of the problem with Tanvir\'s computer and how to fix it.' },
        model: {
          bn: 'কারণ: বন্ধুর পেনড্রাইভে সম্ভবত ভাইরাস ছিল। স্ক্যান না করে খোলায় ভাইরাস কম্পিউটারে ঢুকে প্রসেসর ও মেমোরি দখল করেছে (তাই ধীর) এবং ফাইল নষ্ট করেছে।\n\nপ্রতিকার: হালনাগাদ অ্যান্টিভাইরাস দিয়ে পুরো কম্পিউটার স্ক্যান করে ভাইরাস সরানো, নষ্ট ফাইল ব্যাকআপ থাকলে সেখান থেকে ফেরত আনা, আর ভবিষ্যতে পেনড্রাইভ খোলার আগে স্ক্যান করা।',
          en: 'Cause: the friend\'s pen drive probably carried a virus. Opening it without scanning let the virus in; it used up the processor and memory (so the computer slowed) and damaged files.\n\nFix: scan the whole computer with updated antivirus software to remove the virus, restore damaged files from a backup if one exists, and scan pen drives before opening them in future.',
        },
        rubric: [
          { points: 1, criterion: { bn: 'পেনড্রাইভ থেকে ভাইরাস সংক্রমণকে কারণ বলেছে', en: 'Identifies virus infection from the pen drive as the cause' } },
          { points: 1, criterion: { bn: 'ধীর হওয়া ও ফাইল নষ্ট হওয়ার সাথে সম্পর্ক দেখিয়েছে', en: 'Links it to the slowness and damaged files' } },
          { points: 1, criterion: { bn: 'অন্তত দুটি সঠিক প্রতিকার', en: 'Gives at least two correct fixes' } },
        ],
      },
      {
        part: 'd',
        prompt: { bn: 'তানভীর ও রিমার মধ্যে কার ফাইল বেশি নিরাপদ? যুক্তিসহ মূল্যায়ন করো।', en: 'Whose files are safer, Tanvir\'s or Rima\'s? Evaluate with reasons.' },
        model: {
          bn: 'রিমার ফাইল বেশি নিরাপদ।\n\nপ্রথমত, রিমা অ্যান্টিভাইরাস হালনাগাদ রাখে, তাই নতুন ভাইরাসও ধরা পড়ার সম্ভাবনা বেশি। তানভীর স্ক্যান না করেই পেনড্রাইভ খুলেছে।\n\nদ্বিতীয়ত, রিমার ফাইলের কপি গুগল ড্রাইভে (ক্লাউডে) আছে। কম্পিউটার নষ্ট বা সংক্রমিত হলেও সে ফাইল ফেরত পাবে। তানভীরের ব্যাকআপ না থাকায় নষ্ট ফাইল হারিয়ে যেতে পারে।\n\nতবে ক্লাউড অ্যাকাউন্টও শক্ত পাসওয়ার্ড ও দুই ধাপের যাচাই দিয়ে সুরক্ষিত রাখতে হবে, নইলে সেখানেও ঝুঁকি থাকে।',
          en: 'Rima\'s files are safer.\n\nFirst, Rima keeps her antivirus updated, so even new viruses are more likely to be caught. Tanvir opened a pen drive without scanning it.\n\nSecond, Rima has copies of her files on Google Drive (in the cloud). Even if her computer breaks or gets infected, she can get her files back. Tanvir has no backup, so his damaged files may be lost.\n\nStill, the cloud account must be protected with a strong password and two-step verification, or it carries its own risk.',
        },
        rubric: [
          { points: 1, criterion: { bn: 'রিমার ফাইল বেশি নিরাপদ, স্পষ্ট সিদ্ধান্ত', en: 'Clearly concludes Rima\'s files are safer' } },
          { points: 1, criterion: { bn: 'হালনাগাদ অ্যান্টিভাইরাসের ভূমিকা', en: 'Role of updated antivirus' } },
          { points: 1, criterion: { bn: 'ক্লাউড ব্যাকআপের ভূমিকা', en: 'Role of the cloud backup' } },
          { points: 1, criterion: { bn: 'সীমাবদ্ধতা বা অতিরিক্ত সতর্কতা (পাসওয়ার্ড/2FA) বিবেচনা', en: 'Considers a limit or extra precaution (password/2FA)' } },
        ],
      },
    ],
  },
  {
    key: 'cq02', difficulty: 3, tags: ['ergonomics', 'eye-care'],
    stem: {
      bn: 'অনলাইন ক্লাস ও গেমের জন্য সাদিয়া প্রতিদিন প্রায় ৬ ঘণ্টা ল্যাপটপ ব্যবহার করে। সে বিছানায় শুয়ে ল্যাপটপ পেটের উপর রেখে কাজ করে, আর রাতে ঘরের বাতি নিভিয়ে স্ক্রিন পুরো উজ্জ্বল রাখে। ইদানীং তার চোখ জ্বালা করে এবং ঘাড়ে ব্যথা হয়।',
      en: 'For online classes and games, Sadia uses a laptop about 6 hours a day. She lies in bed with the laptop on her stomach, and at night she turns off the room light and keeps the screen at full brightness. Lately her eyes burn and her neck hurts.',
    },
    parts: [
      {
        part: 'a',
        prompt: { bn: 'আর্গোনমিক্স কী?', en: 'What is ergonomics?' },
        model: { bn: 'মানুষের শরীরের সাথে মানানসই করে যন্ত্রপাতি ও কাজের পরিবেশ ডিজাইন ও সাজানোর বিজ্ঞানকে আর্গোনমিক্স বলে।', en: 'Ergonomics is the science of designing and arranging equipment and the workplace to fit the human body.' },
        rubric: [{ points: 1, criterion: { bn: 'সঠিক সংজ্ঞা', en: 'Correct definition' } }],
      },
      {
        part: 'b',
        prompt: { bn: '২০-২০-২০ নিয়মটি ব্যাখ্যা করো।', en: 'Explain the 20-20-20 rule.' },
        model: {
          bn: 'প্রতি ২০ মিনিট স্ক্রিন ব্যবহারের পর ২০ ফুট (প্রায় ৬ মিটার) দূরের কোনো বস্তুর দিকে ২০ সেকেন্ড তাকাতে হয়।\n\nকাছের স্ক্রিনে একটানা তাকালে চোখের পেশি সংকুচিত থাকে; দূরে তাকালে পেশি শিথিল হয় এবং চোখের ক্লান্তি কমে।',
          en: 'After every 20 minutes of screen use, look at something 20 feet (about 6 metres) away for 20 seconds.\n\nLooking at a close screen nonstop keeps the eye muscles tight; looking far away relaxes them and reduces eye strain.',
        },
        rubric: [
          { points: 1, criterion: { bn: 'নিয়মটি সঠিকভাবে বলেছে', en: 'States the rule correctly' } },
          { points: 1, criterion: { bn: 'চোখের পেশি শিথিল হওয়ার কারণ ব্যাখ্যা করেছে', en: 'Explains why it relaxes the eyes' } },
        ],
      },
      {
        part: 'c',
        prompt: { bn: 'সাদিয়ার চোখ জ্বালা ও ঘাড় ব্যথার কারণ উদ্দীপকের আলোকে ব্যাখ্যা করো।', en: 'Using the passage, explain why Sadia\'s eyes burn and her neck hurts.' },
        model: {
          bn: 'ঘাড় ব্যথা: শুয়ে পেটের উপর ল্যাপটপ রাখলে স্ক্রিন চোখের অনেক নিচে থাকে, তাই ঘাড় দীর্ঘক্ষণ সামনে বাঁকিয়ে রাখতে হয়। এতে ঘাড়ের পেশিতে চাপ পড়ে।\n\nচোখ জ্বালা: অন্ধকার ঘরে পুরো উজ্জ্বল স্ক্রিন চোখে বেশি চাপ দেয়। তার উপর দিনে ৬ ঘণ্টা বিরতিহীন ব্যবহারে চোখের পলক কম পড়ে, চোখ শুকিয়ে যায়।',
          en: 'Neck pain: lying down with the laptop on her stomach puts the screen far below eye level, so she keeps her neck bent forward for a long time. This strains the neck muscles.\n\nBurning eyes: a full-brightness screen in a dark room strains the eyes. On top of that, 6 hours a day without breaks means she blinks less and her eyes dry out.',
        },
        rubric: [
          { points: 1, criterion: { bn: 'ভুল ভঙ্গি ও স্ক্রিনের অবস্থানকে ঘাড় ব্যথার কারণ বলেছে', en: 'Links neck pain to poor posture and screen position' } },
          { points: 1, criterion: { bn: 'অন্ধকারে উজ্জ্বল স্ক্রিনকে চোখের কারণ বলেছে', en: 'Links eye pain to a bright screen in the dark' } },
          { points: 1, criterion: { bn: 'দীর্ঘ সময় বিরতিহীন ব্যবহারের প্রভাব উল্লেখ করেছে', en: 'Mentions the effect of long use without breaks' } },
        ],
      },
      {
        part: 'd',
        prompt: { bn: 'সাদিয়ার স্বাস্থ্য সমস্যা দূর করতে একটি কার্যকর পরিকল্পনা প্রস্তাব করো এবং তার যৌক্তিকতা বিশ্লেষণ করো।', en: 'Propose a workable plan to fix Sadia\'s health problems and analyse why it would work.' },
        model: {
          bn: '১. টেবিল-চেয়ারে বসে কাজ: পিঠ সোজা, পা মেঝেতে। ল্যাপটপ বই বা স্ট্যান্ডের উপর রেখে স্ক্রিনের ওপরের কিনারা চোখের সমান করা, প্রয়োজনে আলাদা কি-বোর্ড। এতে ঘাড় বাঁকাতে হবে না।\n\n২. ঘরে বাতি জ্বালিয়ে রাখা এবং স্ক্রিনের উজ্জ্বলতা ঘরের আলোর কাছাকাছি রাখা; রাতে নাইট মোড। এতে চোখের চাপ কমবে।\n\n৩. ২০-২০-২০ নিয়ম মানা এবং প্রতি ঘণ্টায় উঠে হাঁটা।\n\n৪. গেমের সময় সীমিত করা, যাতে মোট স্ক্রিন সময় কমে।\n\nপরিকল্পনাটি কার্যকর কারণ এটি প্রতিটি সমস্যার মূল কারণ (ভঙ্গি, আলো, বিরতিহীন ব্যবহার) সরাসরি দূর করে, এবং কোনো ব্যয়বহুল যন্ত্র লাগে না।',
          en: '1. Work at a table and chair: back straight, feet on the floor. Raise the laptop on books or a stand so the top of the screen is at eye level, with a separate keyboard if needed. Then she will not bend her neck.\n\n2. Keep the room light on and set screen brightness close to the room\'s light; use night mode at night. This reduces eye strain.\n\n3. Follow the 20-20-20 rule and get up to walk every hour.\n\n4. Limit game time to cut total screen time.\n\nThe plan works because it tackles the root cause of each problem (posture, lighting, nonstop use) directly, and needs no expensive equipment.',
        },
        rubric: [
          { points: 1, criterion: { bn: 'ভঙ্গি ও স্ক্রিনের উচ্চতা ঠিক করার প্রস্তাব', en: 'Proposes fixing posture and screen height' } },
          { points: 1, criterion: { bn: 'আলো ও উজ্জ্বলতা ঠিক করার প্রস্তাব', en: 'Proposes fixing lighting and brightness' } },
          { points: 1, criterion: { bn: 'বিরতি বা স্ক্রিন সময় কমানোর প্রস্তাব', en: 'Proposes breaks or less screen time' } },
          { points: 1, criterion: { bn: 'প্রতিটি প্রস্তাব সমস্যার কারণের সাথে যুক্ত করে যৌক্তিকতা দেখিয়েছে', en: 'Justifies each step by linking it to a cause' } },
        ],
      },
    ],
  },
]
