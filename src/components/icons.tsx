// Inline stroke icons (24px grid). Decorative: always paired with a visible text label.
const P = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const
type I = { className?: string }
const svg = (d: React.ReactNode) => ({ className }: I) => (
  <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden className={className} {...P}>{d}</svg>
)
export const HomeIcon = svg(<><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /><path d="M10 21v-6h4v6" /></>)
export const BookIcon = svg(<><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5z" /><path d="M4 19.5V4.5" /><path d="M8 7h8" /></>)
export const ExamIcon = svg(<><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 3v2h6V3" /><path d="m9 13 2 2 4-4" /></>)
export const FocusIcon = svg(<><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2.5 2" /><path d="M9 2h6" /></>)
export const TutorIcon = svg(<><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-4.6A8 8 0 1 1 21 12z" /><path d="M9 11h.01M12 11h.01M15 11h.01" /></>)
export const GearIcon = svg(<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></>)
export const OfflineIcon = svg(<><path d="M2 8.8a15 15 0 0 1 4.2-2.6M22 8.8A15 15 0 0 0 10.7 5" /><path d="M5 12.5a10 10 0 0 1 5.2-2.4M19 12.5a10 10 0 0 0-2.1-1.5" /><path d="M8.5 16a5 5 0 0 1 7 0" /><path d="M12 20h.01" /><path d="m3 3 18 18" /></>)
export const FlameIcon = svg(<path d="M12 22c4 0 7-2.7 7-7 0-4-3-6.5-4-10-2 2-2.5 4-2.5 5.5C11 9 10 7.5 10 6c-3 2.5-5 5.5-5 9 0 4.3 3 7 7 7z" />)
export const BackIcon = svg(<path d="M15 18 9 12l6-6" />)
