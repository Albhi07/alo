import { describe, it, expect } from 'vitest'
import i18n from './index'
import bn from './bn.json'
import en from './en.json'

function keys(o: object, p = ''): string[] {
  return Object.entries(o).flatMap(([k, v]) => (typeof v === 'object' ? keys(v, `${p}${k}.`) : [`${p}${k}`]))
}

describe('i18n', () => {
  it('bn and en have identical keys', () => {
    expect(keys(bn).sort()).toEqual(keys(en).sort())
  })
  it('interpolates numbers with the right digits', async () => {
    await i18n.changeLanguage('bn')
    expect(i18n.t('home.daysToFirst', { count: 108 })).toBe('প্রথম পরীক্ষার আর ১০৮ দিন')
    expect(i18n.t('onb.step', { n: 3, total: 6 })).toBe('ধাপ ৩ / ৬')
    await i18n.changeLanguage('en')
    expect(i18n.t('home.daysToFirst', { count: 1 })).toBe('1 day to your first paper')
    expect(i18n.t('home.daysToFirst', { count: 108 })).toBe('108 days to your first paper')
  })
})
