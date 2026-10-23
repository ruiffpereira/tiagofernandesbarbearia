// Login com Google: começa por navegação do browser, regressa a /entrar/google com ?code=
import { API_BASE_URL } from './env.js'

const STORE_KEY = 'btf_google_login'
export const GOOGLE_RETURN_PATH = '/entrar/google'

// Só caminhos internos — nunca um host vindo de fora
function safePath(p) {
  return typeof p === 'string' && p.startsWith('/') && !p.startsWith('//') && !p.startsWith('/\\') ? p : '/'
}

function randomState() {
  const bytes = new Uint8Array(24)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('') // [0-9a-f]{48}
}

export function startGoogleLogin() {
  const state = randomState()
  const returnTo = safePath(window.location.pathname + window.location.search)
  sessionStorage.setItem(STORE_KEY, JSON.stringify({ state, returnTo }))
  const base = API_BASE_URL
  const params = new URLSearchParams({
    return_to: window.location.origin + GOOGLE_RETURN_PATH,
    client_state: state,
  })
  window.location.assign(`${base}/websites/customers/google/start?${params}`)
}

export function readGoogleStore() {
  try {
    const s = JSON.parse(sessionStorage.getItem(STORE_KEY) || 'null')
    return s && typeof s.state === 'string' ? { state: s.state, returnTo: safePath(s.returnTo) } : null
  } catch { return null }
}

export function clearGoogleStore() {
  sessionStorage.removeItem(STORE_KEY)
}

export function isStandalone() {
  return window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true
}
