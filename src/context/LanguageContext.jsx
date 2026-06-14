import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { axiosInstance } from '@kubb/plugin-client/clients/axios'
import { useAuth } from '../AuthContext.jsx'

const LANG_KEY = 'btf_lang'

const LanguageContext = createContext({
  currentLang: 'pt',
  languages: [],
  changeLanguage: () => {},
})

export function LanguageProvider({ children }) {
  const { user, setUserLanguage } = useAuth()
  const [languages, setLanguages] = useState([])
  const [defaultLang, setDefaultLang] = useState('pt')
  const [currentLang, setCurrentLang] = useState('pt')

  useEffect(() => {
    axiosInstance.get('/websites/languages').then(({ data }) => {
      setLanguages(data.languages ?? [])
      setDefaultLang(data.default ?? 'pt')
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (languages.length === 0) return

    const codes = languages.map((l) => l.code)

    if (user?.defaultLanguage && codes.includes(user.defaultLanguage)) {
      setCurrentLang(user.defaultLanguage)
      return
    }

    const stored = localStorage.getItem(LANG_KEY)
    if (stored && codes.includes(stored)) {
      setCurrentLang(stored)
      return
    }

    setCurrentLang(defaultLang)
  }, [user, languages, defaultLang])

  const changeLanguage = useCallback(async (code) => {
    setCurrentLang(code)

    if (user) {
      try {
        await axiosInstance.put('/websites/languages/me', { language: code })
        setUserLanguage(code)
      } catch {
        // falha silenciosa — o estado local já foi atualizado
      }
    } else {
      localStorage.setItem(LANG_KEY, code)
    }
  }, [user, setUserLanguage])

  return (
    <LanguageContext.Provider value={{ currentLang, languages, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
