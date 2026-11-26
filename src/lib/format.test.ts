import { describe, it, expect } from 'vitest'
import { toBnDigits, fromBnDigits, formatDate, formatClock, formatNumber, daysBetween, parseDay } from './format'

describe('format', () => {
  it('converts digits both ways', () => {
    expect(toBnDigits('2027-03-14')).toBe('২০২৭-০৩-১৪')
    expect(fromBnDigits('১২৩')).toBe('123')
  })
  it('formats dates with Bangla month names', () => {
    expect(formatDate('2027-03-14', 'bn')).toBe('১৪ মার্চ ২০২৭')
    expect(formatDate('2027-03-14', 'en')).toBe('14 March 2027')
    expect(formatDate('2027-03-14', 'bn', { weekday: true })).toBe('রবিবার, ১৪ মার্চ ২০২৭')
  })
  it('formats timers', () => {
    expect(formatClock(30 * 60, 'bn')).toBe('৩০:০০')
    expect(formatClock(2.5 * 3600, 'en')).toBe('2:30:00')
  })
  it('uses lakh grouping', () => {
    expect(formatNumber(1234567, 'en')).toBe('12,34,567')
    expect(formatNumber(1234567, 'bn')).toBe('১২,৩৪,৫৬৭')
  })
  it('counts days across DST-free local dates', () => {
    expect(daysBetween(parseDay('2026-11-26'), parseDay('2027-03-14'))).toBe(108)
  })
})
