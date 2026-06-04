import { useState } from "react";
import { Button } from "./ui.jsx";
import { usePwaInstall } from "../hooks/usePwaInstall.js";

const NAV = [
  { label: "Início", key: "home", icon: HomeIcon },
  { label: "Trabalhos", key: "gallery", icon: GridIcon },
  { label: "Sobre", key: "about", icon: InfoIcon },
];

export default function Navbar({
  user,
  view,
  setView,
  onLogin,
  onLogout,
  onDashboard,
}) {
  const go = (key) => setView(key);
  const pwa = usePwaInstall();
  const [showIosHint, setShowIosHint] = useState(false);

  function handleInstall() {
    if (pwa.isIos) {
      setShowIosHint((v) => !v);
      return;
    }
    if (pwa.ready) {
      pwa.install();
    }
  }

  // Quando há 5 items no bottom nav, reduz o padding lateral para não ficar apertado
  const itemPad = pwa.show ? "px-2" : "px-4";

  return (
    <>
      {/* ── Top bar ─────────────────────────────────────────────── */}
      <nav
        aria-label="Navegação principal"
        className="lg:sticky lg:top-0 z-[900] h-16
        bg-cream-dark lg:bg-cream lg:border-b lg:border-line
        px-4 sm:px-6 lg:px-10 flex items-center justify-between"
      >
        {/* Logo */}
        <button
          onClick={() => go("home")}
          aria-label="Barbearia Tiago Fernandes — página inicial"
          className="flex items-center gap-2.5"
        >
          <img
            src="/logo.png"
            alt=""
            aria-hidden="true"
            className="h-11 w-11 object-contain"
          />
          <span className="text-[15px] font-extrabold text-navy tracking-tight leading-none">
            TIAGO FERNANDES
            <span className="block text-[9px] font-semibold tracking-[0.25em] text-maroon mt-0.5">
              BARBEARIA
            </span>
          </span>
        </button>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-7" role="list">
          {NAV.map(({ label, key }) => (
            <button
              key={key}
              role="listitem"
              onClick={() => go(key)}
              aria-current={view === key ? "page" : undefined}
              className={`relative text-sm py-1.5 transition-colors ${
                view === key
                  ? "text-electric font-semibold"
                  : "text-ink-soft font-medium hover:text-navy"
              }`}
            >
              {label}
              {view === key && (
                <span aria-hidden="true" className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-electric rounded-full" />
              )}
            </button>
          ))}
          {user ? (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={onDashboard} aria-current={view === "dashboard" ? "page" : undefined}>
                Conta
              </Button>
              <Button variant="surface" size="sm" onClick={onLogout}>
                Sair
              </Button>
            </div>
          ) : (
            <Button variant="primary" size="sm" onClick={onLogin}>
              Entrar
            </Button>
          )}
        </div>

        {/* Mobile/tablet — botão de login/conta (top right) */}
        <div className="lg:hidden">
          {user ? (
            <button
              onClick={onDashboard}
              aria-label="A minha conta"
              aria-current={view === "dashboard" ? "page" : undefined}
              className={`flex flex-col items-center gap-0.5 p-2 rounded-lg transition-colors
                ${view === "dashboard" ? "text-electric" : "text-ink-soft"}`}
            >
              <UserIcon size={22} active={view === "dashboard"} />
            </button>
          ) : (
            <button
              onClick={onLogin}
              aria-label="Entrar na conta"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-maroon text-white text-[13px] font-semibold"
            >
              Entrar
            </button>
          )}
        </div>
      </nav>

      {/* ── Bottom nav mobile + tablet ─────────────────────────── */}
      <nav
        aria-label="Navegação rápida"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-[900] h-16
        bg-cream-dark border-t border-line flex items-center justify-around px-2 safe-area-inset-bottom"
      >
        {NAV.map(({ label, key, icon: Icon }) => (
          <button
            key={key}
            onClick={() => go(key)}
            aria-current={view === key ? "page" : undefined}
            aria-label={label}
            className={`flex flex-col items-center gap-1 ${itemPad} py-2 rounded-xl transition-colors
              ${view === key ? "text-electric" : "text-ink-faint"}`}
          >
            <Icon size={22} active={view === key} aria-hidden="true" />
            <span className="text-[10px] font-semibold tracking-wide" aria-hidden="true">
              {label}
            </span>
          </button>
        ))}

        {/* Conta / Entrar */}
        {user ? (
          <button
            onClick={onDashboard}
            aria-current={view === "dashboard" ? "page" : undefined}
            aria-label="A minha conta"
            className={`flex flex-col items-center gap-1 ${itemPad} py-2 rounded-xl transition-colors
              ${view === "dashboard" ? "text-electric" : "text-ink-faint"}`}
          >
            <UserIcon size={22} active={view === "dashboard"} aria-hidden="true" />
            <span className="text-[10px] font-semibold tracking-wide" aria-hidden="true">
              Conta
            </span>
          </button>
        ) : (
          <button
            onClick={onLogin}
            aria-label="Entrar na conta"
            className={`flex flex-col items-center gap-1 ${itemPad} py-2 rounded-xl text-ink-faint transition-colors`}
          >
            <LoginIcon size={22} aria-hidden="true" />
            <span className="text-[10px] font-semibold tracking-wide" aria-hidden="true">
              Entrar
            </span>
          </button>
        )}

        {/* Instalar PWA — só aparece em mobile quando ainda não está instalada */}
        {pwa.show && (
          <div className="relative">
            <button
              onClick={handleInstall}
              aria-label={pwa.isIos ? "Como instalar a app" : pwa.ready ? "Instalar app" : "Instalar app (a aguardar…)"}
              aria-expanded={pwa.isIos ? showIosHint : undefined}
              className={`flex flex-col items-center gap-1 ${itemPad} py-2 rounded-xl transition-colors
                ${pwa.ready || pwa.isIos ? "text-maroon" : "text-ink-faint"}`}
            >
              <InstallIcon size={22} aria-hidden="true" />
              <span className="text-[10px] font-semibold tracking-wide" aria-hidden="true">
                Instalar
              </span>
            </button>

            {/* Tooltip iOS — instruções de instalação */}
            {pwa.isIos && showIosHint && (
              <>
                {/* Overlay para fechar ao clicar fora */}
                <div
                  className="fixed inset-0 z-[800]"
                  onClick={() => setShowIosHint(false)}
                  aria-hidden="true"
                />
                <div
                  role="tooltip"
                  className="absolute bottom-[calc(100%+12px)] right-0 z-[910] w-64
                    bg-navy text-cream rounded-xl shadow-lift p-4 text-[13px] leading-relaxed"
                >
                  <p className="font-semibold mb-1.5">Instalar no iPhone / iPad</p>
                  <p className="text-cream/80">
                    No Safari, toca em <strong className="text-cream">Partilhar</strong> <span aria-hidden="true">⎙</span> e depois em{" "}
                    <strong className="text-cream">"Adicionar ao ecrã inicial"</strong>.
                  </p>
                  {/* Seta apontada para baixo */}
                  <div aria-hidden="true" className="absolute -bottom-2 right-5 w-4 h-2 overflow-hidden">
                    <div className="w-4 h-4 bg-navy rotate-45 -translate-y-2" />
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </nav>
    </>
  );
}

/* ── Ícones SVG ──────────────────────────────────────────────── */
function HomeIcon({ size = 24, active }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" focusable="false">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z" />
      <path d="M9 21V12h6v9" />
    </svg>
  );
}

function GridIcon({ size = 24, active }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" focusable="false">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function InfoIcon({ size = 24, active }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

function UserIcon({ size = 24, active }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" focusable="false">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function LoginIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" focusable="false">
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <polyline points="10 17 15 12 10 7" />
      <line x1="15" y1="12" x2="3" y2="12" />
    </svg>
  );
}

function InstallIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" focusable="false">
      <path d="M12 3v13" />
      <path d="M8 12l4 4 4-4" />
      <path d="M3 18h18" />
      <path d="M3 21h18" />
    </svg>
  );
}
