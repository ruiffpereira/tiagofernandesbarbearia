import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext.jsx'
import { useCms } from '../context/CmsContext.jsx'
import { Button, Spinner } from '../components/ui.jsx'
import { readGoogleStore, clearGoogleStore, isStandalone } from '../lib/googleLogin.js'

const KNOWN_ERRORS = [
  'access_denied', 'google_error', 'google_failed', 'invalid_state', 'invalid_nonce',
  'invalid_request', 'email_not_verified', 'account_blocked', 'account_conflict', 'internal_error',
]

// Lido uma só vez à entrada (o código é de uso único; o StrictMode corre os efeitos duas vezes)
let params = null
function readParams() {
  if (!params) {
    const q = new URLSearchParams(window.location.search)
    params = { code: q.get('code'), state: q.get('state'), error: q.get('google_error') }
    window.history.replaceState({}, '', window.location.pathname)
  }
  return params
}

export default function GoogleReturnPage() {
  const { loginWithGoogleCode } = useAuth()
  const { t } = useCms()
  const navigate = useNavigate()
  const [errKey, setErrKey] = useState(null)
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true
    const { code, state, error } = readParams()
    const stored = readGoogleStore()

    async function run() {
      if (error) {
        clearGoogleStore()
        setErrKey(KNOWN_ERRORS.includes(error) ? error : 'internal_error')
        return
      }
      // Sem state guardado e fora da app instalada: o regresso abriu noutro contexto (Safari no iPhone)
      if (!stored && !isStandalone() && code) {
        setErrKey('outro_contexto')
        return
      }
      // Defesa contra login-CSRF: o state tem de ser o que este browser gerou
      if (!code || !state || !stored || stored.state !== state) {
        clearGoogleStore()
        setErrKey('invalid_state')
        return
      }
      try {
        await loginWithGoogleCode(code)
        clearGoogleStore()
        navigate(stored.returnTo, { replace: true })
      } catch (e) {
        clearGoogleStore()
        const s = e?.response?.status
        setErrKey(s === 403 ? 'account_blocked' : s === 429 ? 'rate_limit' : s === 404 ? 'indisponivel' : s === 400 ? 'invalid_code' : 'internal_error')
      }
    }
    run()
  }, [])

  return (
    <main className="min-h-screen bg-cream-dark flex items-center justify-center px-6">
      <div role="status" aria-live="polite" className="flex flex-col items-center gap-4 text-center max-w-sm">
        {errKey ? (
          <>
            <p className="text-ink font-semibold">{t(`auth.google.erro.${errKey}`)}</p>
            <Button variant="primary" onClick={() => navigate('/', { replace: true })}>
              {t('auth.google.voltar_inicio')}
            </Button>
          </>
        ) : (
          <>
            <Spinner dark />
            <p className="text-ink-soft text-[13px]">{t('auth.google.a_entrar')}</p>
          </>
        )}
      </div>
    </main>
  )
}
