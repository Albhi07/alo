// Web push for exam reminders. Imported by the generated service worker (see vite.config.ts).
self.addEventListener('push', (event) => {
  let data = {}
  try { data = event.data ? event.data.json() : {} } catch { data = { title: event.data && event.data.text() } }
  const title = data.title || 'আলো'
  event.waitUntil(self.registration.showNotification(title, {
    body: data.body || '',
    icon: 'pwa-192.png',
    badge: 'pwa-192.png',
    lang: data.lang || 'bn',
    tag: data.tag || 'alo-reminder',
    data: { url: data.url || './notices' },
  }))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = new URL(event.notification.data && event.notification.data.url || './', self.registration.scope).href
  event.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
    for (const c of all) if (c.url.startsWith(self.registration.scope)) { await c.focus(); return c.navigate(url) }
    return self.clients.openWindow(url)
  })())
})
