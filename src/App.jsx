import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { AuthProvider, useAuth } from './AuthContext.jsx'
import { CmsProvider, useCms } from './context/CmsContext.jsx'
import Navbar from './components/Navbar.jsx'
import AuthModal from './components/AuthModal.jsx'
import HomePage from './pages/HomePage.jsx'
import GalleryPage from './pages/GalleryPage.jsx'
import AboutPage from './pages/AboutPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import CancelPage from './pages/CancelPage.jsx'
import PwaInstallBanner from './components/PwaInstallBanner.jsx'

function Layout() {
  const { user, logout } = useAuth()
  const { t } = useCms()
  const navigate = useNavigate()
  const [showAuth, setShowAuth] = useState(false)
  const [resetToken, setResetToken] = useState(
    () => new URLSearchParams(window.location.search).get('token')
  )
  const [toast, setToast] = useState(null)

  useEffect(() => {
    if (resetToken) {
      setShowAuth(true)
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  useEffect(() => {
    document.body.style.overflow = showAuth ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [showAuth])

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  function handleLogin(u) {
    setShowAuth(false)
    showToast(`Bem-vindo, ${u.name.split(' ')[0]}!`)
  }

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  return (
    <>
      <Navbar
        user={user}
        onLogin={() => setShowAuth(true)}
        onLogout={handleLogout}
      />

      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none"
      >
        {toast && (
          <div className="bg-navy text-cream px-5 py-3 rounded-full
            text-sm font-medium shadow-soft whitespace-nowrap animate-fadeUp pointer-events-auto">
            {toast}
          </div>
        )}
      </div>

      <PwaInstallBanner />

      {showAuth && (
        <AuthModal
          onClose={() => { setShowAuth(false); setResetToken(null) }}
          onSuccess={handleLogin}
          resetToken={resetToken}
        />
      )}

      <div id="main-content" tabIndex={-1} className="outline-none">
        <Outlet context={{ onRequireLogin: () => setShowAuth(true) }} />
      </div>
    </>
  )
}

function ProtectedDashboard() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/" replace />
  return <DashboardPage />
}

function AppRoutes() {
  const { t } = useCms()
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route
          path="/"
          element={
            <>
              <Helmet><title>{t('seo.titulo')}</title></Helmet>
              <HomePage />
            </>
          }
        />
        <Route
          path="/galeria"
          element={
            <>
              <Helmet><title>{[t('galeria.titulo'), t('hero.titulo')].filter(Boolean).join(' · ')}</title></Helmet>
              <GalleryPage />
            </>
          }
        />
        <Route
          path="/sobre"
          element={
            <>
              <Helmet><title>{[t('sobre.label'), t('hero.titulo')].filter(Boolean).join(' · ')}</title></Helmet>
              <AboutPage />
            </>
          }
        />
        <Route
          path="/dashboard"
          element={
            <>
              <Helmet><title>{['A minha conta', t('hero.titulo')].filter(Boolean).join(' · ')}</title></Helmet>
              <ProtectedDashboard />
            </>
          }
        />
        <Route
          path="/reset-password"
          element={
            <>
              <Helmet><title>{t('seo.titulo')}</title></Helmet>
              <HomePage />
            </>
          }
        />
      </Route>
      <Route path="/cancelar/:token" element={<CancelPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <CmsProvider>
        <AppRoutes />
      </CmsProvider>
    </AuthProvider>
  )
}
