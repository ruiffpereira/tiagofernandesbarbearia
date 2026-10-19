// Web Push do cliente — carregado pelo service worker do Workbox (importScripts).
self.addEventListener('push', (event) => {
  if (!event.data) return
  let p = {}
  try { p = event.data.json() } catch { p = { title: event.data.text() } }

  event.waitUntil((async () => {
    // suppressWhenFocused: com o site visível já há contador/painel, não mostra a do sistema.
    if (p.suppressWhenFocused) {
      const wins = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      if (wins.some((c) => c.visibilityState === 'visible')) return
    }
    // Respostas do chat (tag "chat:<id>") abrem o site com o chat aberto.
    const isChat = typeof p.tag === 'string' && p.tag.startsWith('chat:')
    await self.registration.showNotification(p.title || 'Tiago Barbeiro', {
      body: p.body || '',
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      tag: p.tag || 'default',
      renotify: true,
      data: { url: isChat ? '/?chat=1' : (p.url || '/') },
    })
  })())
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = new URL(event.notification.data?.url || '/', self.location.origin).href
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((wins) => {
      for (const c of wins) {
        if (c.url.startsWith(self.location.origin) && 'focus' in c) {
          return c.navigate(url).then((nc) => (nc || c).focus())
        }
      }
      return self.clients.openWindow(url)
    }),
  )
})
