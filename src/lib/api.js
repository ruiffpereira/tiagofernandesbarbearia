// Infra de tokens — usada pelo AuthContext e pelo axiosClient (interceptor).
// Todos os endpoints da API vêm de hooks Kubb gerados em src/servers/.

const TOKEN_KEY = 'btf_access_token'
const REFRESH_KEY = 'btf_refresh_token'
export const USER_KEY = 'btf_user'

export const tokenStore = {
  getAccess:  () => localStorage.getItem(TOKEN_KEY),
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
