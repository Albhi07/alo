import type { MethodSheetSrc } from '../../types'

export const methodSheets: MethodSheetSrc[] = [
  {
    key: 'ms-motion-equations',
    question_type: 'equations_of_motion',
    body: {
      bn: `# গতির সমীকরণের অঙ্ক

## কীভাবে চিনবে
- প্রশ্নে আদিবেগ, শেষবেগ, ত্বরণ, সময় বা দূরত্বের মধ্যে তিনটি দেওয়া থাকে, চতুর্থটি চাওয়া হয়।
- "স্থির অবস্থা থেকে", "থেমে গেল", "ছেড়ে দেওয়া হলো" এমন শব্দ থাকে।

## ধাপগুলো
1. জানা রাশিগুলো লেখো: $u$, $v$, $a$, $t$, $s$।
2. লুকানো মান খোঁজো: "স্থির অবস্থা থেকে" মানে $u = 0$, "থেমে গেল" মানে $v = 0$, "ছেড়ে দেওয়া" মানে $u = 0$ ও $a = g$।
3. এককগুলো SI তে আনো। $\\text{km/h}$ কে $\\text{m/s}$ করতে $\\times \\frac{5}{18}$।
4. যে রাশি জানা নেই এবং চাওয়াও হয়নি, সেটা যে সমীকরণে নেই সেটা বেছে নাও:
   - $s$ নেই: $v = u + at$
   - $v$ নেই: $s = ut + \\frac{1}{2}at^2$
   - $t$ নেই: $v^2 = u^2 + 2as$
5. মান বসাও, একক লিখে উত্তর দাও।
6. সময় থাকলে অন্য একটি সমীকরণ দিয়ে যাচাই করো।

## সাধারণ ভুল
- $\\text{km/h}$ থেকে $\\text{m/s}$ এ না নিয়েই হিসাব করা।
- বেগ কমলে ত্বরণের ঋণাত্মক চিহ্ন বাদ দেওয়া।
- দুই ধাপের গতিতে (প্রথমে ত্বরণ, পরে সুষম বেগ) পুরো সময়ে একটাই সমীকরণ লাগানো। প্রতিটি ধাপ আলাদা করে হিসাব করো।

## পাঠের লিংক
সমীকরণগুলো কোথা থেকে এল মনে না থাকলে "গতি" পাঠটি আবার দেখো।`,
      en: `# Equations of motion problems

## Spot it
- Three of initial velocity, final velocity, acceleration, time and distance are given; a fourth is asked for.
- Words like "from rest", "comes to a stop" or "is dropped" appear.

## Steps
1. List what you know: $u$, $v$, $a$, $t$, $s$.
2. Find the hidden values: "from rest" means $u = 0$, "stops" means $v = 0$, "dropped" means $u = 0$ and $a = g$.
3. Put everything in SI units. To turn $\\text{km/h}$ into $\\text{m/s}$, multiply by $\\frac{5}{18}$.
4. Pick the equation without the quantity you neither know nor need:
   - no $s$: $v = u + at$
   - no $v$: $s = ut + \\frac{1}{2}at^2$
   - no $t$: $v^2 = u^2 + 2as$
5. Substitute and give the answer with its unit.
6. If there is time, check with another equation.

## Common trap
- Working in $\\text{km/h}$ without converting to $\\text{m/s}$.
- Dropping the minus sign on acceleration when the object slows down.
- Using one equation across a two-stage trip (speeding up, then steady). Work each stage separately.

## Lesson link
If you are not sure where the equations come from, replay the lesson "Motion".`,
    },
  },
]
