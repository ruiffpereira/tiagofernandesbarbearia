export default function AboutPage() {
  const tags = ['Degradê', 'Barba', 'Clássicos', 'Tratamentos']
  return (
    <main className="px-5 sm:px-10 lg:px-16 py-10 lg:py-16 min-h-[calc(100vh-64px)]">
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div className="aspect-[4/5] bg-cream-dark rounded-xl2 border border-line relative overflow-hidden
          flex flex-col items-center justify-center gap-2.5
          [background-image:repeating-linear-gradient(135deg,transparent,transparent_18px,rgba(255,255,255,0.04)_18px,rgba(255,255,255,0.04)_36px)]">
          <img src="/logo.png" alt="Logo Tiago Fernandes" className="w-32 h-32 object-contain opacity-90 relative" />
          <span className="text-[11px] text-ink-faint tracking-wider uppercase relative">Foto do Tiago</span>
        </div>
        <div>
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-maroon/[0.1] border border-maroon/25
            rounded-full text-xs font-semibold text-maroon tracking-wide mb-3.5">Sobre</span>
          <h1 className="text-[clamp(26px,4vw,40px)] font-extrabold text-navy tracking-tight mb-4 leading-tight">
            Paixão pela arte de barbear
          </h1>
          <p className="text-ink-soft text-[15px] leading-relaxed mb-3.5">
            O Tiago Fernandes é barbeiro com formação sólida e dedicação ao detalhe. A barbearia em Braga
            abriu portas com uma missão: fazer cada cliente sair a sentir-se no seu melhor.
          </p>
          <p className="text-ink-soft text-[15px] leading-relaxed mb-6">
            Especialista em cortes modernos, degradês e tratamentos clássicos — combinando técnicas
            tradicionais com um olhar atual.
          </p>
          <div className="flex gap-2.5 flex-wrap">
            {tags.map((t) => (
              <span key={t} className="px-3.5 py-1.5 rounded-full bg-navy/[0.08] text-navy text-xs font-semibold">{t}</span>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
