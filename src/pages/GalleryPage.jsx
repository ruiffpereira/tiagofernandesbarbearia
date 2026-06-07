import { useCms } from '../context/CmsContext.jsx'

export default function GalleryPage() {
  const { t } = useCms()

  const photos = Array.from({ length: 9 }, (_, i) => t(`galeria.foto.${i + 1}`, ''))

  return (
    <main aria-label="Galeria de trabalhos" className="px-5 sm:px-10 lg:px-16 py-10 lg:py-16 min-h-[calc(100vh-64px)]">
      <div className="max-w-5xl mx-auto">
        <p aria-hidden="true" className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-maroon/[0.1] border border-maroon/25
          rounded-full text-xs font-semibold text-maroon tracking-wide mb-3.5">
          {t('galeria.label', 'Trabalhos')}
        </p>
        <h1 className="text-[clamp(30px,4.5vw,50px)] font-extrabold text-navy tracking-tight mb-3.5 leading-tight">
          {t('galeria.titulo', 'Galeria de cortes')}
        </h1>
        <p className="text-ink-soft text-base max-w-lg mb-9 leading-relaxed">
          {t('galeria.descricao', 'Alguns dos trabalhos mais recentes feitos no estúdio. As fotografias reais serão adicionadas em breve.')}
        </p>
        <ul aria-label="Fotografias de trabalhos" className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3.5 list-none p-0 m-0">
          {photos.map((src, i) => (
            <li key={i} className="aspect-[1/1.15] bg-cream-dark rounded-xl2 border border-line overflow-hidden relative">
              {src ? (
                <img
                  src={src}
                  alt={`Trabalho ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl opacity-50 text-ink-faint
                  [background-image:repeating-linear-gradient(45deg,transparent,transparent_16px,rgba(255,255,255,0.03)_16px,rgba(255,255,255,0.03)_32px)]"
                  aria-label={`Fotografia ${i + 1} — em breve`}>
                  <span aria-hidden="true">💈</span>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </main>
  )
}
