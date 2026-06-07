import { createContext, useContext, useState, useEffect } from 'react'

const API_BASE      = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001/api'
const CONTENT_TOKEN = import.meta.env.VITE_CONTENT_TOKEN ?? ''

const CmsContext = createContext({ t: (_, fb) => fb ?? '', loading: true })

export function CmsProvider({ children }) {
  const [cms, setCms]       = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!CONTENT_TOKEN) { setLoading(false); return }
    fetch(`${API_BASE}/websites/content?locale=pt`, {
      headers: { Authorization: `Bearer ${CONTENT_TOKEN}` },
    })
      .then((r) => r.ok ? r.json() : Promise.reject(r.status))
      .then((data) => setCms(data))
      .catch(() => {/* usa fallbacks */})
      .finally(() => setLoading(false))
  }, [])

  // t(key, fallback) — returns CMS value or fallback while loading / on error
  function t(key, fallback = '') {
    return cms[key] ?? fallback
  }

  return (
    <CmsContext.Provider value={{ t, cms, loading }}>
      {children}
    </CmsContext.Provider>
  )
}

export function useCms() {
  return useContext(CmsContext)
}
