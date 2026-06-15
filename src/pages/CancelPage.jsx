import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useGetBookingAppointmentByToken } from '../servers/booking/hooks/useGetBookingAppointmentByToken.ts'
import { usePatchBookingAppointmentCancel } from '../servers/booking/hooks/usePatchBookingAppointmentCancel.ts'
import { Button, Spinner } from '../components/ui.jsx'
import { useCms } from '../context/CmsContext.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import { fmtDate, langToLocale } from '../utils.js'

export default function CancelPage() {
  const { token: cancelToken } = useParams()
  const [done, setDone] = useState(false)
  const { t } = useCms()
  const { currentLang } = useLanguage()
  const dateLocale = langToLocale(currentLang)

  const STATUS_LABEL = {
    pending: t('ui.status.pendente'),
    confirmed: t('ui.status.confirmada'),
    completed: t('ui.status.concluida'),
    cancelled: t('ui.status.cancelada'),
  }

  const { data: appt, isLoading, isError } = useGetBookingAppointmentByToken(cancelToken)

  const cancelMutation = usePatchBookingAppointmentCancel({
    mutation: {
      onSuccess: () => setDone(true),
    },
  })

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-5xl">💈</span>
          <h1 className="mt-4 text-2xl font-bold text-navy tracking-tight">{t('cancel.titulo')}</h1>
        </div>

        <div className="bg-paper border border-line rounded-2xl p-6 shadow-soft">
          {isLoading && (
            <div className="flex items-center justify-center py-8 gap-3 text-ink-soft">
              <Spinner dark />
              <span className="text-sm">{t('ui.a_carregar')}</span>
            </div>
          )}

          {isError && !isLoading && (
            <div className="text-center py-6">
              <p className="text-maroon font-semibold mb-1">{t('cancel.nao_encontrada')}</p>
              <p className="text-ink-soft text-sm">{t('cancel.nao_encontrada.mensagem')}</p>
            </div>
          )}

          {appt && !done && (
            <>
              {appt.status === 'cancelled' ? (
                <div className="text-center py-4">
                  <p className="text-ink-soft font-medium mb-1">{t('cancel.ja_cancelada')}</p>
                </div>
              ) : appt.status === 'completed' ? (
                <div className="text-center py-4">
                  <p className="text-ink-soft font-medium mb-1">{t('cancel.ja_concluida')}</p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-ink-soft mb-5">{t('cancel.confirmar_texto')}</p>

                  <div className="rounded-xl bg-cream-dark border border-line p-4 space-y-2.5 mb-6">
                    <Row label={t('ui.servico')} value={appt.service?.name ?? '—'} />
                    <Row label={t('ui.data')} value={appt.date ? fmtDate(appt.date, dateLocale) : '—'} />
                    <Row label={t('ui.hora')} value={appt.time ?? '—'} />
                    {appt.service?.price != null && (
                      <Row label={t('ui.preco')} value={`€${Number(appt.service.price).toFixed(2)}`} />
                    )}
                    <Row
                      label={t('ui.estado')}
                      value={STATUS_LABEL[appt.status] ?? appt.status}
                    />
                  </div>

                  {cancelMutation.isError && (
                    <p className="text-maroon text-sm mb-4 text-center">
                      {t('cancel.erro')}
                    </p>
                  )}

                  <Button
                    variant="danger"
                    className="w-full"
                    disabled={cancelMutation.isPending}
                    onClick={() => cancelMutation.mutate({ cancelToken })}
                  >
                    {cancelMutation.isPending ? (
                      <><Spinner /> {t('ui.a_cancelar')}</>
                    ) : (
                      t('cancel.confirmar_btn')
                    )}
                  </Button>
                </>
              )}
            </>
          )}

          {done && (
            <div className="text-center py-4 space-y-2">
              <p className="text-2xl">✅</p>
              <p className="font-semibold text-navy">{t('cancel.sucesso.titulo')}</p>
              <p className="text-ink-soft text-sm">
                {t('cancel.sucesso.mensagem')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-ink-faint">{label}</span>
      <span className="font-medium text-ink">{value}</span>
    </div>
  )
}
