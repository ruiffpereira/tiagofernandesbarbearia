import { useState } from 'react'
import { Button } from './ui.jsx'

const NAV = [
  ['Início', 'home'],
  ['Trabalhos', 'gallery'],
  ['Sobre', 'about'],
]

export default function Navbar({ user, view, setView, onLogin, onLogout, onDashboard }) {
  const [open, setOpen] = useState(false)

  const go = (key) => { setView(key); setOpen(false) }

  return (
    <nav className="sticky top-0 z-[900] h-16 bg-cream border-b border-line
      px-4 sm:px-6 lg:px-10 flex items-center justify-between">
      {/* Logo */}
      <button onClick={() => go('home')} className="flex items-center gap-2.5 group">
        <img src="/logo.png" alt="Logo Tiago Fernandes" className="h-11 w-11 object-contain" />
        <span className="text-[15px] font-extrabold text-navy tracking-tight leading-none hidden xs:block sm:block">
          TIAGO FERNANDES
          <span className="block text-[9px] font-semibold tracking-[0.25em] text-maroon mt-0.5">BARBEARIA</span>
        </span>
      </button>

      {/* Desktop */}
      <div className="hidden md:flex items-center gap-7">
        {NAV.map(([label, key]) => (
          <button
            key={key}
            onClick={() => go(key)}
            className={`relative text-sm py-1.5 transition-colors ${
              view === key ? 'text-navy font-semibold' : 'text-ink-soft font-medium hover:text-navy'
            }`}
          >
            {label}
            {view === key && <span className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-navy rounded-full" />}
          </button>
        ))}
        {user ? (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onDashboard}>Conta</Button>
            <Button variant="surface" size="sm" onClick={onLogout}>Sair</Button>
          </div>
        ) : (
          <Button variant="primary" size="sm" onClick={onLogin}>Entrar</Button>
        )}
      </div>

      {/* Mobile toggle */}
      <button
        className="md:hidden text-navy text-[22px] p-1"
        onClick={() => setOpen((o) => !o)}
        aria-label="Menu"
      >
        {open ? '✕' : '☰'}
      </button>

      {/* Mobile dropdown */}
      {open && (
        <div className="absolute top-16 left-0 right-0 bg-paper border-b border-line shadow-soft
          px-6 py-4 flex flex-col gap-2.5 animate-slideDown md:hidden">
          {NAV.map(([label, key]) => (
            <button
              key={key}
              onClick={() => go(key)}
              className={`text-left py-2 text-[15px] ${
                view === key ? 'text-navy font-semibold' : 'text-ink-soft font-medium'
              }`}
            >
              {label}
            </button>
          ))}
          <div className="h-px bg-line my-1" />
          {user ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => { onDashboard(); setOpen(false) }}>A minha conta</Button>
              <Button variant="surface" size="sm" onClick={() => { onLogout(); setOpen(false) }}>Sair</Button>
            </>
          ) : (
            <Button variant="primary" size="sm" onClick={() => { onLogin(); setOpen(false) }}>Entrar</Button>
          )}
        </div>
      )}
    </nav>
  )
}
