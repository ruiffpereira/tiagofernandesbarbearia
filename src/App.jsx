import { useState, useEffect } from "react";
import { Routes, Route, Navigate, Outlet, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { AuthProvider, useAuth } from "./AuthContext.jsx";
import { LanguageProvider } from "./context/LanguageContext.jsx";
import { CmsProvider, useCms } from "./context/CmsContext.jsx";
import Navbar from "./components/Navbar.jsx";
import AuthModal from "./components/AuthModal.jsx";
import { Spinner } from "./components/ui.jsx";
import HomePage from "./pages/HomePage.jsx";
import GalleryPage from "./pages/GalleryPage.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import CancelPage from "./pages/CancelPage.jsx";
import PwaInstallBanner from "./components/PwaInstallBanner.jsx";

const PAGE_PATHS = {
  home:    "/",
  gallery: "/galeria",
  about:   "/sobre",
};

function Seo({ page, title, description, noindex = false }) {
  const { t } = useCms();
  const siteUrl = t('site.url');
  const ogImage = t('seo.og_image');
  // Favicon vindo do CMS (com fallback para o logótipo). Substitui o ícone
  // estático do index.html assim que o conteúdo do CMS carrega.
  const favicon = t('seo.favicon') || t('hero.logo');
  const canonical = page ? `${siteUrl}${PAGE_PATHS[page]}` : null;

  return (
    <Helmet>
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}
      {favicon && <link rel="icon" href={favicon} />}
      {favicon && <link rel="apple-touch-icon" href={favicon} />}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {canonical && <link rel="canonical" href={canonical} />}
      {title && <meta property="og:title" content={title} />}
      {description && (
        <meta property="og:description" content={description} />
      )}
      {canonical && <meta property="og:url" content={canonical} />}
      {ogImage && <meta property="og:image" content={ogImage} />}
      <meta name="twitter:card" content="summary" />
      {title && <meta name="twitter:title" content={title} />}
      {description && (
        <meta name="twitter:description" content={description} />
      )}
      {ogImage && <meta name="twitter:image" content={ogImage} />}
    </Helmet>
  );
}

function Layout() {
  const { user, logout } = useAuth();
  const { loading, t } = useCms();
  const navigate = useNavigate();
  const [showAuth, setShowAuth] = useState(false);
  const [resetToken, setResetToken] = useState(() =>
    new URLSearchParams(window.location.search).get("token"),
  );
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (resetToken) {
      setShowAuth(true);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  useEffect(() => {
    document.body.style.overflow = showAuth ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showAuth]);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function handleLogin(u) {
    setShowAuth(false);
    showToast(`${t("app.bem_vindo")} ${u.name.split(" ")[0]}!`);
  }

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  if (loading) return <CmsLoading />;

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
          <div
            className="bg-navy text-cream px-5 py-3 rounded-full
            text-sm font-medium shadow-soft whitespace-nowrap animate-fadeUp pointer-events-auto"
          >
            {toast}
          </div>
        )}
      </div>

      <PwaInstallBanner />

      {showAuth && (
        <AuthModal
          onClose={() => {
            setShowAuth(false);
            setResetToken(null);
          }}
          onSuccess={handleLogin}
          resetToken={resetToken}
        />
      )}

      <div id="main-content" tabIndex={-1} className="outline-none">
        <Outlet context={{ onRequireLogin: () => setShowAuth(true) }} />
      </div>
    </>
  );
}

function CmsLoading() {
  return (
    <main className="min-h-screen bg-cream-dark flex items-center justify-center px-6">
      <div
        role="status"
        aria-live="polite"
        className="flex flex-col items-center gap-4 text-center animate-fadeIn"
      >
        <div className="flex items-center gap-3 text-lg font-semibold text-navy">
          <Spinner dark />
        </div>
      </div>
    </main>
  );
}

function ProtectedDashboard() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  return <DashboardPage />;
}

function AppRoutes() {
  const { t } = useCms();

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route
          path="/"
          element={
            <>
              <Seo page="home" title={t("seo.home.titulo")} description={t("seo.home.descricao")} />
              <HomePage />
            </>
          }
        />
        <Route
          path="/galeria"
          element={
            <>
              <Seo page="gallery" title={t("seo.galeria.titulo")} description={t("seo.galeria.descricao")} />
              <GalleryPage />
            </>
          }
        />
        <Route
          path="/sobre"
          element={
            <>
              <Seo page="about" title={t("seo.sobre.titulo")} description={t("seo.sobre.descricao")} />
              <AboutPage />
            </>
          }
        />
        <Route
          path="/dashboard"
          element={
            <>
              <Seo
                title={[t("seo.dashboard.titulo"), t("hero.titulo")]
                  .filter(Boolean)
                  .join(" - ")}
                noindex
              />
              <ProtectedDashboard />
            </>
          }
        />
        <Route
          path="/reset-password"
          element={
            <>
              <Seo title={t("seo.home.titulo")} noindex />
              <HomePage />
            </>
          }
        />
      </Route>
      <Route
        path="/cancelar/:token"
        element={
          <>
            <Seo title={t("seo.cancelar.titulo")} noindex />
            <CancelPage />
          </>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <CmsProvider>
          <AppRoutes />
        </CmsProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}
