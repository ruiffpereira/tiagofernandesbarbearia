import { useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../AuthContext.jsx'
import {
  useGetBookingServices,
  useGetBookingSlots,
  usePostBookingAppointment,
} from '../servers/booking/index.ts'
import { nextWorkdays, fmtDate, fmtShort } from '../utils.js'
import { Button, Spinner, Label, Textarea, Input } from './ui.jsx'

const BARBER_ID = import.meta.env.VITE_BARBER_USER_ID

export default function BookingWidget({ onRequireLogin, onBooked }) {
  const { user } = useAuth()
  const qc = useQueryClient()
  const [step, setStep] = useState(1)
  const [svc, setSvc] = useState(null)
  const [date, setDate] = useState('')
  const [slot, setSlot] = useState('')
  const [notes, setNotes] = useState('')
  const [client, setClient] = useState({ name: '', email: '', phone: '' })
  const [done, setDone] = useState(null)
  const [err, setErr] = useState('')

  useEffect(() => {
    if (user) setClient({ name: user.name || '', email: user.email || '', phone: user.phone || '' })
  }, [user])

  const { data: services = [], isLoading: loadingServices } = useGetBookingServices(
    { userId: BARBER_ID },
    { query: { staleTime: 5 * 60 * 1000 } }
  )

  const { data: slotsData, isLoading: loadingSlots } = useGetBookingSlots(
    { userId: BARBER_ID, date, serviceId: svc?.serviceId ?? '' },
    { query: { enabled: !!date && !!svc?.serviceId } }
  )

  const confirmM = usePostBookingAppointment({
    mutation: {
      onSuccess: (result) => {
        setDone({ ...result, serviceName: svc.name })
        onBooked?.()
      },
      onError: (e) => {
        setErr(e.message || 'Erro ao criar marcação. Tenta novamente.')
      },
    },
  })

  const avail = nextWorkdays(6)
  const free = Array.isArray(slotsData) ? slotsData : []

  function next() {
    if (step === 1 && !svc) return
    if (step === 2 && (!date || !slot)) return
    setStep((s) => s + 1)
  }
  const back = () => { setStep((s) => Math.max(1, s - 1)); setErr('') }

  function handleConfirm() {
    const { name, email, phone } = client
    if (!name || !email || !phone) { setErr('Nome, email e telemóvel são obrigatórios.'); return }
    setErr('')
    confirmM.mutate({
      data: {
        userId: BARBER_ID,
        serviceId: svc.serviceId,
        date,
        time: slot,
        notes: notes || undefined,
        clientName: name,
        clientEmail: email,
        clientPhone: phone,
      },
    })
  }

  function reset() {
    setStep(1); setSvc(null); setDate(''); setSlot(''); setNotes(''); setDone(null); setErr('')
    if (user) setClient({ name: user.name || '', email: user.email || '', phone: user.phone || '' })
    else setClient({ name: '', email: '', phone: '' })
  }

  if (done) {
    return (
      <div className="text-center py-3 px-1 animate-fadeUp">
        <div className="w-16 h-16 rounded-2xl mx-auto mb-4 bg-emerald-500/10 border border-emerald-500/30
          flex items-center justify-center text-3xl text-emerald-600">✓</div>
        <h3 className="text-xl font-bold text-navy mb-2 tracking-tight">Marcação confirmada!</h3>
        <p className="text-ink-soft text-sm mb-1">{done.serviceName}</p>
        <p className="text-ink-soft text-sm mb-2">{fmtDate(done.date)} · {done.time}</p>
        <p className="text-[12px] text-ink-faint mb-5">Receberás um email com os detalhes e link de cancelamento.</p>
        <Button variant="ghost" size="sm" onClick={reset}>Nova marcação</Button>
      </div>
    )
  }

  return (
    <div>
      {/* Indicador de passos */}
      <div className="flex gap-1.5 mb-4 items-center">
        {[1, 2, 3].map((n) => (
          <div key={n} className="flex items-center gap-1.5">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all
              ${step >= n ? 'bg-navy text-cream' : 'bg-white text-ink-faint border-[1.5px] border-line'}`}>
              {n}
            </div>
            {n < 3 && <div className={`w-6 h-0.5 transition-colors ${step > n ? 'bg-navy' : 'bg-line'}`} />}
          </div>
        ))}
        <span className="ml-2.5 text-xs text-ink-faint font-medium">
          {step === 1 && 'Serviço'}{step === 2 && 'Data & hora'}{step === 3 && 'Confirmar'}
        </span>
      </div>

      {/* Passo 1 — serviço */}
      {step === 1 && (
        <div className="animate-fadeUp">
          {loadingServices ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : (
            <div className="flex flex-col gap-2 max-h-[46vh] overflow-y-auto pr-1">
              {services.filter((s) => s.active !== false).map((s) => {
                const active = svc?.serviceId === s.serviceId
                return (
                  <button key={s.serviceId} onClick={() => setSvc(s)}
                    className={`flex items-center gap-3 p-3 rounded-[10px] border-[1.5px] text-left w-full transition-all
                      ${active ? 'bg-navy border-navy' : 'bg-white border-line hover:border-line-strong hover:bg-cream'}`}>
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0
                      ${active ? 'bg-white/10' : 'bg-cream-dark'}`}>✂️</div>
                    <div className="flex-1 min-w-0">
                      <div className={`font-semibold text-sm ${active ? 'text-cream' : 'text-ink'}`}>{s.name}</div>
                      <div className={`text-xs mt-0.5 ${active ? 'text-cream/70' : 'text-ink-faint'}`}>{s.duration} min</div>
                    </div>
                    <div className={`font-bold text-[15px] shrink-0 ${active ? 'text-cream' : 'text-navy'}`}>€{s.price}</div>
                  </button>
                )
              })}
            </div>
          )}
          <Button variant="primary" disabled={!svc} onClick={next} className="w-full mt-4">Continuar →</Button>
        </div>
      )}

      {/* Passo 2 — data e hora */}
      {step === 2 && (
        <div className="animate-fadeUp">
          <Label>Data</Label>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(64px,1fr))] gap-1.5 mt-2.5 mb-4">
            {avail.map((d) => {
              const f = fmtShort(d); const active = date === d
              return (
                <button key={d} onClick={() => { setDate(d); setSlot('') }}
                  className={`py-2.5 px-1 rounded-[10px] border-[1.5px] flex flex-col items-center gap-px transition-all
                    ${active ? 'bg-navy border-navy text-cream' : 'bg-white border-line text-ink hover:border-line-strong'}`}>
                  <span className="text-[10px] font-medium opacity-70 uppercase">{f.day}</span>
                  <span className="text-lg font-bold leading-none">{f.num}</span>
                  <span className="text-[10px] font-medium opacity-70 uppercase">{f.mon}</span>
                </button>
              )
            })}
          </div>
          {date && (
            <>
              <Label>Hora disponível</Label>
              {loadingSlots ? (
                <div className="flex justify-center py-4"><Spinner /></div>
              ) : free.length === 0 ? (
                <p className="text-ink-faint text-[13px] p-3.5 text-center bg-white rounded-[10px] mt-2.5">Sem horários disponíveis.</p>
              ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(70px,1fr))] gap-1.5 mt-2.5">
                  {free.map((sl) => (
                    <button key={sl} onClick={() => setSlot(sl)}
                      className={`py-2.5 px-1 rounded-[10px] border-[1.5px] text-[13px] font-medium transition-all
                        ${slot === sl ? 'bg-navy border-navy text-cream' : 'bg-white border-line text-ink hover:border-line-strong'}`}>
                      {sl}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
          <div className="flex gap-2 mt-4">
            <Button variant="ghost" onClick={back}>← Voltar</Button>
            <Button variant="primary" disabled={!date || !slot} onClick={next} className="flex-1">Continuar →</Button>
          </div>
        </div>
      )}

      {/* Passo 3 — dados + confirmar */}
      {step === 3 && (
        <div className="animate-fadeUp">
          <div className="bg-white rounded-[10px] p-4 border border-line mb-3.5">
            <div className="flex justify-between items-center mb-2.5">
              <span className="text-[11px] text-ink-faint font-semibold tracking-wider uppercase">Resumo</span>
              <span className="text-lg font-bold text-navy">€{svc.price}</span>
            </div>
            <div className="flex flex-col gap-1.5 text-[13.5px]">
              <div><span className="text-ink-faint">Serviço:</span> <span className="text-ink font-medium">{svc.name}</span></div>
              <div><span className="text-ink-faint">Data:</span> <span className="text-ink font-medium">{fmtDate(date)}</span></div>
              <div><span className="text-ink-faint">Hora:</span> <span className="text-ink font-medium">{slot}</span></div>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 mb-3.5">
            <p className="text-[11px] text-ink-faint font-semibold tracking-wider uppercase">Os teus dados</p>
            <div className="flex flex-col gap-1.5">
              <Label>Nome *</Label>
              <Input value={client.name} onChange={(e) => setClient((c) => ({ ...c, name: e.target.value }))}
                placeholder="O teu nome" readOnly={!!user} className={user ? 'bg-cream opacity-70' : ''} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Email *</Label>
              <Input type="email" value={client.email} onChange={(e) => setClient((c) => ({ ...c, email: e.target.value }))}
                placeholder="email@exemplo.com" readOnly={!!user} className={user ? 'bg-cream opacity-70' : ''} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Telemóvel *</Label>
              <Input type="tel" value={client.phone} onChange={(e) => setClient((c) => ({ ...c, phone: e.target.value }))}
                placeholder="+351 9XX XXX XXX" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 mb-3.5">
            <Label>Notas (opcional)</Label>
            <Textarea placeholder="Algum pedido especial?" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          {err && (
            <div className="bg-maroon/[0.08] border border-maroon/25 rounded-[10px] px-3.5 py-2.5 text-maroon text-[13px] mb-3">
              {err}
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="ghost" onClick={back}>← Voltar</Button>
            <Button variant="primary" onClick={handleConfirm} disabled={confirmM.isPending} className="flex-1">
              {confirmM.isPending ? <Spinner /> : 'Confirmar marcação'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
