import { createContext, useContext } from 'react'
import { keepPreviousData } from '@tanstack/react-query'
import { useGetContent } from '../servers/booking/hooks/useGetContent.ts'
import { useLanguage } from './LanguageContext.jsx'
import { Spinner } from '../components/ui.jsx'

const CmsContext = createContext({ t: () => '', loading: true, switching: false })

export function CmsProvider({ children }) {
  const { currentLang } = useLanguage()

  const { data: cms, isLoading, isFetching, isPlaceholderData } = useGetContent(
    { locale: currentLang },
    {
      query: {
        refetchInterval: 60_000,
        staleTime: 55_000,
        // Mantém o conteúdo da língua anterior visível enquanto a nova carrega,
        // evitando o flash do ecrã de loading e o remount ao mudar de língua.
        placeholderData: keepPreviousData,
      },
    },
  )

  function t(key) {
    return cms?.[key] ?? ''
  }

  // `isPlaceholderData` só é true quando estamos a mostrar a língua anterior
  // enquanto a nova carrega — ou seja, exactamente durante a troca de língua
  // (não dispara nas refetches de fundo da mesma língua).
  const switching = isPlaceholderData && isFetching

  return (
    <CmsContext.Provider value={{ t, cms: cms ?? {}, loading: isLoading || !cms, switching }}>
      {children}
      {switching && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none"
        >
          <div className="flex items-center gap-2.5 bg-navy text-cream px-4 py-2.5 rounded-full text-[13px] font-medium shadow-lift animate-fadeUp">
            <Spinner />
            {t('app.a_mudar_lingua') || 'A mudar de língua…'}
          </div>
        </div>
      )}
    </CmsContext.Provider>
  )
}

export function useCms() {
  return useContext(CmsContext)
}
