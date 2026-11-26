import type { MethodSheetSrc } from '../../types'

export const methodSheets: MethodSheetSrc[] = [
  {
    key: 'ms-reciprocal',
    question_type: 'x_plus_reciprocal',
    body: {
      bn: `# $x + \\frac{1}{x}$ ধরনের প্রশ্ন

## কীভাবে চিনবে
- প্রশ্নে $x + \\frac{1}{x}$ বা $x - \\frac{1}{x}$ এর মান দেওয়া থাকে।
- চাওয়া হয় $x^2 + \\frac{1}{x^2}$, $x^3 + \\frac{1}{x^3}$, $x^4 + \\frac{1}{x^4}$ ইত্যাদি।

## ধাপগুলো
1. মনে রাখো $x \\cdot \\frac{1}{x} = 1$। তাই সূত্রে $ab$ এর জায়গায় সবসময় $1$।
2. বর্গ: $x^2 + \\frac{1}{x^2} = (x + \\frac{1}{x})^2 - 2$
3. বিয়োগের বর্গ: $(x - \\frac{1}{x})^2 = (x + \\frac{1}{x})^2 - 4$
4. ঘন: $x^3 + \\frac{1}{x^3} = (x + \\frac{1}{x})^3 - 3(x + \\frac{1}{x})$
5. চতুর্থ ঘাত: $x^4 + \\frac{1}{x^4} = (x^2 + \\frac{1}{x^2})^2 - 2$
6. প্রতিটি ধাপে আগের ধাপের উত্তর কাজে লাগাও। সৃজনশীলে (ঘ) অংশ প্রায়ই (ক), (খ), (গ) এর উত্তর দিয়ে তৈরি।

## সাধারণ ভুল
- $-2$ এর বদলে $-2x$ লেখা। $2 \\cdot x \\cdot \\frac{1}{x}$ এ $x$ কেটে যায়।
- ঘনের সূত্রে শেষে $-3(x + \\frac{1}{x})$ এর বদলে শুধু $-3$ লেখা।

## পাঠের লিংক
বর্গের সূত্র না মনে থাকলে "বর্গের দুটি সূত্র" পাঠটি আবার দেখো।`,
      en: `# Questions on $x + \\frac{1}{x}$

## Spot it
- The question gives the value of $x + \\frac{1}{x}$ or $x - \\frac{1}{x}$.
- It asks for $x^2 + \\frac{1}{x^2}$, $x^3 + \\frac{1}{x^3}$, $x^4 + \\frac{1}{x^4}$ and so on.

## Steps
1. Remember $x \\cdot \\frac{1}{x} = 1$, so $ab$ in every formula is $1$.
2. Square: $x^2 + \\frac{1}{x^2} = (x + \\frac{1}{x})^2 - 2$
3. Square of difference: $(x - \\frac{1}{x})^2 = (x + \\frac{1}{x})^2 - 4$
4. Cube: $x^3 + \\frac{1}{x^3} = (x + \\frac{1}{x})^3 - 3(x + \\frac{1}{x})$
5. Fourth power: $x^4 + \\frac{1}{x^4} = (x^2 + \\frac{1}{x^2})^2 - 2$
6. Reuse each answer in the next step. In creative questions, part (d) is often built from (a), (b) and (c).

## Common trap
- Writing $-2x$ instead of $-2$. In $2 \\cdot x \\cdot \\frac{1}{x}$ the $x$ cancels.
- In the cube formula, writing only $-3$ instead of $-3(x + \\frac{1}{x})$.

## Lesson link
If the square formulas feel shaky, replay the lesson "Two square formulas".`,
    },
  },
]
