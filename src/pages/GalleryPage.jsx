export default function GalleryPage() {
  return (
    <main className="px-5 sm:px-10 lg:px-16 py-10 lg:py-16 min-h-[calc(100vh-64px)]">
      <div className="max-w-5xl mx-auto">
        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-maroon/[0.1] border border-maroon/25
          rounded-full text-xs font-semibold text-maroon tracking-wide mb-3.5">Trabalhos</span>
        <h1 className="text-[clamp(30px,4.5vw,50px)] font-extrabold text-navy tracking-tight mb-3.5 leading-tight">
          Galeria de cortes
        </h1>
        <p className="text-ink-soft text-base max-w-lg mb-9 leading-relaxed">
          Alguns dos trabalhos mais recentes feitos no estúdio. As fotografias reais serão adicionadas em breve.
        </p>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3.5">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="aspect-[1/1.15] bg-cream-dark rounded-xl2 border border-line
              flex items-center justify-center text-4xl opacity-50 text-ink-faint
              [background-image:repeating-linear-gradient(45deg,transparent,transparent_16px,rgba(31,41,51,0.03)_16px,rgba(31,41,51,0.03)_32px)]">
              💈
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
