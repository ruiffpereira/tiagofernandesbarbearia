// @refresh reset
import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { tokenStore, USER_KEY } from './lib/api.js'
import {
  usePostWebsitesCustomersAutenticationLogin,
  usePostWebsitesCustomersAutenticationRegister,
  usePostWebsitesCustomersAutenticationLogout,
  usePutWebsitesCustomersAutenticationProfile,
  usePostWebsitesCustomersAutenticationForgotPassword,
  usePostWebsitesCustomersAutenticationResetPassword,
  postWebsitesCustomersAutenticationRefresh,
} from './servers/customers/index.ts'

function getJwtExpiry(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp * 1000
  } catch { return 0 }
}

const USER_ID = import.meta.env.VITE_BARBER_USER_ID


const AuthContext = createContext(null)

function loadUser() {
  try {
    const s = localStorage.getItem(USER_KEY)
    return s ? JSON.parse(s) : null
  } catch { return null }
}

function toUser(data) {
  return {
    customerId: data.customerId,
    name: data.name,
    email: data.email,
    phone: data.contact,
    nif: data.nif ?? null,
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser)
  const isRefreshingRef = useRef(false)

  function persist(u) {
    if (u) localStorage.setItem(USER_KEY, JSON.stringify(u))
    else localStorage.removeItem(USER_KEY)
    setUser(u)
  }

  const loginM        = usePostWebsitesCustomersAutenticationLogin()
  const registerM     = usePostWebsitesCustomersAutenticationRegister()
  const logoutM       = usePostWebsitesCustomersAutenticationLogout()
  const updateM       = usePutWebsitesCustomersAutenticationProfile()
  const forgotM       = usePostWebsitesCustomersAutenticationForgotPassword()
  const resetM        = usePostWebsitesCustomersAutenticationResetPassword()

  const tryRefreshNow = useCallback(async () => {
    if (isRefreshingRef.current) return
    const access = tokenStore.getAccess()
    const refresh = tokenStore.getRefresh()
    if (!access || !refresh) return
    const expiry = getJwtExpiry(access)
    if (expiry - Date.now() > 90_000) return

    isRefreshingRef.current = true
    try {
      const data = await postWebsitesCustomersAutenticationRefresh({ refreshToken: refresh })
      if (data?.accessToken) {
        tokenStore.save(data.accessToken, data.refreshToken ?? refresh)
      }
    } catch {
      tokenStore.clear()
      persist(null)
    } finally {
      isRefreshingRef.current = false
    }
  }, [])

  useEffect(() => {
    function onSessionExpired() {
      tokenStore.clear()
      persist(null)
    }
    window.addEventListener('auth:session-expired', onSessionExpired)
    return () => window.removeEventListener('auth:session-expired', onSessionExpired)
  }, [])

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') tryRefreshNow()
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [tryRefreshNow])

  const login = useCallback(async (email, password) => {
    const data = await loginM.mutateAsync({
      data: { userId: USER_ID, provider: 'credentials', email, password },
    })
    tokenStore.save(data.accessToken, data.refreshToken)
    const u = toUser(data)
    persist(u)
    return u
  }, [loginM])

  const register = useCallback(async (name, email, phone, password) => {
    await registerM.mutateAsync({
      data: { userId: USER_ID, name, email, contact: phone, password },
    })
    // register returns 201 — auto-login a seguir
    const data = await loginM.mutateAsync({
      data: { userId: USER_ID, provider: 'credentials', email, password },
    })
    tokenStore.save(data.accessToken, data.refreshToken)
    const u = toUser(data)
    persist(u)
    return u
  }, [registerM, loginM])

  const logout = useCallback(async () => {
    await logoutM.mutateAsync({}).catch(() => {})
    tokenStore.clear()
    persist(null)
  }, [logoutM])

  const updateProfile = useCallback(async ({ name, email, phone, nif }) => {
    if (!user) return
    const data = await updateM.mutateAsync({
      data: { name, email, contact: phone, nif },
    })
    const u = toUser(data)
    persist(u)
    return u
  }, [user, updateM])

  const forgotPassword = useCallback(async (email) => {
    await forgotM.mutateAsync({ data: { email, userId: USER_ID } })
  }, [forgotM])

  const resetPassword = useCallback(async (token, newPassword) => {
    await resetM.mutateAsync({ data: { token, newPassword } })
  }, [resetM])

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile, forgotPassword, resetPassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
