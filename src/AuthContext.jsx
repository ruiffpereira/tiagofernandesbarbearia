// @refresh reset
import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { tokenStore, USER_KEY } from './lib/api.js'
import {
  usePostWebsitesCustomersAutenticationLogin,
  usePostWebsitesCustomersAutenticationRegister,
  usePostWebsitesCustomersAutenticationLogout,
  usePutWebsitesCustomersAutenticationProfile,
} from './servers/customers/index.ts'

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

  function persist(u) {
    if (u) localStorage.setItem(USER_KEY, JSON.stringify(u))
    else localStorage.removeItem(USER_KEY)
    setUser(u)
  }

  const loginM    = usePostWebsitesCustomersAutenticationLogin()
  const registerM = usePostWebsitesCustomersAutenticationRegister()
  const logoutM   = usePostWebsitesCustomersAutenticationLogout()
  const updateM   = usePutWebsitesCustomersAutenticationProfile()

  useEffect(() => {
    function onSessionExpired() {
      tokenStore.clear()
      persist(null)
    }
    window.addEventListener('auth:session-expired', onSessionExpired)
    return () => window.removeEventListener('auth:session-expired', onSessionExpired)
  }, [])

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

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
