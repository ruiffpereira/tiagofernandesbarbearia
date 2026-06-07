import { useCms } from '../context/CmsContext.jsx'

export default function AboutPage() {
  const { t } = useCms()

  const especialidades = [
    t('sobre.especialidade.1'),
    t('sobre.especialidade.2'),
    t('sobre.especialidade.3'),
    t('sobre.especialidade.4'),
  ].filter(Boolean)

  const foto = t('sobre.foto')

  return (
    <main aria-label="Sobre a barbearia" className="px-5 sm:px-10 lg:px-16 py-10 lg:py-16 min-h-[calc(100vh-64px)]">
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div className="aspect-[4/5] bg-cream-dark rounded-xl2 border border-line relative overflow-hidden
          flex flex-col items-center justify-center gap-2.5
          [background-image:repeating-linear-gradient(135deg,transparent,transparent_18px,rgba(255,255,255,0.04)_18px,rgba(255,255,255,0.04)_36px)]">
          <img
            src={foto}
            alt={`${t('hero.titulo')} — foto`}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
              e.currentTarget.nextSibling.style.display = 'flex'
            }}
          />
          <div style={{ display: 'none' }} className="flex flex-col items-center justify-center gap-2.5 absolute inset-0">
            <img src="/logo.png" alt="" className="w-32 h-32 object-contain opacity-90" />
            <span aria-hidden="true" className="text-[11px] text-ink-faint tracking-wider uppercase">Foto do Tiago</span>
          </div>
        </div>

        <article>
          <p aria-hidden="true" className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-maroon/[0.1] border border-maroon/25
            rounded-full text-xs font-semibold text-maroon tracking-wide mb-3.5">
            {t('sobre.label')}
          </p>
          <h1 className="text-[clamp(26px,4vw,40px)] font-extrabold text-navy tracking-tight mb-4 leading-tight">
            {t('sobre.titulo')}
          </h1>
          <p className="text-ink-soft text-[15px] leading-relaxed mb-3.5">
            {t('sobre.corpo1')}
          </p>
          <p className="text-ink-soft text-[15px] leading-relaxed mb-6">
            {t('sobre.corpo2')}
          </p>
          <ul aria-label="Especialidades" className="flex gap-2.5 flex-wrap list-none p-0 m-0">
            {especialidades.map((esp) => (
              <li key={esp} className="px-3.5 py-1.5 rounded-full bg-navy/[0.08] text-navy text-xs font-semibold">{esp}</li>
            ))}
          </ul>
        </article>
      </div>
    </main>
  )
}
