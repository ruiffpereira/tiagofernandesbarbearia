import { useState } from 'react'
import { useAuth } from '../AuthContext.jsx'
import { useCms } from '../context/CmsContext.jsx'
import { Button, Spinner, Modal, Label, Input } from './ui.jsx'
import {
  loginFormSchema,
  registerFormSchema,
  forgotFormSchema,
  resetFormSchema,
  firstZodError,
} from '../lib/formSchemas.ts'

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
)

export default function AuthModal({ onClose, onSuccess, initialMode = 'login', resetToken = null }) {
  const { login, register, forgotPassword, resetPassword } = useAuth()
  const { t } = useCms()
  const [mode, setMode] = useState(resetToken ? 'reset' : initialMode)
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', newPassword: '', confirmPassword: '' })
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const [forgotSent, setForgotSent] = useState(false)
  const [resetDone, setResetDone] = useState(false)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  function switchMode(m) {
    setMode(m)
    setErr('')
    setForgotSent(false)
    setResetDone(false)
  }

  async function submit(e) {
    e.preventDefault()
    setErr('')

    // Validação com Zod antes de qualquer chamada à API
    if (mode === 'login') {
      const r = loginFormSchema.safeParse({ email: form.email, password: form.password })
      if (!r.success) { setErr(firstZodError(r.error)); return }
    } else if (mode === 'register') {
      const r = registerFormSchema.safeParse({ name: form.name, email: form.email, phone: form.phone, password: form.password })
      if (!r.success) { setErr(firstZodError(r.error)); return }
    } else if (mode === 'forgot') {
      const r = forgotFormSchema.safeParse({ email: form.email })
      if (!r.success) { setErr(firstZodError(r.error)); return }
    } else if (mode === 'reset') {
      const r = resetFormSchema.safeParse({ newPassword: form.newPassword, confirmPassword: form.confirmPassword })
      if (!r.success) { setErr(firstZodError(r.error)); return }
    }

    setLoading(true)
    try {
      if (mode === 'login') {
        const u = await login(form.email, form.password)
        onSuccess(u)
      } else if (mode === 'register') {
        const u = await register(form.name, form.email, form.phone, form.password)
        onSuccess(u)
      } else if (mode === 'forgot') {
        await forgotPassword(form.email)
        setForgotSent(true)
      } else if (mode === 'reset') {
        await resetPassword(resetToken, form.newPassword)
        setResetDone(true)
      }
    } catch (e) {
      const status = e?.response?.status
      const serverMsg = e?.response?.data?.message
      if (status === 401) {
        setErr(t('auth.erro.credenciais'))
      } else if (status === 400) {
        setErr(serverMsg || t('auth.erro.token'))
      } else if (status === 409) {
        setErr(t('auth.erro.email_registado'))
      } else if (status === 422) {
        setErr(serverMsg || t('auth.erro.dados'))
      } else if (serverMsg) {
        setErr(serverMsg)
      } else {
        setErr(e.message || t('auth.erro.generico'))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title={t(`auth.${mode}.titulo`)} onClose={onClose}>

      {/* ── Login ──────────────────────────────────────────── */}
      {mode === 'login' && (
        <>
          <Button variant="surface" disabled className="w-full opacity-50 cursor-not-allowed" aria-disabled="true">
            <GoogleIcon /> {t('auth.google')}
          </Button>
          <div aria-hidden="true" className="flex items-center gap-3 text-[11px] tracking-wider uppercase text-ink-faint font-semibold my-4">
            <span className="flex-1 h-px bg-line" /> {t('auth.ou')} <span className="flex-1 h-px bg-line" />
          </div>
          <form onSubmit={submit} className="flex flex-col gap-3.5" noValidate aria-describedby={err ? 'auth-error' : undefined}>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="auth-email">{t('ui.email')}</Label>
              <Input id="auth-email" type="email" placeholder={t('auth.email.placeholder')} value={form.email}
                onChange={(e) => set('email', e.target.value)} required autoComplete="email" aria-required="true" />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="auth-password">{t('auth.password.label')}</Label>
                <button type="button" onClick={() => switchMode('forgot')}
                  className="text-[11px] text-ink-faint hover:text-navy underline">
                  {t('auth.esqueceu')}
                </button>
              </div>
              <Input id="auth-password" type="password" placeholder={t('auth.password.placeholder')} value={form.password}
                onChange={(e) => set('password', e.target.value)} required autoComplete="current-password" aria-required="true" />
            </div>
            {err && <div id="auth-error" role="alert" aria-live="assertive"
              className="bg-maroon/[0.08] border border-maroon/25 rounded-[10px] px-3.5 py-2.5 text-maroon text-[13px]">{err}</div>}
            <Button variant="primary" type="submit" disabled={loading} aria-busy={loading} className="w-full mt-1">
              {loading ? <><Spinner /> {t('ui.a_processar')}</> : t('ui.entrar')}
            </Button>
          </form>
          <div className="text-center mt-4 text-[13px] text-ink-soft">
            {t('auth.sem_conta')}{' '}
            <button onClick={() => switchMode('register')} className="text-navy font-semibold underline">{t('auth.registar')}</button>
          </div>
        </>
      )}

      {/* ── Registo ────────────────────────────────────────── */}
      {mode === 'register' && (
        <>
          <Button variant="surface" disabled className="w-full opacity-50 cursor-not-allowed" aria-disabled="true">
            <GoogleIcon /> {t('auth.google')}
          </Button>
          <div aria-hidden="true" className="flex items-center gap-3 text-[11px] tracking-wider uppercase text-ink-faint font-semibold my-4">
            <span className="flex-1 h-px bg-line" /> {t('auth.ou')} <span className="flex-1 h-px bg-line" />
          </div>
          <form onSubmit={submit} className="flex flex-col gap-3.5" noValidate aria-describedby={err ? 'auth-error' : undefined}>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="auth-name">{t('ui.nome')}</Label>
              <Input id="auth-name" type="text" placeholder={t('auth.nome.placeholder')} value={form.name}
                onChange={(e) => set('name', e.target.value)} required autoComplete="name" aria-required="true" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="auth-phone">{t('ui.telemovel')}</Label>
              <Input id="auth-phone" type="tel" placeholder={t('auth.telemovel.placeholder')} value={form.phone}
                onChange={(e) => set('phone', e.target.value)} autoComplete="tel" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="auth-email">{t('ui.email')}</Label>
              <Input id="auth-email" type="email" placeholder={t('auth.email.placeholder')} value={form.email}
                onChange={(e) => set('email', e.target.value)} required autoComplete="email" aria-required="true" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="auth-password">{t('auth.password.label')}</Label>
              <Input id="auth-password" type="password" placeholder={t('auth.password.placeholder')} value={form.password}
                onChange={(e) => set('password', e.target.value)} required autoComplete="new-password" aria-required="true" />
            </div>
            {err && <div id="auth-error" role="alert" aria-live="assertive"
              className="bg-maroon/[0.08] border border-maroon/25 rounded-[10px] px-3.5 py-2.5 text-maroon text-[13px]">{err}</div>}
            <Button variant="primary" type="submit" disabled={loading} aria-busy={loading} className="w-full mt-1">
              {loading ? <><Spinner /> {t('ui.a_processar')}</> : t('auth.criar_conta')}
            </Button>
          </form>
          <div className="text-center mt-4 text-[13px] text-ink-soft">
            {t('auth.ja_tem_conta')}{' '}
            <button onClick={() => switchMode('login')} className="text-navy font-semibold underline">{t('auth.entra')}</button>
          </div>
        </>
      )}

      {/* ── Recuperar palavra-passe ────────────────────────── */}
      {mode === 'forgot' && (
        <>
          {forgotSent ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-2xl mx-auto mb-4 bg-electric/10 border border-electric/30
                flex items-center justify-center text-2xl">
                ✉️
              </div>
              <p className="text-ink font-semibold mb-2">{t('auth.email_enviado.titulo')}</p>
              <p className="text-ink-soft text-[13px] leading-relaxed mb-5">
                {t('auth.email_enviado.mensagem')}
              </p>
              <Button variant="ghost" size="sm" onClick={() => switchMode('login')}>
                {t('auth.voltar_login')}
              </Button>
            </div>
          ) : (
            <>
              <p className="text-ink-soft text-[13px] mb-4 leading-relaxed">
                {t('auth.instrucoes_email')}
              </p>
              <form onSubmit={submit} className="flex flex-col gap-3.5" noValidate aria-describedby={err ? 'auth-error' : undefined}>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="forgot-email">{t('ui.email')}</Label>
                  <Input id="forgot-email" type="email" placeholder={t('auth.email.placeholder')} value={form.email}
                    onChange={(e) => set('email', e.target.value)} required autoComplete="email" aria-required="true" />
                </div>
                {err && <div id="auth-error" role="alert" aria-live="assertive"
                  className="bg-maroon/[0.08] border border-maroon/25 rounded-[10px] px-3.5 py-2.5 text-maroon text-[13px]">{err}</div>}
                <Button variant="primary" type="submit" disabled={loading} aria-busy={loading} className="w-full">
                  {loading ? <><Spinner /> {t('ui.a_enviar')}</> : t('auth.enviar_link')}
                </Button>
              </form>
              <div className="text-center mt-4 text-[13px] text-ink-soft">
                <button onClick={() => switchMode('login')} className="text-navy font-semibold underline">
                  ← {t('auth.voltar_login')}
                </button>
              </div>
            </>
          )}
        </>
      )}

      {/* ── Redefinir palavra-passe (via link de email) ────── */}
      {mode === 'reset' && (
        <>
          {resetDone ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-2xl mx-auto mb-4 bg-emerald-500/10 border border-emerald-500/30
                flex items-center justify-center text-2xl text-emerald-600">
                ✓
              </div>
              <p className="text-ink font-semibold mb-2">{t('auth.password_alterada.titulo')}</p>
              <p className="text-ink-soft text-[13px] leading-relaxed mb-5">
                {t('auth.password_alterada.mensagem')}
              </p>
              <Button variant="primary" size="sm" onClick={() => switchMode('login')}>
                {t('ui.entrar')}
              </Button>
            </div>
          ) : (
            <>
              <p className="text-ink-soft text-[13px] mb-4 leading-relaxed">
                {t('auth.instrucoes_reset')}
              </p>
              <form onSubmit={submit} className="flex flex-col gap-3.5" noValidate aria-describedby={err ? 'auth-error' : undefined}>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="reset-password">{t('auth.nova_password.label')}</Label>
                  <Input id="reset-password" type="password" placeholder={t('auth.nova_password.placeholder')} value={form.newPassword}
                    onChange={(e) => set('newPassword', e.target.value)} required autoComplete="new-password" aria-required="true" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="reset-confirm">{t('auth.confirmar_password.label')}</Label>
                  <Input id="reset-confirm" type="password" placeholder={t('auth.confirmar_password.placeholder')} value={form.confirmPassword}
                    onChange={(e) => set('confirmPassword', e.target.value)} required autoComplete="new-password" aria-required="true" />
                </div>
                {err && <div id="auth-error" role="alert" aria-live="assertive"
                  className="bg-maroon/[0.08] border border-maroon/25 rounded-[10px] px-3.5 py-2.5 text-maroon text-[13px]">{err}</div>}
                <Button variant="primary" type="submit" disabled={loading} aria-busy={loading} className="w-full">
                  {loading ? <><Spinner /> {t('ui.a_guardar')}</> : t('auth.guardar_password')}
                </Button>
              </form>
            </>
          )}
        </>
      )}
    </Modal>
  )
}
