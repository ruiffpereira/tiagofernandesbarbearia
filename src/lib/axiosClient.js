import axios from 'axios'
import { axiosInstance } from '@kubb/plugin-client/clients/axios'
import { postWebsitesCustomersAutenticationRefresh } from '../servers/customers/clients/postWebsitesCustomersAutenticationRefresh.ts'
import { USER_KEY } from './api.js'

const SITE_TOKEN = import.meta.env.VITE_SITE_TOKEN ?? ''

axiosInstance.defaults.baseURL = import.meta.env.VITE_API_BASE_URL
axiosInstance.defaults.withCredentials = true
axios.defaults.withCredentials = true

let refreshing = null

const requestInterceptor = (config) => {
  if (SITE_TOKEN) config.headers['X-Site-Token'] = SITE_TOKEN
  config.withCredentials = true
  return config
}

function dispatchSessionExpired() {
  window.dispatchEvent(new CustomEvent('auth:session-expired'))
}

const AUTH_ENDPOINTS = [
  '/autentication/login',
  '/autentication/register',
  '/autentication/refresh',
  '/autentication/logout',
]

const responseErrorInterceptor = async (error) => {
  const original = error.config
  const isAuthEndpoint = AUTH_ENDPOINTS.some((e) => original?.url?.includes(e))

  if (error.response?.status === 401 && original && !original._retry && !isAuthEndpoint) {
    original._retry = true

    if (!refreshing) {
      refreshing = postWebsitesCustomersAutenticationRefresh()
        .catch(() => {
          localStorage.removeItem(USER_KEY)
          dispatchSessionExpired()
          return Promise.reject(new Error('Sessao expirada'))
        })
        .finally(() => {
          refreshing = null
        })
    }

    try {
      await refreshing
      original.withCredentials = true
      return axiosInstance(original)
    } catch {
      return Promise.reject(error)
    }
  }

  return Promise.reject(error)
}

axiosInstance.interceptors.request.use(requestInterceptor)
axiosInstance.interceptors.response.use((r) => r, responseErrorInterceptor)
