import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../AuthContext.jsx'
import {
  useGetBookingMyAppointments,
  getBookingMyAppointmentsQueryKey,
  usePatchBookingAppointmentCancel,
} from '../servers/booking/index.ts'
import BookingCard from '../components/BookingCard.jsx'
import { Button, Spinner, Label, Input } from '../components/ui.jsx'

export default function DashboardPage({ user, onBook, onHome, onLogout }) {
  const { user: authUser, updateProfile } = useAuth()
  const qc = useQueryClient()

  // staleTime: 0 + refetchOnMount: 'always' garante dados frescos sempre que se navega para cá
  const { data: upcoming = [], isLoading: loadingUp } = useGetBookingMyAppointments(
    { status: 'upcoming' },
    { query: { enabled: !!authUser, staleTime: 0, refetchOnMount: 'always' } }
  )
  const { data: past = [], isLoading: loadingPast } = useGetBookingMyAppointments(
    { status: 'past' },
    { query: { enabled: !!authUser, staleTime: 0, refetchOnMount: 'always' } }
  )

  const [cancelId, setCancelId] = useState(null)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    nif: user.nif || '',
  })
  const [editLoading, setEditLoading] = useState(false)
  const [editErr, setEditErr] = useState('')
  const [editOk, setEditOk] = useState(false)

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

  async function handleUpdateProfile(e) {
    e.preventDefault()
    setEditErr('')
    setEditOk(false)
    if (!editForm.name || !editForm.email || !editForm.phone) {
      setEditErr('Nome, email e telemóvel são obrigatórios.')
      return
    }
    if (editForm.nif && !/^\d{9}$/.test(editForm.nif)) {
      setEditErr('NIF deve ter 9 dígitos.')
      return
    }
    setEditLoading(true)
    try {
      await updateProfile({
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
        nif: editForm.nif || null,
      })
      setEditOk(true)
      setEditing(false)
    } catch (e) {
      setEditErr(e.message || 'Erro ao guardar. Tenta novamente.')
    } finally {
      setEditLoading(false)
    }
  }

  const account = [
    ['Nome', user.name],
    ['Email', user.email],
    ['Telemóvel', user.phone || '—'],
    ['NIF', user.nif || '—'],
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
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[17px] font-bold text-navy">Dados da conta</h3>
            <Button variant="ghost" size="sm" onClick={() => { setEditing(!editing); setEditErr(''); setEditOk(false) }}>
              {editing ? 'Cancelar' : 'Editar'}
            </Button>
          </div>

          {editOk && !editing && (
            <div className="mb-4 px-3.5 py-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-[10px] text-emerald-400 text-[13px]">
              Perfil actualizado com sucesso.
            </div>
          )}

          {editing ? (
            <form onSubmit={handleUpdateProfile} className="flex flex-col gap-3.5">
              <div className="grid sm:grid-cols-2 gap-3.5">
                <div className="flex flex-col gap-1.5">
                  <Label>Nome *</Label>
                  <Input value={editForm.name} onChange={(e) => setEditForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Email *</Label>
                  <Input type="email" value={editForm.email} onChange={(e) => setEditForm(f => ({ ...f, email: e.target.value }))} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Telemóvel *</Label>
                  <Input type="tel" placeholder="+351 9XX XXX XXX" value={editForm.phone} onChange={(e) => setEditForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>NIF</Label>
                  <Input placeholder="000000000" maxLength={9} value={editForm.nif} onChange={(e) => setEditForm(f => ({ ...f, nif: e.target.value.replace(/\D/g, '') }))} />
                </div>
              </div>
              {editErr && (
                <div className="bg-maroon/[0.08] border border-maroon/25 rounded-[10px] px-3.5 py-2.5 text-maroon text-[13px]">
                  {editErr}
                </div>
              )}
              <Button variant="primary" type="submit" disabled={editLoading} className="self-start">
                {editLoading ? <Spinner /> : 'Guardar alterações'}
              </Button>
            </form>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-3.5">
              {account.map(([k, v]) => (
                <div key={k} className="bg-paper rounded-[10px] px-3.5 py-3 border border-line">
                  <p className="text-ink-faint text-[10px] font-bold tracking-wider uppercase mb-1">{k}</p>
                  <p className="text-ink text-sm font-medium break-all">{v}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Modal de confirmação de cancelamento */}
      {cancelId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9000] p-4">
          <div className="bg-paper rounded-2xl p-6 max-w-sm w-full shadow-lift border border-line">
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
