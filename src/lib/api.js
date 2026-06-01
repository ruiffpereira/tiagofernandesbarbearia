// Auth layer — login/register/logout para clientes do site público.
// O token SITE_KEY é usado para identificar este site junto da API.
// Tudo o resto (booking, slots, etc.) vai pelos hooks Kubb em src/servers/booking/.

const BASE = import.meta.env.VITE_API_BASE_URL
const SITE_KEY = import.meta.env.VITE_SITE_KEY

const TOKEN_KEY = 'btf_access_token'
const REFRESH_KEY = 'btf_refresh_token'
export const USER_KEY = 'btf_user'

export const tokenStore = {
  getAccess: () => localStorage.getItem(TOKEN_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),
  save: (access, refresh) => {
    localStorage.setItem(TOKEN_KEY, access)
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh)
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_KEY)
    localStorage.removeItem(USER_KEY)
  },
}

async function siteRequest(url, options = {}) {
  if (!SITE_KEY) throw new Error('VITE_SITE_KEY não configurado no .env')
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${SITE_KEY}`, ...options.headers }
  const res = await fetch(`${BASE}${url}`, { ...options, headers })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `HTTP ${res.status}`)
  }
  return res.json()
}

export const auth = {
  register: (name, email, phone, password) =>
    siteRequest('/websites/customers/autentication/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, contact: phone, password }),
    }),

  login: (email, password) =>
    siteRequest('/websites/customers/autentication/login', {
      method: 'POST',
      body: JSON.stringify({ provider: 'credentials', email, password }),
    }),

  logout: async () => {
    const refreshToken = tokenStore.getRefresh()
    if (refreshToken) {
      await fetch(`${BASE}/websites/customers/autentication/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      }).catch(() => {})
    }
    tokenStore.clear()
  },
}
