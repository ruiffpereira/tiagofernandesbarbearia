import { useState } from 'react'
import { useGetBookingAppointmentByToken } from '../servers/booking/hooks/useGetBookingAppointmentByToken.ts'
import { usePatchBookingAppointmentCancel } from '../servers/booking/hooks/usePatchBookingAppointmentCancel.ts'
import { Button, Spinner } from '../components/ui.jsx'
import { fmtDate } from '../utils.js'

const STATUS_LABEL = {
  pending: 'Pendente',
  confirmed: 'Confirmada',
  completed: 'Concluída',
  cancelled: 'Cancelada',
}

export default function CancelPage({ cancelToken }) {
  const [done, setDone] = useState(false)

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
          <h1 className="mt-4 text-2xl font-bold text-navy tracking-tight">Cancelar marcação</h1>
        </div>

        <div className="bg-paper border border-line rounded-2xl p-6 shadow-soft">
          {isLoading && (
            <div className="flex items-center justify-center py-8 gap-3 text-ink-soft">
              <Spinner dark />
              <span className="text-sm">A carregar marcação…</span>
            </div>
          )}

          {isError && !isLoading && (
            <div className="text-center py-6">
              <p className="text-maroon font-semibold mb-1">Marcação não encontrada</p>
              <p className="text-ink-soft text-sm">O link pode ser inválido ou já ter expirado.</p>
            </div>
          )}

          {appt && !done && (
            <>
              {appt.status === 'cancelled' ? (
                <div className="text-center py-4">
                  <p className="text-ink-soft font-medium mb-1">Esta marcação já foi cancelada.</p>
                </div>
              ) : appt.status === 'completed' ? (
                <div className="text-center py-4">
                  <p className="text-ink-soft font-medium mb-1">Esta marcação já foi concluída.</p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-ink-soft mb-5">Tens a certeza que queres cancelar esta marcação?</p>

                  <div className="rounded-xl bg-cream-dark border border-line p-4 space-y-2.5 mb-6">
                    <Row label="Serviço" value={appt.service?.name ?? '—'} />
                    <Row label="Data" value={appt.date ? fmtDate(appt.date) : '—'} />
                    <Row label="Hora" value={appt.time ?? '—'} />
                    {appt.service?.price != null && (
                      <Row label="Preço" value={`€${Number(appt.service.price).toFixed(2)}`} />
                    )}
                    <Row
                      label="Estado"
                      value={STATUS_LABEL[appt.status] ?? appt.status}
                    />
                  </div>

                  {cancelMutation.isError && (
                    <p className="text-maroon text-sm mb-4 text-center">
                      Não foi possível cancelar. Tenta novamente ou contacta-nos.
                    </p>
                  )}

                  <Button
                    variant="danger"
                    className="w-full"
                    disabled={cancelMutation.isPending}
                    onClick={() => cancelMutation.mutate({ cancelToken })}
                  >
                    {cancelMutation.isPending ? (
                      <><Spinner /> A cancelar…</>
                    ) : (
                      'Confirmar cancelamento'
                    )}
                  </Button>
                </>
              )}
            </>
          )}

          {done && (
            <div className="text-center py-4 space-y-2">
              <p className="text-2xl">✅</p>
              <p className="font-semibold text-navy">Marcação cancelada</p>
              <p className="text-ink-soft text-sm">
                Recebeste um email de confirmação. Esperamos ver-te em breve!
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
