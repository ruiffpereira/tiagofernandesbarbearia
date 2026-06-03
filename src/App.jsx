import { useState, useEffect, useCallback } from 'react'
import { AuthProvider, useAuth } from './AuthContext.jsx'
import Navbar from './components/Navbar.jsx'
import AuthModal from './components/AuthModal.jsx'
import HomePage from './pages/HomePage.jsx'
import GalleryPage from './pages/GalleryPage.jsx'
import AboutPage from './pages/AboutPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import PwaInstallBanner from './components/PwaInstallBanner.jsx'

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
    showToast(`Bem-vindo, ${u.name.split(' ')[0]}!`)
  }

  async function handleLogout() {
    await logout()
    setView('home')
    setHomeKey((k) => k + 1)
  }

  // Redireciona para home se tentar ver dashboard sem login
  useEffect(() => {
    if (view === 'dashboard' && !user) setView('home')
  }, [view, user])

  return (
    <>
      {navLoading && (
        <div className="fixed top-0 left-0 right-0 z-[9999] h-0.5 bg-maroon animate-pageLoad" />
      )}
      <Navbar
        user={user}
        view={view}
        setView={goTo}
        onLogin={() => setShowAuth(true)}
        onLogout={handleLogout}
        onDashboard={() => goTo('dashboard')}
      />

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-navy text-cream px-5 py-3 rounded-full
          text-sm font-medium z-[9999] shadow-soft whitespace-nowrap animate-fadeUp">
          {toast}
        </div>
      )}

      <PwaInstallBanner />
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onSuccess={handleLogin} />}

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
