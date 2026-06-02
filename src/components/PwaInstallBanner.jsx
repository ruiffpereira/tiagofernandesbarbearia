import { useState, useEffect } from 'react'
import { usePwaInstall } from '../hooks/usePwaInstall.js'

const DISMISSED_KEY = 'pwa_banner_dismissed_until'

export default function PwaInstallBanner() {
  const pwa = usePwaInstall()
  const [visible, setVisible] = useState(false)
  const [iosExpanded, setIosExpanded] = useState(false)

  useEffect(() => {
    if (!pwa.show) return
    const until = localStorage.getItem(DISMISSED_KEY)
    if (until && Date.now() < Number(until)) return
    const t = setTimeout(() => setVisible(true), 1500)
    return () => clearTimeout(t)
  }, [pwa.show])

  const dismiss = () => {
    setVisible(false)
    localStorage.setItem(DISMISSED_KEY, Date.now() + 7 * 24 * 60 * 60 * 1000)
  }

  const handleInstall = async () => {
    if (pwa.isIos) { setIosExpanded((v) => !v); return }
    if (!pwa.ready) return
    await pwa.install()
    setVisible(false)
  }

  // banner só aparece quando o browser está pronto para instalar (Android)
  // ou em iOS (instruções manuais)
  if (!visible || (!pwa.ready && !pwa.isIos)) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[9998] flex justify-center pointer-events-none">
      <div className="bg-navy text-cream rounded-2xl shadow-soft px-5 py-4 w-full max-w-sm pointer-events-auto">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="" className="h-10 w-10 rounded-xl object-contain flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold leading-tight">Instalar a App</p>
            <p className="text-[11px] text-cream/70 mt-0.5 leading-tight">
              Acesso rápido, sem abrir o browser.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleInstall}
              className="bg-maroon text-cream text-xs font-semibold px-3 py-1.5 rounded-lg"
            >
              {pwa.isIos ? 'Como?' : 'Instalar'}
            </button>
            <button
              onClick={dismiss}
              className="text-cream/50 hover:text-cream text-lg leading-none px-1"
              aria-label="Fechar"
            >
              ✕
            </button>
          </div>
        </div>

        {pwa.isIos && iosExpanded && (
          <p className="text-[12px] text-cream/80 mt-3 leading-relaxed border-t border-cream/10 pt-3">
            No Safari, toca em <strong className="text-cream">Partilhar</strong> (⎙) na barra inferior
            e depois em <strong className="text-cream">"Adicionar ao ecrã inicial"</strong>.
          </p>
        )}
      </div>
    </div>
  )
}
