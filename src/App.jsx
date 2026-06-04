import { useState, useEffect, useCallback } from 'react'
import { Helmet } from 'react-helmet-async'
import { AuthProvider, useAuth } from './AuthContext.jsx'
import Navbar from './components/Navbar.jsx'
import AuthModal from './components/AuthModal.jsx'
import HomePage from './pages/HomePage.jsx'
import GalleryPage from './pages/GalleryPage.jsx'
import AboutPage from './pages/AboutPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import PwaInstallBanner from './components/PwaInstallBanner.jsx'

const PAGE_TITLES = {
  home:      'Barbearia Tiago Fernandes · Braga',
  gallery:   'Galeria de Trabalhos · Barbearia Tiago Fernandes',
  about:     'Sobre · Barbearia Tiago Fernandes',
  dashboard: 'A minha conta · Barbearia Tiago Fernandes',
}

const TAGLINE =
  'Onde o cuidado tradicional encontra o estilo moderno. Marca já a tua próxima visita — em segundos, sem chamadas.'

function Inner() {
  const { user, logout } = useAuth()
  const [view, setView] = useState('home')
  const [homeKey, setHomeKey] = useState(0)
  const [navLoading, setNavLoading] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [toast, setToast] = useState(null)

  const goTo = useCallback((v) => {
    if (v === view) return
    window.scrollTo({ top: 0, behavior: 'instant' })
    setNavLoading(true)
    setView(v)
    setTimeout(() => setNavLoading(false), 400)
  }, [view])

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  function handleLogin(u) {
    setShowAuth(false)
    setView('home')
    showToast(`Bem-vindo, ${u.name.split(' ')[0]}!`)
  }

  async function handleLogout() {
    await logout()
    setView('home')
    setHomeKey((k) => k + 1)
  }

  useEffect(() => {
    document.body.style.overflow = showAuth ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [showAuth])

  // Redireciona para home se tentar ver dashboard sem login
  useEffect(() => {
    if (view === 'dashboard' && !user) setView('home')
  }, [view, user])

  return (
    <>
      <Helmet>
        <title>{PAGE_TITLES[view] ?? PAGE_TITLES.home}</title>
      </Helmet>

      {/* Skip link — utilizadores de teclado/leitor de ecrã */}
      <a href="#main-content" className="skip-link">
        Saltar para conteúdo principal
      </a>

      {navLoading && (
        <div className="fixed top-0 left-0 right-0 z-[9999] h-0.5 bg-maroon animate-pageLoad" aria-hidden="true" />
      )}
      <Navbar
        user={user}
        view={view}
        setView={goTo}
        onLogin={() => setShowAuth(true)}
        onLogout={handleLogout}
        onDashboard={() => goTo('dashboard')}
      />

      {/* Região de notificações — anunciada por leitores de ecrã */}
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
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onSuccess={handleLogin} />}

      <div id="main-content" tabIndex={-1} className="outline-none">
        {view === 'home' && (
          <HomePage
            key={homeKey}
            user={user}
            tagline={TAGLINE}
            onRequireLogin={() => setShowAuth(true)}
            onBooked={() => {}}
          />
        )}
        {view === 'gallery' && <GalleryPage />}
        {view === 'about' && <AboutPage />}
        {view === 'dashboard' && user && (
          <DashboardPage
            user={user}
            onBook={() => goTo('home')}
            onHome={() => goTo('home')}
            onLogout={handleLogout}
          />
        )}
      </div>
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Inner />
    </AuthProvider>
  )
}
