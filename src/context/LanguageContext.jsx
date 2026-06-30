import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useGetWebsitesLanguages } from '../servers/cms/hooks/useGetWebsitesLanguages.ts'
import { usePutWebsitesLanguagesMe } from '../servers/cms/hooks/usePutWebsitesLanguagesMe.ts'
import { getContentQueryKey } from '../servers/booking/hooks/useGetContent.ts'
import { useAuth } from '../AuthContext.jsx'

const LANG_KEY = 'btf_lang'

const LanguageContext = createContext({
  currentLang: 'pt',
  languages: [],
  changeLanguage: () => {},
})

export function LanguageProvider({ children }) {
  const { user, silentUpdateLanguage } = useAuth()
  const queryClient = useQueryClient()
  const [currentLang, setCurrentLang] = useState('pt')

  const { data: langData } = useGetWebsitesLanguages(undefined, undefined, {
    query: { staleTime: Infinity, retry: false },
  })

  const languages = langData?.languages ?? []
  const defaultLang = langData?.default ?? 'pt'

  const { mutate: updateLang } = usePutWebsitesLanguagesMe()

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

  const changeLanguage = useCallback((code) => {
    setCurrentLang(code)

    if (user) {
      silentUpdateLanguage(code)
      // O endpoint /websites/content ignora ?locale quando o customer está
      // autenticado e usa Customer.defaultLanguage. Só depois deste PUT confirmar
      // é que um refetch devolve a nova língua — por isso invalidamos o conteúdo
      // no onSuccess (invalidateQueries usa cancelRefetch=true por omissão, logo
      // cancela o fetch otimista em curso e garante o refetch pós-PUT). Sem isto,
      // o conteúdo ficava na língua antiga até dar refresh manual.
      updateLang(
        { data: { language: code } },
        {
          onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: getContentQueryKey() }),
        },
      )
    } else {
      localStorage.setItem(LANG_KEY, code)
    }
  }, [user, silentUpdateLanguage, updateLang, queryClient])

  return (
    <LanguageContext.Provider value={{ currentLang, languages, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
