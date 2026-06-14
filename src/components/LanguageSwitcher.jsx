import { useState } from "react";
import { useLanguage } from "../context/LanguageContext.jsx";
import { LangFlag } from "../utils/langFlag.jsx";

export default function LanguageSwitcher({ className = "" }) {
  const { currentLang, languages, changeLanguage } = useLanguage();
  const [open, setOpen] = useState(false);

  if (languages.length <= 1) return null;

  const current = languages.find((l) => l.code === currentLang) ?? languages[0];

  function select(code) {
    changeLanguage(code);
    setOpen(false);
  }

  return (
    <div className={`relative ${className}`}>
      {/* Trigger — bandeira + iniciais */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Escolher língua"
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg border border-line
          hover:border-line-strong text-ink-soft hover:text-navy transition-colors"
      >
        <LangFlag code={current.code} />
        <span className="text-[13px] font-bold uppercase tracking-wide">{current.code}</span>
        <ChevronIcon open={open} />
      </button>

      {open && (
        <>
          {/* Overlay para fechar ao clicar fora */}
          <div
            className="fixed inset-0 z-[910]"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <ul
            role="listbox"
            aria-label="Línguas disponíveis"
            className="absolute right-0 top-[calc(100%+6px)] z-[920] min-w-[170px]
              bg-paper border border-line rounded-xl shadow-lift py-1 overflow-hidden animate-slideDown"
          >
            {languages.map((lang) => {
              const active = lang.code === currentLang;
              return (
                <li key={lang.code} role="option" aria-selected={active}>
                  <button
                    type="button"
                    onClick={() => select(lang.code)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors
                      ${
                        active
                          ? "bg-electric/10 text-electric font-semibold"
                          : "text-ink-soft hover:bg-line hover:text-navy"
                      }`}
                  >
                    <LangFlag code={lang.code} />
                    <span className="font-bold uppercase text-xs w-5 shrink-0">{lang.code}</span>
                    <span className="truncate flex-1">{lang.name}</span>
                    {active && <CheckIcon />}
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}

function ChevronIcon({ open }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`transition-transform ${open ? "rotate-180" : ""}`}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="ml-auto shrink-0"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
