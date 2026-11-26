import i18n from 'i18next'
import { initReactI18next, useTranslation } from 'react-i18next'
import bn from './bn.json'
import en from './en.json'
import type { Lang } from '../data/catalog'
import { digits, formatDate, formatNumber, formatClock } from '../lib/format'

const LANG_KEY = 'alo.lang'

function initialLang(): Lang {
  try {
    const saved = localStorage.getItem(LANG_KEY)
    if (saved === 'bn' || saved === 'en') return saved
  } catch { /* storage blocked */ }
  return 'bn'
}

// Every translated string follows the UI language's digit style (০-৯ in Bangla).
const digitStyle = {
  type: 'postProcessor' as const,
  name: 'digitStyle',
  process: (value: string, _key: string | string[], _opts: unknown, translator: { language?: string }) =>
    translator.language === 'bn' ? digits(value, 'bn') : value,
}

i18n.use(digitStyle).use(initReactI18next).init({
  postProcess: ['digitStyle'],
  resources: { bn: { translation: bn }, en: { translation: en } },
  lng: initialLang(),
  fallbackLng: 'bn',
  interpolation: {
    escapeValue: false,
  },
  returnNull: false,
})

function applyDocLang(lng: string) {
  document.documentElement.lang = lng
}
applyDocLang(i18n.language)
i18n.on('languageChanged', (lng) => {
  applyDocLang(lng)
  try { localStorage.setItem(LANG_KEY, lng) } catch { /* ignore */ }
})

export function setLanguage(lang: Lang) {
  return i18n.changeLanguage(lang)
}

/** Translation plus language-aware number/date helpers. */
export function useT() {
  const { t, i18n: inst } = useTranslation()
  const lang = (inst.language === 'en' ? 'en' : 'bn') as Lang
  return {
    t,
    lang,
    n: (v: number | string) => digits(v, lang),
    num: (v: number, frac = 0) => formatNumber(v, lang, frac),
    date: (d: Date | string, o?: { year?: boolean; weekday?: boolean }) => formatDate(d, lang, o),
    clock: (s: number) => formatClock(s, lang),
  }
}

export default i18n
