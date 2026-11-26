import { useEffect, useState } from 'react'

interface BIPEvent extends Event { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> }

let deferred: BIPEvent | null = null
const subs = new Set<() => void>()
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferred = e as BIPEvent
    subs.forEach((s) => s())
  })
  window.addEventListener('appinstalled', () => { deferred = null; subs.forEach((s) => s()) })
}

/** Android "Add to home screen" support via the deferred beforeinstallprompt event. */
export function useInstall() {
  const [, force] = useState(0)
  useEffect(() => {
    const s = () => force((x) => x + 1)
    subs.add(s)
    return () => { subs.delete(s) }
  }, [])
  const installed = typeof window !== 'undefined' && matchMedia('(display-mode: standalone)').matches
  return {
    installed,
    canInstall: !!deferred,
    install: async () => {
      if (!deferred) return
      await deferred.prompt()
      await deferred.userChoice
      deferred = null
      force((x) => x + 1)
    },
  }
}
