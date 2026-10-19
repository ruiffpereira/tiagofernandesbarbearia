import { useCms } from '../context/CmsContext.jsx'

// Texto exacto do consentimento, já com o nome do negócio — é o que vai em newsletterConsentText.
export function useNewsletterText() {
  const { t } = useCms()
  const negocio = t('hero.titulo')
  if (negocio) {
    const txt = t('newsletter.consentimento') || 'Quero receber novidades e promoções de {{negocio}} por email. Posso anular a qualquer momento.'
    return txt.split('{{negocio}}').join(negocio)
  }
  return t('newsletter.consentimento_sem_nome') || 'Quero receber novidades e promoções por email. Posso anular a qualquer momento.'
}

// Caixa nunca pré-marcada (RGPD) + ligação à Política de Privacidade.
export default function NewsletterConsent({ id, checked, onChange }) {
  const { t } = useCms()
  const text = useNewsletterText()
  return (
    <div className="flex items-start gap-2.5">
      <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 w-4 h-4 shrink-0 accent-maroon cursor-pointer" />
      <label htmlFor={id} className="text-[12.5px] text-ink-soft leading-snug cursor-pointer">
        {text}{' '}
        <a href="/privacidade" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 text-navy">
          {t('newsletter.privacidade') || 'Política de Privacidade'}
        </a>
      </label>
    </div>
  )
}
