import axios from 'axios'

const TOKEN_KEY = 'btf_access_token'
const REFRESH_KEY = 'btf_refresh_token'

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL

let refreshing = null

// Injeta token automaticamente em todos os pedidos Kubb
axios.interceptors.request.use((config) => {
  if (!config.headers.Authorization) {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Renova o token em caso de 401 e repete o pedido original
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      const refreshToken = localStorage.getItem(REFRESH_KEY)
      if (!refreshToken) return Promise.reject(error)
      original._retry = true
      if (!refreshing) {
        refreshing = axios
          .post('/websites/customers/autentication/refresh', { refreshToken })
          .then(({ data }) => {
            localStorage.setItem(TOKEN_KEY, data.accessToken)
            if (data.refreshToken) localStorage.setItem(REFRESH_KEY, data.refreshToken)
            return data.accessToken
          })
          .catch(() => {
            localStorage.removeItem(TOKEN_KEY)
            localStorage.removeItem(REFRESH_KEY)
            localStorage.removeItem('btf_user')
            return Promise.reject(new Error('Sessão expirada'))
          })
          .finally(() => { refreshing = null })
      }
      try {
        const newToken = await refreshing
        original.headers.Authorization = `Bearer ${newToken}`
        return axios(original)
      } catch {
        return Promise.reject(error)
      }
    }
    return Promise.reject(error)
  }
)
