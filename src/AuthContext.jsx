// @refresh reset
import { createContext, useContext, useState, useCallback } from 'react'
import { auth, tokenStore, USER_KEY } from './lib/api.js'

const AuthContext = createContext(null)

function loadUser() {
  try {
    const s = localStorage.getItem(USER_KEY)
    return s ? JSON.parse(s) : null
  } catch { return null }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser)

  function persist(u) {
    if (u) localStorage.setItem(USER_KEY, JSON.stringify(u))
    else localStorage.removeItem(USER_KEY)
    setUser(u)
  }

  const login = useCallback(async (email, password) => {
    const data = await auth.login(email, password)
    // data: { customerId, name, email, contact, accessToken, refreshToken }
    tokenStore.save(data.accessToken, data.refreshToken)
    const u = { customerId: data.customerId, name: data.name, email: data.email, phone: data.contact }
    persist(u)
    return u
  }, [])

  const register = useCallback(async (name, email, phone, password) => {
    await auth.register(name, email, phone, password)
    // register returns 201 "Customer registered successfully" — then auto-login
    const data = await auth.login(email, password)
    tokenStore.save(data.accessToken, data.refreshToken)
    const u = { customerId: data.customerId, name: data.name, email: data.email, phone: data.contact }
    persist(u)
    return u
  }, [])

  const logout = useCallback(async () => {
    await auth.logout()
    persist(null)
  }, [])

  const updateProfile = useCallback((data) => {
    if (!user) return
    const updated = { ...user, ...data }
    persist(updated)
  }, [user])

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
