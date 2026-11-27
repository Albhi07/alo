import type { LessonSrc } from '../../types'

// Original lesson. One idea per scene, every term defined before use.
// A "check yourself" question comes every 2-3 scenes and must be answered to continue.

const postureSvg = `<svg viewBox="0 0 260 180" xmlns="http://www.w3.org/2000/svg" role="img" font-family="inherit" font-size="13">
<rect x="165" y="28" width="75" height="52" rx="4" fill="none" stroke="currentColor" stroke-width="2"/>
<line x1="202" y1="80" x2="202" y2="100" stroke="currentColor" stroke-width="2"/>
<line x1="135" y1="100" x2="250" y2="100" stroke="currentColor" stroke-width="3"/>
<line x1="240" y1="100" x2="240" y2="168" stroke="currentColor" stroke-width="2"/>
<rect x="138" y="94" width="30" height="5" fill="currentColor"/>
<line x1="40" y1="116" x2="100" y2="116" stroke="rgb(var(--g-science))" stroke-width="3"/>
<line x1="45" y1="116" x2="45" y2="168" stroke="rgb(var(--g-science))" stroke-width="2"/>
<line x1="95" y1="116" x2="95" y2="168" stroke="rgb(var(--g-science))" stroke-width="2"/>
<line x1="45" y1="116" x2="45" y2="60" stroke="rgb(var(--g-science))" stroke-width="2"/>
<circle cx="62" cy="32" r="12" fill="none" stroke="currentColor" stroke-width="2"/>
<line x1="62" y1="44" x2="62" y2="112" stroke="currentColor" stroke-width="3"/>
<line x1="62" y1="66" x2="92" y2="90" stroke="currentColor" stroke-width="3"/>
<line x1="92" y1="90" x2="140" y2="94" stroke="currentColor" stroke-width="3"/>
<line x1="62" y1="112" x2="118" y2="112" stroke="currentColor" stroke-width="3"/>
<line x1="118" y1="112" x2="118" y2="166" stroke="currentColor" stroke-width="3"/>
<line x1="118" y1="166" x2="134" y2="166" stroke="currentColor" stroke-width="3"/>
<line x1="20" y1="168" x2="250" y2="168" stroke="currentColor" stroke-width="2"/>
<line x1="74" y1="30" x2="165" y2="30" stroke="rgb(var(--accent))" stroke-width="2" stroke-dasharray="5 4"/>
<text x="118" y="22" text-anchor="middle" fill="rgb(var(--accent))">50-70 cm</text>
<text x="124" y="130" fill="currentColor">90°</text>
</svg>`

export const lesson: LessonSrc = {
  key: 'ict-154-ch02-lesson-01',
  title: { bn: 'কম্পিউটার ব্যবহারে নিরাপদ থাকা', en: 'Staying safe while using a computer' },
  scenes: [
    {
      type: 'text',
      title: { bn: 'নিরাপত্তার দুটি দিক', en: 'Two sides of safety' },
      bullets: [
        { bn: 'শারীরিক নিরাপত্তা: দীর্ঘক্ষণ কম্পিউটার ব্যবহারে চোখ, ঘাড়, পিঠ ও কবজির ক্ষতি থেকে নিজেকে রক্ষা করা।', en: 'Physical safety: protecting your eyes, neck, back and wrists from long hours at a computer.' },
        { bn: 'তথ্যের নিরাপত্তা: নিজের যন্ত্র, ফাইল ও ব্যক্তিগত তথ্য ক্ষতিকর প্রোগ্রাম ও প্রতারকদের হাত থেকে রক্ষা করা।', en: 'Information safety: protecting your device, files and personal details from harmful programs and scammers.' },
        { bn: 'আজ দুটোই ধাপে ধাপে শিখব।', en: 'Today we learn both, step by step.' },
      ],
      narration: {
        bn: 'কম্পিউটার আর মোবাইল আমাদের পড়াশোনা আর কাজের বড় সঙ্গী। কিন্তু এগুলো ব্যবহারে দুই রকম ঝুঁকি আছে। একটা শরীরের: অনেকক্ষণ স্ক্রিনের সামনে থাকলে চোখ, ঘাড়, পিঠে ব্যথা হতে পারে। আরেকটা তথ্যের: ভাইরাস বা প্রতারক তোমার ফাইল আর ব্যক্তিগত তথ্য চুরি বা নষ্ট করতে পারে। আজ দুটো থেকেই কীভাবে বাঁচব তা শিখব।',
        en: 'Computers and phones are big helpers for study and work. But using them carries two kinds of risk. One is to the body: long hours at a screen can hurt your eyes, neck and back. The other is to information: viruses or scammers can steal or damage your files and personal details. Today we learn how to stay safe from both.',
      },
    },
    {
      type: 'diagram',
      title: { bn: 'সঠিক ভঙ্গিতে বসা', en: 'Sitting the right way' },
      svg: postureSvg,
      bullets: [
        { bn: 'মনিটরের ওপরের কিনারা চোখের সমান বা একটু নিচে, চোখ থেকে প্রায় ৫০-৭০ সেমি দূরে।', en: 'The top of the monitor at or a little below eye level, about 50-70 cm from your eyes.' },
        { bn: 'পিঠ সোজা, পা মেঝেতে সমানভাবে রাখা, হাঁটু প্রায় সমকোণে।', en: 'Back straight, feet flat on the floor, knees at about a right angle.' },
        { bn: 'কবজি সোজা রেখে কি-বোর্ড ব্যবহার করো।', en: 'Keep your wrists straight while typing.' },
      ],
      narration: {
        bn: 'ছবিতে দেখো কীভাবে বসতে হয়। মনিটরের ওপরের কিনারা থাকবে চোখের সমান বা সামান্য নিচে, আর মনিটর থাকবে চোখ থেকে মোটামুটি এক হাত দূরে। পিঠ সোজা, দুই পা মেঝেতে, হাঁটু প্রায় নব্বই ডিগ্রি। কি-বোর্ডে টাইপ করার সময় কবজি সোজা রাখো, বাঁকিয়ো না। শরীরের সাথে মানানসই এভাবে যন্ত্র সাজানোর বিজ্ঞানকে বলে আর্গোনমিক্স।',
        en: 'The picture shows how to sit. The top edge of the monitor should be at eye level or a little lower, about an arm\'s length away. Back straight, both feet on the floor, knees at about ninety degrees. Keep your wrists straight when you type; do not bend them. The science of arranging equipment to fit the body like this is called ergonomics.',
      },
    },
    {
      type: 'text',
      title: { bn: 'চোখ আর শরীরের বিরতি', en: 'Breaks for your eyes and body' },
      bullets: [
        { bn: '২০-২০-২০ নিয়ম: প্রতি ২০ মিনিট পর ২০ ফুট (প্রায় ৬ মিটার) দূরের কিছুর দিকে ২০ সেকেন্ড তাকাও।', en: 'The 20-20-20 rule: every 20 minutes, look at something 20 feet (about 6 metres) away for 20 seconds.' },
        { bn: 'প্রতি ঘণ্টায় একবার উঠে হাঁটো, ঘাড় ও কাঁধ নাড়াও।', en: 'Once an hour, get up, walk and loosen your neck and shoulders.' },
        { bn: 'ঘরে পর্যাপ্ত আলো রাখো, স্ক্রিনের উজ্জ্বলতা ঘরের আলোর কাছাকাছি রাখো।', en: 'Keep the room well lit and the screen brightness close to the room\'s light.' },
      ],
      narration: {
        bn: 'একটানা স্ক্রিনের দিকে তাকালে চোখ শুকিয়ে যায় আর ক্লান্ত হয়। সহজ একটা নিয়ম মনে রাখো: বিশ, বিশ, বিশ। প্রতি বিশ মিনিট পর বিশ ফুট দূরের কিছুর দিকে বিশ সেকেন্ড তাকাও। আর প্রতি ঘণ্টায় একবার উঠে একটু হাঁটো। অন্ধকার ঘরে উজ্জ্বল স্ক্রিন চোখের জন্য খারাপ, তাই ঘরে আলো রাখো।',
        en: 'Staring at a screen nonstop makes your eyes dry and tired. Remember one easy rule: twenty, twenty, twenty. Every twenty minutes, look at something twenty feet away for twenty seconds. And once an hour, get up and walk a little. A bright screen in a dark room is hard on the eyes, so keep the room lit.',
      },
    },
    {
      type: 'question',
      title: { bn: 'নিজেকে যাচাই করো', en: 'Check yourself' },
      question: {
        stem: { bn: '২০-২০-২০ নিয়ম অনুযায়ী প্রতি ২০ মিনিট পর কী করতে হয়?', en: 'Under the 20-20-20 rule, what do you do every 20 minutes?' },
        options: [
          { bn: '২০ সেকেন্ড চোখ বন্ধ রাখা', en: 'Close your eyes for 20 seconds' },
          { bn: '২০ ফুট দূরে ২০ সেকেন্ড তাকানো', en: 'Look 20 feet away for 20 seconds' },
          { bn: '২০ মিনিট বিশ্রাম নেওয়া', en: 'Rest for 20 minutes' },
          { bn: 'স্ক্রিনের উজ্জ্বলতা ২০% করা', en: 'Set the screen brightness to 20%' },
        ],
        answer: 1,
        explanation: {
          bn: 'দূরের কিছুর দিকে তাকালে চোখের পেশি শিথিল হয়। তাই ২০ ফুট দূরে ২০ সেকেন্ড।',
          en: 'Looking at something far away relaxes the eye muscles. So: 20 feet away, for 20 seconds.',
        },
      },
      narration: { bn: 'মনে আছে তো? বিশ-বিশ-বিশ নিয়মে কী করতে হয়?', en: 'Do you remember? What does the twenty-twenty-twenty rule ask you to do?' },
    },
    {
      type: 'text',
      title: { bn: 'ম্যালওয়্যার: ক্ষতিকর প্রোগ্রাম', en: 'Malware: harmful programs' },
      bullets: [
        { bn: 'যে প্রোগ্রাম ইচ্ছা করে ক্ষতি করার জন্য তৈরি, তাকে ম্যালওয়্যার বলে।', en: 'A program made on purpose to cause harm is called malware.' },
        { bn: 'ভাইরাস নিজেকে অন্য ফাইলের সাথে জুড়ে ছড়ায়। ওয়ার্ম নেটওয়ার্কে নিজে নিজেই ছড়ায়। ট্রোজান দরকারি প্রোগ্রামের ছদ্মবেশে আসে।', en: 'A virus spreads by attaching itself to other files. A worm spreads by itself across a network. A Trojan disguises itself as a useful program.' },
        { bn: 'লক্ষণ: কম্পিউটার হঠাৎ ধীর হওয়া, ফাইল হারানো বা নষ্ট হওয়া, অচেনা পপ-আপ।', en: 'Signs: the computer suddenly slows down, files vanish or break, strange pop-ups appear.' },
      ],
      narration: {
        bn: 'এবার তথ্যের নিরাপত্তা। কিছু প্রোগ্রাম বানানোই হয় ক্ষতি করার জন্য। এদের একসাথে বলে ম্যালওয়্যার। ভাইরাস অন্য ফাইলের গায়ে লেগে ছড়ায়, যেমন সংক্রমিত পেনড্রাইভ থেকে। ওয়ার্ম নেটওয়ার্কের মাধ্যমে নিজে নিজেই এক কম্পিউটার থেকে আরেকটায় যায়। আর ট্রোজান আসে ভালো গেম বা অ্যাপের ছদ্মবেশে। কম্পিউটার হঠাৎ খুব ধীর হলে বা অচেনা পপ-আপ এলে সন্দেহ করো।',
        en: 'Now, information safety. Some programs are made only to do harm. Together we call them malware. A virus spreads by sticking to other files, for example from an infected pen drive. A worm moves from computer to computer over a network by itself. A Trojan arrives dressed up as a nice game or app. If your computer suddenly gets very slow or strange pop-ups appear, be suspicious.',
      },
    },
    {
      type: 'text',
      title: { bn: 'ম্যালওয়্যার থেকে বাঁচার উপায়', en: 'How to stay safe from malware' },
      bullets: [
        { bn: 'অ্যান্টিভাইরাস ব্যবহার করো এবং নিয়মিত হালনাগাদ (আপডেট) করো।', en: 'Use antivirus software and keep it updated.' },
        { bn: 'শুধু বিশ্বস্ত উৎস থেকে সফটওয়্যার নামাও। পেনড্রাইভ খোলার আগে স্ক্যান করো।', en: 'Download software only from trusted sources. Scan a pen drive before opening it.' },
        { bn: 'জরুরি ফাইলের ব্যাকআপ রাখো, অন্য ড্রাইভে বা ক্লাউডে।', en: 'Keep backups of important files on another drive or in the cloud.' },
      ],
      narration: {
        bn: 'বাঁচার উপায় তিনটা। এক, একটা অ্যান্টিভাইরাস রাখো আর সেটা নিয়মিত আপডেট করো, কারণ প্রতিদিন নতুন ভাইরাস তৈরি হয়। দুই, শুধু বিশ্বস্ত জায়গা থেকে সফটওয়্যার নামাও, আর বন্ধুর পেনড্রাইভ খোলার আগে স্ক্যান করো। তিন, দরকারি ফাইলের একটা কপি অন্য জায়গায় রাখো। একে বলে ব্যাকআপ। সব নষ্ট হলেও ব্যাকআপ থেকে ফেরত পাবে।',
        en: 'There are three ways to stay safe. One, keep antivirus software and update it often, because new viruses appear every day. Two, download software only from trusted places, and scan a friend\'s pen drive before you open it. Three, keep a copy of important files somewhere else. That is called a backup. Even if everything breaks, you can get your files back.',
      },
    },
    {
      type: 'question',
      title: { bn: 'নিজেকে যাচাই করো', en: 'Check yourself' },
      question: {
        stem: { bn: 'কোন ম্যালওয়্যার দরকারি প্রোগ্রামের ছদ্মবেশে আসে?', en: 'Which malware arrives disguised as a useful program?' },
        options: [{ bn: 'ওয়ার্ম', en: 'Worm' }, { bn: 'ট্রোজান হর্স', en: 'Trojan horse' }, { bn: 'অ্যান্টিভাইরাস', en: 'Antivirus' }, { bn: 'ফায়ারওয়াল', en: 'Firewall' }],
        answer: 1,
        explanation: {
          bn: 'ট্রোজান দেখতে ভালো প্রোগ্রামের মতো, কিন্তু ভেতরে ক্ষতিকর কোড থাকে। অ্যান্টিভাইরাস ও ফায়ারওয়াল আসলে সুরক্ষার জন্য।',
          en: 'A Trojan looks like a good program but hides harmful code inside. Antivirus and firewalls are actually there to protect you.',
        },
      },
      narration: { bn: 'বলো তো, কোনটা ভালো প্রোগ্রামের ছদ্মবেশে আসে?', en: 'Tell me, which one comes disguised as a good program?' },
    },
    {
      type: 'text',
      title: { bn: 'শক্ত পাসওয়ার্ড', en: 'Strong passwords' },
      bullets: [
        { bn: 'কমপক্ষে ১২টি অক্ষর। বড় হাতের, ছোট হাতের অক্ষর, সংখ্যা ও চিহ্ন মিশিয়ে।', en: 'At least 12 characters, mixing capital and small letters, numbers and symbols.' },
        { bn: 'নাম, জন্মতারিখ, মোবাইল নম্বর বা "123456" এর মতো সহজে অনুমানযোগ্য কিছু নয়।', en: 'Nothing easy to guess like your name, birthday, phone number or "123456".' },
        { bn: 'প্রতিটি অ্যাকাউন্টে আলাদা পাসওয়ার্ড, আর কারও সাথে শেয়ার নয়। সম্ভব হলে দুই ধাপের যাচাই (2FA) চালু করো।', en: 'A different password for each account, shared with nobody. Turn on two-step verification (2FA) where you can.' },
      ],
      narration: {
        bn: 'তোমার অ্যাকাউন্টের দরজার তালা হলো পাসওয়ার্ড। শক্ত পাসওয়ার্ড কমপক্ষে বারো অক্ষরের, তাতে বড় ছোট অক্ষর, সংখ্যা আর চিহ্ন মেশানো। নিজের নাম বা জন্মতারিখ দিয়ো না, ওগুলো সহজে অনুমান করা যায়। প্রতিটা অ্যাকাউন্টে আলাদা পাসওয়ার্ড দাও, যাতে একটা ফাঁস হলেও বাকিগুলো নিরাপদ থাকে। আর দুই ধাপের যাচাই চালু রাখলে পাসওয়ার্ড জানলেও কেউ ঢুকতে পারবে না।',
        en: 'Your password is the lock on your account\'s door. A strong one has at least twelve characters, mixing capital and small letters, numbers and symbols. Do not use your name or birthday; they are easy to guess. Use a different password for each account, so if one leaks the others stay safe. And with two-step verification on, nobody can get in even if they learn your password.',
      },
    },
    {
      type: 'text',
      title: { bn: 'অনলাইনে প্রতারণা আর সাইবার বুলিং', en: 'Online scams and cyberbullying' },
      bullets: [
        { bn: 'ফিশিং: ব্যাংক বা পরিচিত প্রতিষ্ঠান সেজে ভুয়া মেসেজ বা লিংক পাঠিয়ে পাসওয়ার্ড বা OTP চাওয়া। কখনো OTP কাউকে দেবে না।', en: 'Phishing: fake messages or links pretending to be a bank or a known organisation, asking for your password or OTP. Never give your OTP to anyone.' },
        { bn: 'সাইবার বুলিং: অনলাইনে কাউকে ভয় দেখানো, অপমান করা বা হয়রানি করা।', en: 'Cyberbullying: frightening, insulting or harassing someone online.' },
        { bn: 'এমন হলে উত্তর দিয়ো না, স্ক্রিনশট রেখে ব্লক ও রিপোর্ট করো, আর মা-বাবা বা শিক্ষককে জানাও। জাতীয় হেল্পলাইন ৯৯৯।', en: 'If it happens, do not reply. Keep screenshots, block and report, and tell a parent or teacher. National helpline: 999.' },
      ],
      narration: {
        bn: 'শেষ কথা। কেউ যদি ব্যাংক বা মোবাইল কোম্পানি সেজে মেসেজ দিয়ে তোমার পাসওয়ার্ড বা ও টি পি চায়, বুঝবে এটা ফিশিং, মানে প্রতারণা। আসল প্রতিষ্ঠান কখনো ও টি পি চায় না। আর অনলাইনে কেউ ভয় দেখালে বা অপমান করলে, সেটা সাইবার বুলিং। উত্তর দিয়ো না, স্ক্রিনশট রাখো, ব্লক আর রিপোর্ট করো, আর অবশ্যই বড় কাউকে জানাও। তুমি একা নও।',
        en: 'One last idea. If someone pretends to be a bank or phone company and asks for your password or OTP, that is phishing, a scam. Real organisations never ask for your OTP. And if someone frightens or insults you online, that is cyberbullying. Do not reply; keep screenshots, block and report, and always tell an adult. You are not alone.',
      },
    },
  ],
}
