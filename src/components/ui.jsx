import { useEffect, useRef, useId } from 'react'

const VARIANTS = {
  primary: 'bg-maroon text-white hover:bg-maroon-light shadow-soft',
  accent:  'bg-electric text-white hover:bg-electric-light shadow-soft',
  ghost:   'bg-transparent text-navy border border-line hover:bg-navy/10 hover:border-line-strong',
  surface: 'bg-paper text-ink border border-line hover:bg-cream-dark',
  danger:  'bg-maroon/10 text-maroon border border-maroon/25 hover:bg-maroon/20',
}

export function Button({ variant = 'primary', size = 'md', className = '', children, ...props }) {
  const sizes = size === 'sm' ? 'px-4 py-2 text-[13px] rounded-lg' : 'px-6 py-3 text-sm rounded-[10px]'
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-semibold tracking-tight
        transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed
        disabled:!shadow-none disabled:hover:!translate-y-0 hover:-translate-y-px
        ${VARIANTS[variant]} ${sizes} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function Spinner({ dark }) {
  return <span className={`spinner ${dark ? 'spinner-dark' : ''}`} aria-hidden="true" />
}

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function Modal({ title, onClose, children, maxWidth = 'max-w-md' }) {
  const dialogRef = useRef(null)
  const titleId = useId()

  useEffect(() => {
    const prev = document.activeElement
    const el = dialogRef.current
    if (!el) return

    // Move foco para o primeiro elemento focalizável dentro do modal
    const focusable = el.querySelectorAll(FOCUSABLE)
    if (focusable.length) focusable[0].focus()

    function trapFocus(e) {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key !== 'Tab') return
      const els = Array.from(el.querySelectorAll(FOCUSABLE))
      if (!els.length) return
      const first = els[0]
      const last = els[els.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus() }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }

    document.addEventListener('keydown', trapFocus)
    return () => {
      document.removeEventListener('keydown', trapFocus)
      prev?.focus()
    }
  }, [onClose])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      ref={dialogRef}
      className="fixed inset-0 z-[1000] flex items-center justify-center p-5 bg-black/70 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className={`w-full ${maxWidth} max-h-[90vh] overflow-y-auto bg-paper border border-line
          rounded-xl2 shadow-lift animate-fadeUp`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-line">
          <h2 id={titleId} className="text-[19px] font-bold text-navy tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="w-8 h-8 rounded-full border border-line bg-paper text-ink-soft
              flex items-center justify-center hover:bg-cream-dark transition-colors text-[15px]"
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

export function Label({ children, htmlFor }) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-[11px] tracking-wider uppercase text-ink-faint font-semibold"
    >
      {children}
    </label>
  )
}

export function Input({ id, ...props }) {
  return (
    <input
      id={id}
      className="w-full bg-paper border-[1.5px] border-line rounded-[10px] text-ink text-sm
        px-3.5 py-2.5 outline-none transition-colors focus:border-electric placeholder:text-ink-faint"
      {...props}
    />
  )
}

export function Textarea({ id, ...props }) {
  return (
    <textarea
      id={id}
      className="w-full bg-paper border-[1.5px] border-line rounded-[10px] text-ink text-sm
        px-3.5 py-2.5 outline-none transition-colors focus:border-electric placeholder:text-ink-faint
        resize-y min-h-[70px]"
      {...props}
    />
  )
}
