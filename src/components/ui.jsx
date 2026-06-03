// Pequenos blocos de UI reutilizáveis (botões, modais)

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
  return <span className={`spinner ${dark ? 'spinner-dark' : ''}`} />
}

export function Modal({ title, onClose, children, maxWidth = 'max-w-md' }) {
  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-5 bg-black/70 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className={`w-full ${maxWidth} max-h-[90vh] overflow-y-auto bg-paper border border-line
          rounded-xl2 shadow-lift animate-fadeUp`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-line">
          <h2 className="text-[19px] font-bold text-navy tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-line bg-paper text-ink-soft
              flex items-center justify-center hover:bg-cream-dark transition-colors text-[15px]"
          >
            ✕
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

export function Label({ children }) {
  return <label className="text-[11px] tracking-wider uppercase text-ink-faint font-semibold">{children}</label>
}

export function Input(props) {
  return (
    <input
      className="w-full bg-paper border-[1.5px] border-line rounded-[10px] text-ink text-sm
        px-3.5 py-2.5 outline-none transition-colors focus:border-electric placeholder:text-ink-faint"
      {...props}
    />
  )
}

export function Textarea(props) {
  return (
    <textarea
      className="w-full bg-paper border-[1.5px] border-line rounded-[10px] text-ink text-sm
        px-3.5 py-2.5 outline-none transition-colors focus:border-electric placeholder:text-ink-faint
        resize-y min-h-[70px]"
      {...props}
    />
  )
}
