import { it, expect } from 'vitest'
import { normaliseBdPhone } from './auth'

it('normalises Bangladeshi phone numbers, including Bangla digits', () => {
  expect(normaliseBdPhone('01712345678')).toBe('+8801712345678')
  expect(normaliseBdPhone('০১৭১২৩৪৫৬৭৮')).toBe('+8801712345678')
  expect(normaliseBdPhone('+880 1712-345678')).toBe('+8801712345678')
  expect(normaliseBdPhone('01212345678')).toBeNull()
  expect(normaliseBdPhone('0171234567')).toBeNull()
})
