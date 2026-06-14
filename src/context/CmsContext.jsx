import { createContext, useContext } from 'react'
import { useGetContent } from '../servers/booking/hooks/useGetContent.ts'
import { useLanguage } from './LanguageContext.jsx'

const CmsContext = createContext({ t: () => '', loading: true })

export function CmsProvider({ children }) {
  const { currentLang } = useLanguage()

  const { data: cms, isLoading } = useGetContent(
    { locale: currentLang },
    { query: { refetchInterval: 60_000, staleTime: 55_000 } },
  )

  function t(key) {
    return cms?.[key] ?? ''
  }

  return (
    <CmsContext.Provider value={{ t, cms: cms ?? {}, loading: isLoading || !cms }}>
      {children}
    </CmsContext.Provider>
  )
}

export function useCms() {
  return useContext(CmsContext)
}
