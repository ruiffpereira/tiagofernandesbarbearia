import axios from 'axios'
import { axiosInstance } from '@kubb/plugin-client/clients/axios'

const TOKEN_KEY = 'btf_access_token'
const REFRESH_KEY = 'btf_refresh_token'

axiosInstance.defaults.baseURL = import.meta.env.VITE_API_BASE_URL

let refreshing = null

const requestInterceptor = (config) => {
  if (!config.headers.Authorization) {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
}

function dispatchSessionExpired() {
  window.dispatchEvent(new CustomEvent('auth:session-expired'))
}

const responseErrorInterceptor = async (error) => {
  const original = error.config
  if (error.response?.status === 401 && !original._retry) {
    const refreshToken = localStorage.getItem(REFRESH_KEY)
    if (!refreshToken) {
      dispatchSessionExpired()
      return Promise.reject(error)
    }
    original._retry = true
    if (!refreshing) {
      refreshing = axiosInstance
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
          dispatchSessionExpired()
          return Promise.reject(new Error('Sessão expirada'))
        })
        .finally(() => { refreshing = null })
    }
    try {
      const newToken = await refreshing
      original.headers.Authorization = `Bearer ${newToken}`
      return axiosInstance(original)
    } catch {
      return Promise.reject(error)
    }
  }
  return Promise.reject(error)
}

axiosInstance.interceptors.request.use(requestInterceptor)
axiosInstance.interceptors.response.use((r) => r, responseErrorInterceptor)
