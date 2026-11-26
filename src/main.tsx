import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n'
import App from './App'
import { applyTheme, usePrefs } from './state/prefs'
import { startAuthAndSync } from './state/auth'
import { refreshIndex } from './content/repo'

void usePrefs // keep prefs module (and its theme listener) loaded
try {
  const t = localStorage.getItem('alo.theme')
  applyTheme(t === 'light' || t === 'dark' ? t : 'system')
} catch { /* ignore */ }

// Start fetching the first screen's chunk now rather than after the router decides,
// which otherwise costs a round trip on a slow phone connection.
const first = location.pathname
if (first === '/' || first === '/welcome') void import('./pages/Welcome')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

startAuthAndSync()

// Keep the content cache (subjects, chapters, exam dates) fresh whenever we're online.
const refresh = () => { if (navigator.onLine) refreshIndex().catch(() => { /* try again later */ }) }
refresh()
window.addEventListener('online', refresh)
