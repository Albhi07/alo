/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: 'rgb(var(--bg) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        ink: 'rgb(var(--ink) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        line: 'rgb(var(--line) / <alpha-value>)',
        navy: 'rgb(var(--navy) / <alpha-value>)',
        accent: 'rgb(var(--accent) / <alpha-value>)',
        'accent-ink': 'rgb(var(--accent-ink) / <alpha-value>)',
        science: 'rgb(var(--g-science) / <alpha-value>)',
        business: 'rgb(var(--g-business) / <alpha-value>)',
        humanities: 'rgb(var(--g-humanities) / <alpha-value>)',
        compulsory: 'rgb(var(--g-compulsory) / <alpha-value>)',
        danger: 'rgb(var(--danger) / <alpha-value>)',
        ok: 'rgb(var(--ok) / <alpha-value>)',
      },
      fontFamily: {
        ui: ['"Hind Siliguri"', 'system-ui', 'sans-serif'],
        read: ['"Noto Serif Bengali"', '"Hind Siliguri"', 'serif'],
      },
      minHeight: { tap: '48px' },
      minWidth: { tap: '48px' },
    },
  },
  plugins: [],
}
