import { Button } from "./ui.jsx";

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

  return (
    <>
      {/* ── Top bar (desktop + mobile) ──────────────────────────── */}
      <nav
        className="sticky top-0 z-[900] h-16 bg-cream border-b border-line
        px-4 sm:px-6 lg:px-10 flex items-center justify-between"
      >
        {/* Logo */}
        <button
          onClick={() => go("home")}
          className="flex items-center gap-2.5"
        >
          <img
            src="/logo.png"
            alt="Logo Tiago Fernandes"
            className="h-11 w-11 object-contain"
          />
          <span className="text-[15px] font-extrabold text-navy tracking-tight leading-none hidden xs:block sm:block">
            TIAGO FERNANDES
            <span className="block text-[9px] font-semibold tracking-[0.25em] text-maroon mt-0.5">
              BARBEARIA
            </span>
          </span>
        </button>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-7">
          {NAV.map(({ label, key }) => (
            <button
              key={key}
              onClick={() => go(key)}
              className={`relative text-sm py-1.5 transition-colors ${
                view === key
                  ? "text-electric font-semibold"
                  : "text-ink-soft font-medium hover:text-navy"
              }`}
            >
              {label}
              {view === key && (
                <span className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-electric rounded-full" />
              )}
            </button>
          ))}
          {user ? (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={onDashboard}>
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

        {/* Mobile — botão de login/conta (top right) */}
        <div className="md:hidden">
          {user ? (
            <button
              onClick={onDashboard}
              className={`flex flex-col items-center gap-0.5 p-2 rounded-lg transition-colors
                ${view === "dashboard" ? "text-electric" : "text-ink-soft"}`}
            >
              <UserIcon size={22} />
            </button>
          ) : (
            <button
              onClick={onLogin}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-maroon text-white text-[13px] font-semibold"
            >
              Entrar
            </button>
          )}
        </div>
      </nav>

      {/* ── Bottom nav mobile ───────────────────────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-[900] h-16
        bg-cream border-t border-line flex items-center justify-around px-2 safe-area-inset-bottom"
      >
        {NAV.map(({ label, key, icon: Icon }) => (
          <button
            key={key}
            onClick={() => go(key)}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors
              ${view === key ? "text-electric" : "text-ink-faint"}`}
          >
            <Icon size={22} active={view === key} />
            <span className="text-[10px] font-semibold tracking-wide">
              {label}
            </span>
          </button>
        ))}
        {user ? (
          <button
            onClick={onDashboard}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors
              ${view === "dashboard" ? "text-electric" : "text-ink-faint"}`}
          >
            <UserIcon size={22} active={view === "dashboard"} />
            <span className="text-[10px] font-semibold tracking-wide">
              Conta
            </span>
          </button>
        ) : (
          <button
            onClick={onLogin}
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-ink-faint transition-colors"
          >
            <LoginIcon size={22} />
            <span className="text-[10px] font-semibold tracking-wide">
              Entrar
            </span>
          </button>
        )}
      </nav>
    </>
  );
}

/* ── Ícones SVG ──────────────────────────────────────────────── */
function HomeIcon({ size = 24, active }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 2.2 : 1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z" />
      <path d="M9 21V12h6v9" />
    </svg>
  );
}

function GridIcon({ size = 24, active }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 2.2 : 1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function InfoIcon({ size = 24, active }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 2.2 : 1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

function UserIcon({ size = 24, active }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 2.2 : 1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function LoginIcon({ size = 24 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <polyline points="10 17 15 12 10 7" />
      <line x1="15" y1="12" x2="3" y2="12" />
    </svg>
  );
}
