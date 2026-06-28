import { useCms } from '../context/CmsContext.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import { googleCalendarUrl, appointmentIcsUrl } from '../utils/calendar.js'

/**
 * Bloco "Adicionar ao calendário" para uma marcação. Mostra:
 *  - link do Google Calendar (sempre que há serviço/data/hora);
 *  - link de download .ics (só quando há cancelToken).
 *
 * Todos os labels e os textos do evento (título/descrição) vêm do CMS na língua
 * atual, com fallback PT hardcoded (o `t()` devolve '' para chaves em falta).
 */
export default function AddToCalendar({ booking, compact = false }) {
  const { t } = useCms()
  const { currentLang } = useLanguage()
  if (!booking?.date || !booking?.time) return null

  const service = booking.serviceName || ''
  const title = (t('calendar.event.title') || '{{servico}}').replace('{{servico}}', service)
  const details = (t('calendar.event.description') || 'A sua marcação para {{servico}}.').replace(
    '{{servico}}',
    service,
  )

  const googleUrl = googleCalendarUrl({
    title,
    details,
    date: booking.date,
    time: booking.time,
    duration: booking.duration || 30,
  })
  const icsUrl = booking.cancelToken ? appointmentIcsUrl(booking.cancelToken, currentLang) : null

  const linkCls =
    'inline-flex items-center gap-1.5 text-[13px] font-medium text-electric hover:underline'

  return (
    <div className={compact ? '' : 'mt-2'}>
      {!compact && (
        <p className="text-[11px] font-bold tracking-wider uppercase text-ink-faint mb-1.5">
          {t('calendar.add') || 'Adicionar ao calendário'}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
        <a href={googleUrl} target="_blank" rel="noopener noreferrer" className={linkCls}>
          <span aria-hidden="true">📅</span> {t('calendar.google') || 'Google Calendar'}
        </a>
        {icsUrl && (
          <a href={icsUrl} className={linkCls}>
            <span aria-hidden="true">⬇</span> {t('calendar.download') || 'Descarregar (.ics)'}
          </a>
        )}
      </div>
    </div>
  )
}
