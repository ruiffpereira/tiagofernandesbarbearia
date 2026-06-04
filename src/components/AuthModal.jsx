import { useState } from 'react'
import { useAuth } from '../AuthContext.jsx'
import { Button, Spinner, Modal, Label, Input } from './ui.jsx'

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
)

export default function AuthModal({ onClose, onSuccess }) {
  const { login, register } = useAuth()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const errId = 'auth-error'

  async function submit(e) {
    e.preventDefault()
    setErr('')
    setLoading(true)
    try {
      let u
      if (mode === 'login') {
        u = await login(form.email, form.password)
      } else {
        if (!form.name || !form.email || !form.password) throw new Error('Preenche todos os campos.')
        if (form.password.length < 6) throw new Error('Palavra-passe com mínimo de 6 caracteres.')
        u = await register(form.name, form.email, form.phone, form.password)
      }
      onSuccess(u)
    } catch (e) {
      setErr(e.message || 'Ocorreu um erro. Tenta novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title={mode === 'login' ? 'Bem-vindo de volta' : 'Criar conta'} onClose={onClose}>
      <Button variant="surface" disabled className="w-full opacity-50 cursor-not-allowed" aria-disabled="true">
        <GoogleIcon /> Continuar com Google (brevemente)
      </Button>

      <div aria-hidden="true" className="flex items-center gap-3 text-[11px] tracking-wider uppercase text-ink-faint font-semibold my-4">
        <span className="flex-1 h-px bg-line" /> ou <span className="flex-1 h-px bg-line" />
      </div>

      <form onSubmit={submit} className="flex flex-col gap-3.5" noValidate aria-describedby={err ? errId : undefined}>
        {mode === 'register' && (
          <>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="auth-name">Nome completo *</Label>
              <Input
                id="auth-name"
                type="text"
                placeholder="O teu nome"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                required
                autoComplete="name"
                aria-required="true"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="auth-phone">Telemóvel</Label>
              <Input
                id="auth-phone"
                type="tel"
                placeholder="+351 9XX XXX XXX"
                value={form.phone}
                onChange={(e) => set('phone', e.target.value)}
                autoComplete="tel"
              />
            </div>
          </>
        )}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="auth-email">Email *</Label>
          <Input
            id="auth-email"
            type="email"
            placeholder="email@exemplo.com"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
            required
            autoComplete={mode === 'login' ? 'email' : 'email'}
            aria-required="true"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="auth-password">Palavra-passe *</Label>
          <Input
            id="auth-password"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => set('password', e.target.value)}
            required
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            aria-required="true"
          />
        </div>
        {err && (
          <div
            id={errId}
            role="alert"
            aria-live="assertive"
            className="bg-maroon/[0.08] border border-maroon/25 rounded-[10px] px-3.5 py-2.5 text-maroon text-[13px]"
          >
            {err}
          </div>
        )}
        <Button
          variant="primary"
          type="submit"
          disabled={loading}
          aria-disabled={loading}
          aria-busy={loading}
          className="w-full mt-1"
        >
          {loading ? <><Spinner /> A processar…</> : mode === 'login' ? 'Entrar' : 'Criar conta'}
        </Button>
      </form>

      <div className="text-center mt-4 text-[13px] text-ink-soft">
        {mode === 'login' ? (
          <>Sem conta?{' '}
            <button onClick={() => { setMode('register'); setErr('') }} className="text-navy font-semibold underline">
              Regista-te
            </button>
          </>
        ) : (
          <>Já tens conta?{' '}
            <button onClick={() => { setMode('login'); setErr('') }} className="text-navy font-semibold underline">
              Entra
            </button>
          </>
        )}
      </div>
    </Modal>
  )
}
