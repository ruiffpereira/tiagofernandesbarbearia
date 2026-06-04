import { useState, useEffect } from 'react'
import { usePwaInstall } from '../hooks/usePwaInstall.js'

const DISMISSED_KEY = 'pwa_banner_dismissed_until'

export default function PwaInstallBanner() {
  const pwa = usePwaInstall()
  const [visible, setVisible] = useState(false)
  const [hint, setHint] = useState(false) // instruções iOS ou "abre no Chrome"

  useEffect(() => {
    if (!pwa.show) return
    const until = localStorage.getItem(DISMISSED_KEY)
    if (until && Date.now() < Number(until)) return
    const t = setTimeout(() => setVisible(true), 1500)
    return () => clearTimeout(t)
  }, [pwa.show])

  const dismiss = () => {
    setVisible(false)
    setHint(false)
    localStorage.setItem(DISMISSED_KEY, Date.now() + 7 * 24 * 60 * 60 * 1000)
  }

  const handleInstall = async () => {
    if (pwa.isIos || !pwa.ready) {
      setHint((v) => !v)
      return
    }
    await pwa.install()
    setVisible(false)
  }

  if (!visible || !pwa.show) return null

  const isIosOrNotReady = pwa.isIos || !pwa.ready

  return (
    <div className="fixed bottom-20 left-4 right-4 z-[9998] flex justify-center pointer-events-none lg:bottom-4">
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
              aria-expanded={isIosOrNotReady ? hint : undefined}
              className="bg-maroon text-cream text-xs font-semibold px-3 py-1.5 rounded-lg"
            >
              {pwa.isIos ? 'Como?' : 'Instalar'}
            </button>
            <button
              onClick={dismiss}
              aria-label="Fechar"
              className="text-cream/50 hover:text-cream text-lg leading-none px-1"
            >
              <span aria-hidden="true">✕</span>
            </button>
          </div>
        </div>

        {hint && (
          <p className="text-[12px] text-cream/80 mt-3 leading-relaxed border-t border-cream/10 pt-3">
            {pwa.isIos ? (
              <>
                No Safari, toca em <strong className="text-cream">Partilhar</strong>{' '}
                <span aria-hidden="true">⎙</span> e depois em{' '}
                <strong className="text-cream">"Adicionar ao ecrã inicial"</strong>.
              </>
            ) : (
              <>
                Abre este site no <strong className="text-cream">Google Chrome</strong> e volta
                a tentar — o Chrome permite instalar a app directamente.
              </>
            )}
          </p>
        )}
      </div>
    </div>
  )
}
