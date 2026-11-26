import type { DrillSrc } from '../../types'

export const drills: DrillSrc[] = [
  {
    key: 'drill-uniform-acceleration',
    title: { bn: 'সমত্বরণে শেষ বেগ ও দূরত্ব', en: 'Final velocity and distance under uniform acceleration' },
    vars: { u: { min: 0, max: 20 }, a: { min: 1, max: 5 }, t: { min: 2, max: 10 } },
    constraints: [],
    script: {
      derived: { v: 'u + a*t', s: 'u*t + a*t^2/2' },
      question: {
        bn: 'একটি বাস ${{u}}\\,\\text{m/s}$ বেগে চলছিল। চালক এক্সেলারেটর চাপায় বাসটি ${{a}}\\,\\text{m/s}^2$ সমত্বরণে আরও ${{t}}\\,\\text{s}$ চলল। (ক) শেষ বেগ কত? (খ) এই সময়ে কত দূরত্ব গেল?',
        en: 'A bus is moving at ${{u}}\\,\\text{m/s}$. The driver accelerates uniformly at ${{a}}\\,\\text{m/s}^2$ for ${{t}}\\,\\text{s}$. (a) What is the final velocity? (b) How far does it go in this time?',
      },
      answers: [
        { label: { bn: 'শেষ বেগ $v$', en: 'Final velocity $v$' }, expr: 'v', unit: { bn: 'm/s', en: 'm/s' } },
        { label: { bn: 'দূরত্ব $s$', en: 'Distance $s$' }, expr: 's', unit: { bn: 'm', en: 'm' }, tolerance: 0.01 },
      ],
      steps: [
        { bn: 'যা জানা আছে: আদি বেগ $u = {{u}}$ m/s, ত্বরণ $a = {{a}}$ m/s², সময় $t = {{t}}$ s।', en: 'Known: initial velocity $u = {{u}}$ m/s, acceleration $a = {{a}}$ m/s², time $t = {{t}}$ s.' },
        { bn: 'শেষ বেগ: $v = u + at = {{u}} + {{a}} \\times {{t}} = {{v}}$ m/s', en: 'Final velocity: $v = u + at = {{u}} + {{a}} \\times {{t}} = {{v}}$ m/s' },
        { bn: 'দূরত্ব: $s = ut + \\frac{1}{2}at^2 = {{u}} \\times {{t}} + \\frac{1}{2} \\times {{a}} \\times {{t}}^2 = {{u*t}} + {{a*t^2/2}} = {{s}}$ m', en: 'Distance: $s = ut + \\frac{1}{2}at^2 = {{u}} \\times {{t}} + \\frac{1}{2} \\times {{a}} \\times {{t}}^2 = {{u*t}} + {{a*t^2/2}} = {{s}}$ m' },
        { bn: 'যাচাই: গড় বেগ $\\frac{u + v}{2} \\times t$ দিয়েও একই দূরত্ব পাওয়া যায়।', en: 'Check: average velocity $\\frac{u + v}{2} \\times t$ gives the same distance.' },
      ],
    },
  },
]
