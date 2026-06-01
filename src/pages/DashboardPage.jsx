import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../AuthContext.jsx'
import {
  useGetBookingMyAppointments,
  getBookingMyAppointmentsQueryKey,
  usePatchBookingAppointmentCancel,
} from '../servers/booking/index.ts'
import BookingCard from '../components/BookingCard.jsx'
import { Button, Spinner } from '../components/ui.jsx'

export default function DashboardPage({ user, onBook, onHome, onLogout }) {
  const { user: authUser } = useAuth()
  const qc = useQueryClient()

  const { data: upcoming = [], isLoading: loadingUp } = useGetBookingMyAppointments(
    { status: 'upcoming' },
    { query: { enabled: !!authUser } }
  )

  const { data: past = [], isLoading: loadingPast } = useGetBookingMyAppointments(
    { status: 'past' },
    { query: { enabled: !!authUser } }
  )

  const [cancelId, setCancelId] = useState(null)

  const cancelM = usePatchBookingAppointmentCancel({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getBookingMyAppointmentsQueryKey({ status: 'upcoming' }) })
        qc.invalidateQueries({ queryKey: getBookingMyAppointmentsQueryKey({ status: 'past' }) })
        setCancelId(null)
      },
      onError: (e) => alert(e.message || 'Erro ao cancelar'),
    },
  })

  const account = [
    ['Nome', user.name],
    ['Email', user.email],
    ['Telemóvel', user.phone || '—'],
  ]

  return (
    <main className="min-h-[calc(100vh-64px)]">
      <div className="bg-cream-dark border-b border-line px-5 sm:px-10 lg:px-16 py-7">
        <div className="max-w-4xl mx-auto">
          <button onClick={onHome} className="text-ink-faint text-[13px] font-medium mb-3.5 inline-flex items-center gap-1.5">
            ← Página inicial
          </button>
          <div className="flex justify-between items-end flex-wrap gap-4">
            <div>
              <h1 className="text-[clamp(22px,3vw,32px)] font-extrabold text-navy tracking-tight">
                Olá, <span className="text-maroon">{user.name.split(' ')[0]}</span>
              </h1>
              <p className="text-ink-faint text-[13px] mt-1">{user.email}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="primary" onClick={onBook}>+ Nova marcação</Button>
              <Button variant="surface" onClick={onLogout}>Sair</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 sm:px-10 lg:px-16 py-7 lg:py-10">

        {/* Próximas marcações */}
        <section className="mb-10">
          <div className="flex items-center gap-2.5 mb-1.5">
            <h2 className="text-xl font-bold text-navy">Próximas marcações</h2>
            {upcoming.length > 0 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold
                tracking-wider uppercase bg-emerald-500/15 text-emerald-600">{upcoming.length}</span>
            )}
          </div>
          <p className="text-ink-faint text-[13px] mb-4">
            {upcoming.length === 0 && !loadingUp ? 'Nenhuma agendada.' : 'Podes cancelar até à data.'}
          </p>

          {loadingUp ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : upcoming.length === 0 ? (
            <div className="bg-paper border-[1.5px] border-dashed border-line-strong rounded-xl2 py-10 px-6 text-center">
              <div className="text-3xl mb-2.5 opacity-40">📅</div>
              <p className="text-ink-faint mb-4 text-sm">Sem marcações</p>
              <Button variant="primary" size="sm" onClick={onBook}>Marcar agora</Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {upcoming.map((b) => (
                <BookingCard
                  key={b.appointmentId}
                  booking={normalise(b)}
                  onCancel={() => setCancelId(b.cancelToken)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Histórico */}
        {(past.length > 0 || loadingPast) && (
          <section className="mb-10">
            <h2 className="text-xl font-bold text-navy mb-1.5">Histórico</h2>
            {loadingPast ? (
              <div className="flex justify-center py-4"><Spinner /></div>
            ) : (
              <>
                <p className="text-ink-faint text-[13px] mb-4">{past.length} marcação(ões)</p>
                <div className="flex flex-col gap-2.5">
                  {past.map((b) => <BookingCard key={b.appointmentId} booking={normalise(b)} isPast />)}
                </div>
              </>
            )}
          </section>
        )}

        {/* Dados da conta */}
        <section className="bg-paper border border-line rounded-xl2 p-6">
          <h3 className="text-[17px] font-bold text-navy mb-4">Dados da conta</h3>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-3.5">
            {account.map(([k, v]) => (
              <div key={k} className="bg-white rounded-[10px] px-3.5 py-3 border border-line">
                <p className="text-ink-faint text-[10px] font-bold tracking-wider uppercase mb-1">{k}</p>
                <p className="text-ink text-sm font-medium break-all">{v}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Modal de confirmação de cancelamento */}
      {cancelId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9000] p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold text-navy mb-2">Cancelar marcação</h3>
            <p className="text-ink-soft text-sm leading-relaxed mb-5">Tens a certeza? Esta ação não pode ser revertida.</p>
            <div className="flex gap-2">
              <Button variant="danger" className="flex-1" disabled={cancelM.isPending}
                onClick={() => cancelM.mutate({ cancelToken: cancelId })}>
                {cancelM.isPending ? <Spinner /> : 'Sim, cancelar'}
              </Button>
              <Button variant="surface" className="flex-1" onClick={() => setCancelId(null)}>Voltar</Button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

function normalise(b) {
  return {
    id: b.appointmentId,
    serviceName: b.service?.name ?? '—',
    servicePrice: b.service?.price ?? 0,
    date: b.date,
    time: b.time,
    status: b.status,
    cancelToken: b.cancelToken,
    notes: b.notes,
    barberName: 'Tiago Fernandes',
    duration: b.service?.duration,
  }
}
