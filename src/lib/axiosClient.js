import axios from 'axios'
import { axiosInstance } from '@kubb/plugin-client/clients/axios'
import { getCsrfToken } from '../servers/customers/clients/getCsrfToken.ts'
import { postWebsitesCustomersAutenticationRefresh } from '../servers/customers/clients/postWebsitesCustomersAutenticationRefresh.ts'
import { tokenStore } from './api.js'

const SITE_TOKEN = import.meta.env.VITE_SITE_TOKEN ?? ''

axiosInstance.defaults.baseURL = import.meta.env.VITE_API_BASE_URL
axiosInstance.defaults.withCredentials = true
axios.defaults.withCredentials = true

let refreshing = null

const AUTH_ENDPOINTS = [
  '/autentication/login',
  '/autentication/register',
  '/autentication/refresh',
  '/autentication/logout',
  '/csrf-token',
]

function isAuthEndpoint(url) {
  return AUTH_ENDPOINTS.some((endpoint) => url?.includes(endpoint))
}

async function getCsrfHeader() {
  const { csrfToken } = await getCsrfToken()
  return csrfToken ? { 'x-csrf-token': csrfToken } : {}
}

const requestInterceptor = (config) => {
  config.headers = config.headers ?? {}
  if (SITE_TOKEN) config.headers['X-Site-Token'] = SITE_TOKEN
  if (!config.headers.Authorization && !isAuthEndpoint(config.url)) {
    const token = tokenStore.getAccess()
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  config.withCredentials = true
  return config
}

function dispatchSessionExpired() {
  window.dispatchEvent(new CustomEvent('auth:session-expired'))
}

const responseErrorInterceptor = async (error) => {
  const original = error.config

  if (error.response?.status === 401 && original && !original._retry && !isAuthEndpoint(original.url)) {
    original._retry = true

    if (!refreshing) {
      refreshing = getCsrfHeader()
        .then((headers) =>
          postWebsitesCustomersAutenticationRefresh({ headers }),
        )
        .then((data) => {
          if (!data?.accessToken) throw new Error('Refresh sem accessToken')
          tokenStore.saveAccess(data.accessToken)
          return data.accessToken
        })
        .catch((refreshError) => {
          tokenStore.clear()
          dispatchSessionExpired()
          return Promise.reject(refreshError)
        })
        .finally(() => {
          refreshing = null
        })
    }

    try {
      const token = await refreshing
      original.headers = original.headers ?? {}
      original.headers.Authorization = `Bearer ${token}`
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
