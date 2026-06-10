import { useCms } from '../context/CmsContext.jsx'

export default function GalleryPage() {
  const { t } = useCms()

  const photos = Array.from({ length: 9 }, (_, i) => t(`galeria.foto.${i + 1}`))

  return (
    <main aria-label="Galeria de trabalhos" className="px-5 sm:px-10 lg:px-16 py-10 lg:py-16 min-h-[calc(100vh-64px)]">
      <div className="max-w-5xl mx-auto">
        <p aria-hidden="true" className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-maroon/[0.1] border border-maroon/25
          rounded-full text-xs font-semibold text-maroon tracking-wide mb-3.5">
          {t('galeria.label')}
        </p>
        <h1 className="text-[clamp(30px,4.5vw,50px)] font-extrabold text-navy tracking-tight mb-3.5 leading-tight">
          {t('galeria.titulo')}
        </h1>
        <p className="text-ink-soft text-base max-w-lg mb-9 leading-relaxed">
          {t('galeria.descricao')}
        </p>
        <ul aria-label="Fotografias de trabalhos" className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3.5 list-none p-0 m-0">
          {photos.map((src, i) => (
            <li key={i} className="aspect-[1/1.15] bg-cream-dark rounded-xl2 border border-line overflow-hidden relative">
              {src && (
                <img
                  src={src}
                  alt={`Trabalho ${i + 1}`}
                  width="1000"
                  height="1150"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              )}
            </li>
          ))}
        </ul>
      </div>
    </main>
  )
}
