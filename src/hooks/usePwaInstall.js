import { useState, useEffect } from 'react'

const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent)
const isMobile = /iphone|ipad|ipod|android/i.test(navigator.userAgent)
const isStandalone = window.matchMedia('(display-mode: standalone)').matches
  || window.navigator.standalone === true

export function usePwaInstall() {
  const [prompt, setPrompt] = useState(null)

  useEffect(() => {
    if (isStandalone || !isMobile) return
    const handler = (e) => { e.preventDefault(); setPrompt(e) }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (isStandalone || !isMobile) return { show: false }

  if (isIos) return { show: true, isIos: true, install: null, ready: true }

  const install = async () => {
    if (!prompt) return
    prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') setPrompt(null)
  }

  // ready = browser já emitiu o evento e pode instalar directamente
  // show = sempre true em mobile para mostrar o botão no menu
  return { show: true, isIos: false, install, ready: !!prompt }
}
