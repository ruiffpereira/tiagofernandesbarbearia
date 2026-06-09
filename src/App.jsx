import { useState, useEffect } from "react";
import { Routes, Route, Navigate, Outlet, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { AuthProvider, useAuth } from "./AuthContext.jsx";
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

const SITE_URL = "https://barbearia-tiago.pt";
const SHARE_IMAGE = `${SITE_URL}/pwa-512x512.png`;

const SEO = {
  home: {
    path: "/",
    title: "Barbearia Tiago Fernandes - Braga",
    description:
      "Barbearia Tiago Fernandes em Braga. Degrade, barba, cortes classicos e tratamentos. Marca a tua consulta online em segundos, sem chamadas.",
  },
  gallery: {
    path: "/galeria",
    title: "Galeria de cortes - Barbearia Tiago Fernandes",
    description:
      "Ve trabalhos, cortes, fades e acabamentos da Barbearia Tiago Fernandes em Braga.",
  },
  about: {
    path: "/sobre",
    title: "Sobre - Barbearia Tiago Fernandes",
    description:
      "Conhece a Barbearia Tiago Fernandes em Braga: atendimento, estilo, experiencia e cuidado em cada corte.",
  },
};

function Seo({ page, title, description, noindex = false }) {
  const data = page ? SEO[page] : null;
  const seoTitle = title ?? data?.title;
  const seoDescription = description ?? data?.description;
  const canonical = data ? `${SITE_URL}${data.path}` : null;

  return (
    <Helmet>
      {seoTitle && <title>{seoTitle}</title>}
      {seoDescription && <meta name="description" content={seoDescription} />}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {canonical && <link rel="canonical" href={canonical} />}
      {seoTitle && <meta property="og:title" content={seoTitle} />}
      {seoDescription && (
        <meta property="og:description" content={seoDescription} />
      )}
      {canonical && <meta property="og:url" content={canonical} />}
      <meta property="og:image" content={SHARE_IMAGE} />
      <meta name="twitter:card" content="summary" />
      {seoTitle && <meta name="twitter:title" content={seoTitle} />}
      {seoDescription && (
        <meta name="twitter:description" content={seoDescription} />
      )}
      <meta name="twitter:image" content={SHARE_IMAGE} />
    </Helmet>
  );
}

function Layout() {
  const { user, logout } = useAuth();
  const { loading } = useCms();
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
    showToast(`Bem-vindo, ${u.name.split(" ")[0]}!`);
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
        <div className="flex items-center gap-3 text-sm font-semibold text-navy">
          <Spinner dark />A carregar conteudo...
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
              <Seo page="home" />
              <HomePage />
            </>
          }
        />
        <Route
          path="/galeria"
          element={
            <>
              <Seo page="gallery" />
              <GalleryPage />
            </>
          }
        />
        <Route
          path="/sobre"
          element={
            <>
              <Seo page="about" />
              <AboutPage />
            </>
          }
        />
        <Route
          path="/dashboard"
          element={
            <>
              <Seo
                title={["A minha conta", t("hero.titulo")]
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
              <Seo title={SEO.home.title} noindex />
              <HomePage />
            </>
          }
        />
      </Route>
      <Route
        path="/cancelar/:token"
        element={
          <>
            <Seo title="Cancelar marcacao - Barbearia Tiago Fernandes" noindex />
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
      <CmsProvider>
        <AppRoutes />
      </CmsProvider>
    </AuthProvider>
  );
}
