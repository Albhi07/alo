import type { Bi, McqSrc } from '../../types'

// 14 original MCQs: 9 single-answer, 3 multiple-completion (বহুপদী সমাপ্তিসূচক),
// 2 situation-based (অনুচ্ছেদ-ভিত্তিক) sharing one passage.

const MC_OPTS: [Bi, Bi, Bi, Bi] = [
  { bn: 'i ও ii', en: 'i and ii' }, { bn: 'i ও iii', en: 'i and iii' },
  { bn: 'ii ও iii', en: 'ii and iii' }, { bn: 'i, ii ও iii', en: 'i, ii and iii' },
]

const nabila: Bi = {
  bn: 'নাবিলা একটি মেসেজ পেল: "আপনার মোবাইল ব্যাংকিং অ্যাকাউন্ট বন্ধ হয়ে যাবে। এখনই এই লিংকে গিয়ে পিন ও OTP দিন।" লিংকের ঠিকানায় ব্যাংকের নামের বানান একটু আলাদা।',
  en: 'Nabila gets a message: "Your mobile banking account will be closed. Go to this link now and enter your PIN and OTP." The bank\'s name in the link address is spelled slightly differently.',
}

export const mcqs: McqSrc[] = [
  {
    key: 'q01', subtype: 'single', difficulty: 1, tags: ['malware'],
    stem: { bn: 'ক্ষতিকর উদ্দেশ্যে তৈরি প্রোগ্রামকে সাধারণভাবে কী বলে?', en: 'What is the general name for programs made to cause harm?' },
    options: [{ bn: 'ফার্মওয়্যার', en: 'Firmware' }, { bn: 'ম্যালওয়্যার', en: 'Malware' }, { bn: 'ফ্রিওয়্যার', en: 'Freeware' }, { bn: 'মিডলওয়্যার', en: 'Middleware' }], answer: 1,
    explanation: { bn: 'Malicious + software = malware। ভাইরাস, ওয়ার্ম, ট্রোজান সবই ম্যালওয়্যার।', en: 'Malicious + software = malware. Viruses, worms and Trojans are all malware.' },
  },
  {
    key: 'q02', subtype: 'single', difficulty: 1, tags: ['malware'],
    stem: { bn: 'কোনটি ব্যবহারকারীর সাহায্য ছাড়াই নেটওয়ার্কের মাধ্যমে নিজে নিজে ছড়ায়?', en: 'Which spreads by itself across a network without the user\'s help?' },
    options: [{ bn: 'ভাইরাস', en: 'Virus' }, { bn: 'ট্রোজান', en: 'Trojan' }, { bn: 'ওয়ার্ম', en: 'Worm' }, { bn: 'স্প্যাম', en: 'Spam' }], answer: 2,
    explanation: { bn: 'ওয়ার্মের অন্য ফাইলের সাথে জুড়ে থাকার দরকার হয় না; এটি নিজেই নিজের কপি বানিয়ে ছড়ায়।', en: 'A worm does not need to attach to other files; it copies itself and spreads.' },
  },
  {
    key: 'q03', subtype: 'single', difficulty: 1, tags: ['ergonomics'],
    stem: { bn: 'শরীরের সাথে মানানসইভাবে যন্ত্র ও কাজের পরিবেশ সাজানোর বিজ্ঞানকে কী বলে?', en: 'What is the science of fitting equipment and the workplace to the body called?' },
    options: [{ bn: 'বায়োমেট্রিক্স', en: 'Biometrics' }, { bn: 'আর্গোনমিক্স', en: 'Ergonomics' }, { bn: 'রোবোটিক্স', en: 'Robotics' }, { bn: 'ইকোনমিক্স', en: 'Economics' }], answer: 1,
    explanation: { bn: 'আর্গোনমিক্স মেনে বসলে ঘাড়, পিঠ ও কবজির ব্যথা কমে।', en: 'Following ergonomics reduces neck, back and wrist pain.' },
  },
  {
    key: 'q04', subtype: 'single', difficulty: 2, tags: ['ergonomics'],
    stem: { bn: 'কম্পিউটারে কাজ করার সময় মনিটরের ওপরের কিনারা কোথায় থাকা উচিত?', en: 'Where should the top edge of the monitor be while working?' },
    options: [{ bn: 'চোখের অনেক উপরে', en: 'Well above the eyes' }, { bn: 'চোখের সমান বা সামান্য নিচে', en: 'At or slightly below eye level' }, { bn: 'বুকের সমান', en: 'At chest level' }, { bn: 'যেকোনো উচ্চতায়', en: 'At any height' }], answer: 1,
    explanation: { bn: 'চোখের সমান বা একটু নিচে থাকলে ঘাড় বাঁকাতে হয় না।', en: 'At or a little below eye level, you do not need to bend your neck.' },
  },
  {
    key: 'q05', subtype: 'single', difficulty: 2, tags: ['password'],
    stem: { bn: 'নিচের কোন পাসওয়ার্ডটি সবচেয়ে শক্ত?', en: 'Which password is the strongest?' },
    options: [{ bn: 'rahim2010', en: 'rahim2010' }, { bn: '12345678', en: '12345678' }, { bn: 'Nodi#Ghor7!Megh', en: 'Nodi#Ghor7!Megh' }, { bn: 'password', en: 'password' }], answer: 2,
    explanation: { bn: 'এটি লম্বা, এবং বড়-ছোট অক্ষর, সংখ্যা ও চিহ্ন মেশানো। বাকিগুলো সহজে অনুমানযোগ্য।', en: 'It is long and mixes capitals, small letters, a number and symbols. The others are easy to guess.' },
  },
  {
    key: 'q06', subtype: 'single', difficulty: 2, tags: ['backup'],
    stem: { bn: 'ভাইরাসে ফাইল নষ্ট হলেও তা ফেরত পাওয়ার সবচেয়ে ভালো উপায় কোনটি?', en: 'What is the best way to get files back even if a virus damages them?' },
    options: [{ bn: 'কম্পিউটার রিস্টার্ট করা', en: 'Restart the computer' }, { bn: 'আগে থেকে ব্যাকআপ রাখা', en: 'Keep a backup beforehand' }, { bn: 'স্ক্রিন বন্ধ রাখা', en: 'Keep the screen off' }, { bn: 'ইন্টারনেটের গতি বাড়ানো', en: 'Get faster internet' }], answer: 1,
    explanation: { bn: 'অন্য ড্রাইভ বা ক্লাউডে রাখা কপি থেকে ফাইল ফেরত আনা যায়।', en: 'A copy kept on another drive or in the cloud lets you restore the files.' },
  },
  {
    key: 'q07', subtype: 'single', difficulty: 2, tags: ['eye-care'],
    stem: { bn: '২০-২০-২০ নিয়মের উদ্দেশ্য কী?', en: 'What is the purpose of the 20-20-20 rule?' },
    options: [{ bn: 'টাইপিংয়ের গতি বাড়ানো', en: 'Type faster' }, { bn: 'চোখের ক্লান্তি কমানো', en: 'Reduce eye strain' }, { bn: 'বিদ্যুৎ সাশ্রয়', en: 'Save electricity' }, { bn: 'ভাইরাস দূর করা', en: 'Remove viruses' }], answer: 1,
    explanation: { bn: 'নিয়মিত দূরে তাকালে চোখের পেশি বিশ্রাম পায়।', en: 'Looking far away regularly lets the eye muscles rest.' },
  },
  {
    key: 'q08', subtype: 'single', difficulty: 3, tags: ['malware'],
    stem: { bn: 'কম্পিউটার ভাইরাসের সম্ভাব্য লক্ষণ কোনটি?', en: 'Which is a likely sign of a computer virus?' },
    options: [{ bn: 'কি-বোর্ডের আলো জ্বলা', en: 'The keyboard light is on' }, { bn: 'কোনো কারণ ছাড়াই কম্পিউটার হঠাৎ খুব ধীর হওয়া', en: 'The computer suddenly becomes very slow for no reason' }, { bn: 'মনিটরের উজ্জ্বলতা কম', en: 'The monitor brightness is low' }, { bn: 'ঘড়ি ঠিক সময় দেখানো', en: 'The clock shows the right time' }], answer: 1,
    explanation: { bn: 'ম্যালওয়্যার গোপনে প্রসেসর ও মেমোরি ব্যবহার করে, তাই কম্পিউটার ধীর হয়ে যায়।', en: 'Malware secretly uses the processor and memory, so the computer slows down.' },
  },
  {
    key: 'q09', subtype: 'single', difficulty: 3, tags: ['2fa'],
    stem: { bn: 'দুই ধাপের যাচাই (2FA) চালু থাকলে কী সুবিধা হয়?', en: 'What is the benefit of turning on two-step verification (2FA)?' },
    options: [
      { bn: 'পাসওয়ার্ড লাগে না', en: 'No password is needed' },
      { bn: 'পাসওয়ার্ড জানলেও দ্বিতীয় কোড ছাড়া কেউ ঢুকতে পারে না', en: 'Even with the password, nobody gets in without the second code' },
      { bn: 'ইন্টারনেট দ্রুত হয়', en: 'The internet gets faster' },
      { bn: 'ভাইরাস নিজে মুছে যায়', en: 'Viruses delete themselves' },
    ], answer: 1,
    explanation: { bn: 'দ্বিতীয় ধাপের কোড সাধারণত শুধু তোমার ফোনে আসে, তাই চোর শুধু পাসওয়ার্ড দিয়ে ঢুকতে পারে না।', en: 'The second code usually comes only to your phone, so a thief cannot get in with the password alone.' },
  },
  {
    key: 'q10', subtype: 'multi_completion', difficulty: 2, tags: ['malware'],
    stem: {
      bn: 'ম্যালওয়্যার থেকে বাঁচতে—\n\ni. অ্যান্টিভাইরাস নিয়মিত হালনাগাদ করতে হয়\n\nii. পেনড্রাইভ খোলার আগে স্ক্যান করতে হয়\n\niii. অচেনা ওয়েবসাইট থেকে বিনামূল্যের গেম নামাতে হয়\n\nনিচের কোনটি সঠিক?',
      en: 'To stay safe from malware:\n\ni. keep antivirus software updated\n\nii. scan a pen drive before opening it\n\niii. download free games from unknown websites\n\nWhich is correct?',
    },
    options: MC_OPTS, answer: 0,
    explanation: { bn: 'অচেনা উৎসের সফটওয়্যারে প্রায়ই ট্রোজান থাকে, তাই iii ভুল।', en: 'Software from unknown sources often hides Trojans, so iii is wrong.' },
  },
  {
    key: 'q11', subtype: 'multi_completion', difficulty: 3, tags: ['password'],
    stem: {
      bn: 'শক্ত পাসওয়ার্ডের বৈশিষ্ট্য—\n\ni. কমপক্ষে ১২টি অক্ষর\n\nii. সব অ্যাকাউন্টে একই পাসওয়ার্ড\n\niii. অক্ষর, সংখ্যা ও চিহ্নের মিশ্রণ\n\nনিচের কোনটি সঠিক?',
      en: 'Features of a strong password:\n\ni. at least 12 characters\n\nii. the same password for every account\n\niii. a mix of letters, numbers and symbols\n\nWhich is correct?',
    },
    options: MC_OPTS, answer: 1,
    explanation: { bn: 'সব অ্যাকাউন্টে একই পাসওয়ার্ড দিলে একটি ফাঁস হলেই সব ঝুঁকিতে পড়ে, তাই ii ভুল।', en: 'Using one password everywhere means one leak puts every account at risk, so ii is wrong.' },
  },
  {
    key: 'q12', subtype: 'multi_completion', difficulty: 3, tags: ['cyberbullying'],
    stem: {
      bn: 'অনলাইনে কেউ হয়রানি করলে—\n\ni. প্রমাণ হিসেবে স্ক্রিনশট রাখা উচিত\n\nii. পাল্টা অপমান করে উত্তর দেওয়া উচিত\n\niii. মা-বাবা বা শিক্ষককে জানানো উচিত\n\nনিচের কোনটি সঠিক?',
      en: 'If someone harasses you online:\n\ni. keep screenshots as evidence\n\nii. reply with insults of your own\n\niii. tell a parent or teacher\n\nWhich is correct?',
    },
    options: MC_OPTS, answer: 1,
    explanation: { bn: 'পাল্টা উত্তর দিলে পরিস্থিতি আরও খারাপ হয়। প্রমাণ রাখো, ব্লক-রিপোর্ট করো, বড়দের জানাও।', en: 'Replying makes things worse. Keep evidence, block and report, and tell an adult.' },
  },
  {
    key: 'q13', subtype: 'situation', difficulty: 2, tags: ['phishing'], context: nabila,
    stem: { bn: 'নাবিলা যে ধরনের প্রতারণার শিকার হতে যাচ্ছে, তাকে কী বলে?', en: 'What kind of scam is Nabila facing?' },
    options: [{ bn: 'হ্যাকিং', en: 'Hacking' }, { bn: 'ফিশিং', en: 'Phishing' }, { bn: 'স্প্যামিং', en: 'Spamming' }, { bn: 'পাইরেসি', en: 'Piracy' }], answer: 1,
    explanation: { bn: 'পরিচিত প্রতিষ্ঠান সেজে ভুয়া লিংক দিয়ে গোপন তথ্য চাওয়াই ফিশিং।', en: 'Pretending to be a known organisation and using a fake link to ask for secret details is phishing.' },
  },
  {
    key: 'q14', subtype: 'situation', difficulty: 3, tags: ['phishing'], context: nabila,
    stem: { bn: 'নাবিলার জন্য সবচেয়ে সঠিক কাজ কোনটি?', en: 'What is the best thing for Nabila to do?' },
    options: [
      { bn: 'দ্রুত লিংকে গিয়ে পিন ও OTP দেওয়া', en: 'Quickly open the link and enter her PIN and OTP' },
      { bn: 'মেসেজটি বন্ধুদের ফরোয়ার্ড করা', en: 'Forward the message to friends' },
      { bn: 'লিংকে না গিয়ে ব্যাংকের অফিসিয়াল নম্বরে ফোন করে যাচাই করা', en: 'Not open the link, and call the bank\'s official number to check' },
      { bn: 'শুধু পিন দেওয়া, OTP নয়', en: 'Enter only the PIN, not the OTP' },
    ], answer: 2,
    explanation: { bn: 'ব্যাংক কখনো মেসেজে পিন বা OTP চায় না। অফিসিয়াল নম্বরে যাচাই করাই নিরাপদ।', en: 'Banks never ask for a PIN or OTP by message. Checking through the official number is safe.' },
  },
]
