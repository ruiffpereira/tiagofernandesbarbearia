import { createContext, useContext } from 'react'
import { useGetContent } from '../servers/booking/hooks/useGetContent.ts'

const CmsContext = createContext({ t: () => '', loading: true })

export function CmsProvider({ children }) {
  const { data: cms, isLoading } = useGetContent(
    { locale: 'pt' },
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
