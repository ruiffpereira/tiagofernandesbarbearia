/**
 * Injeta o script do Umami (auto-hospedado, cookieless).
 *
 * Pede à API o par {websiteId, src} do tenant deste site (pelo site token, que o
 * axiosClient já põe em todos os pedidos). Sem site no Umami a API devolve 204 e
 * não se injecta nada — basta definir o domínio no Backoffice → Estatísticas
 * para começar a medir, sem novo deploy.
 * Não rastreia em localhost. Cookieless → sem banner de consentimento.
 */
import { getWebsitesAnalyticsTracking } from '../servers/analytics/clients/getWebsitesAnalyticsTracking.ts'

export async function initUmami() {
  if (typeof document === 'undefined' || typeof window === 'undefined') return
  const host = window.location.hostname
  if (!host || host === 'localhost' || host === '127.0.0.1') return // dev → não rastreia
  if (document.querySelector('script[data-website-id]')) return // evita duplicação

  try {
    const tracking = await getWebsitesAnalyticsTracking()
    if (!tracking?.websiteId || !tracking?.src) return // 204 → tenant sem Umami

    const script = document.createElement('script')
    script.defer = true
    script.src = tracking.src
    script.dataset.websiteId = tracking.websiteId
    document.head.appendChild(script)
  } catch {
    // Sem estatísticas nesta visita — o site funciona na mesma.
  }
}
