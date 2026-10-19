import {
  getWebsitesNotificationsPushVapidPublicKey,
  postWebsitesNotificationsPushSubscribe,
} from '../servers/customers/index.ts'

// Web Push do cliente com conta (cliente gerado pelo Kubb).
function b64ToUint8(b64) {
  const pad = '='.repeat((4 - (b64.length % 4)) % 4)
  const raw = atob((b64 + pad).replace(/-/g, '+').replace(/_/g, '/'))
  return Uint8Array.from(raw, (c) => c.charCodeAt(0))
}

export const pushSupported = () =>
  typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window

// Pede permissão (só se `ask`) e regista a subscrição no cliente atual.
// Devolve true se ficou subscrito. Nunca lança.
export async function enablePush({ ask = false } = {}) {
  try {
    if (!pushSupported()) return false
    if (Notification.permission === 'denied') return false
    if (Notification.permission === 'default') {
      if (!ask) return false
      if ((await Notification.requestPermission()) !== 'granted') return false
    }
    const reg = await navigator.serviceWorker.ready
    const data = await getWebsitesNotificationsPushVapidPublicKey()
    if (!data?.publicKey) return false
    const sub =
      (await reg.pushManager.getSubscription()) ||
      (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToUint8(data.publicKey) }))
    const json = sub.toJSON()
    await postWebsitesNotificationsPushSubscribe({ endpoint: json.endpoint, keys: json.keys })
    return true
  } catch {
    return false
  }
}
