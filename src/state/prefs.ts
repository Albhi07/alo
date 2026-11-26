import { useSyncExternalStore } from 'react'

/** Small per-device preferences, kept in localStorage so they apply before first paint. */
export type Theme = 'light' | 'dark' | 'system'
interface Prefs { theme: Theme; dataSaver: boolean }

const KEY = { theme: 'alo.theme', dataSaver: 'alo.dataSaver' }
const listeners = new Set<() => void>()

function read(): Prefs {
  try {
    const t = localStorage.getItem(KEY.theme)
    return {
      theme: t === 'light' || t === 'dark' ? t : 'system',
      dataSaver: localStorage.getItem(KEY.dataSaver) === '1',
    }
  } catch {
    return { theme: 'system', dataSaver: false }
  }
}

let snapshot = read()

function emit() {
  snapshot = read()
  applyTheme(snapshot.theme)
  listeners.forEach((l) => l())
}

export function applyTheme(theme: Theme) {
  const dark = theme === 'system' ? matchMedia('(prefers-color-scheme: dark)').matches : theme === 'dark'
  document.documentElement.classList.toggle('dark', dark)
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#0b1224' : '#14213d')
}

export function setTheme(theme: Theme) {
  try {
    if (theme === 'system') localStorage.removeItem(KEY.theme)
    else localStorage.setItem(KEY.theme, theme)
  } catch { /* ignore */ }
  emit()
}

export function setDataSaver(on: boolean) {
  try { localStorage.setItem(KEY.dataSaver, on ? '1' : '0') } catch { /* ignore */ }
  emit()
}

export function usePrefs(): Prefs {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb) },
    () => snapshot,
  )
}

matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => {
  if (snapshot.theme === 'system') applyTheme('system')
})
