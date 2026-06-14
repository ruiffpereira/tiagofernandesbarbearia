import { useState } from 'react'
import { storage } from '../storage.js'
import { generateSlots, nextWorkdays, fmtShort } from '../utils.js'
import { Button, Spinner, Modal, Label, Textarea } from './ui.jsx'
import { useCms } from '../context/CmsContext.jsx'

export default function EditModal({ booking, onClose, onSaved }) {
  const { t } = useCms()
  const [date, setDate] = useState(booking.date)
  const [slot, setSlot] = useState(booking.time)
  const [notes, setNotes] = useState(booking.notes || '')
  const [loading, setLoading] = useState(false)

  const avail = nextWorkdays(7)
  const free = date
    ? generateSlots().filter(
        (s) => !storage.getBookings()
          .filter((b) => b.date === date && b.barberId === booking.barberId && b.status !== 'cancelled' && b.id !== booking.id)
          .map((b) => b.time)
          .includes(s),
      )
    : []

  function save() {
    setLoading(true)
    setTimeout(() => {
      storage.saveBookings(
        storage.getBookings().map((b) => (b.id === booking.id ? { ...b, date, time: slot, notes } : b)),
      )
      setLoading(false); onSaved()
    }, 400)
  }

  return (
    <Modal title={t('edit.titulo')} onClose={onClose} maxWidth="max-w-lg">
      <div className="flex flex-col gap-4">
        <div>
          <Label>{t('edit.nova_data')}</Label>
          <div className="flex gap-2 flex-wrap mt-2.5">
            {avail.map((d) => {
              const f = fmtShort(d); const active = date === d
              return (
                <button key={d} onClick={() => { setDate(d); setSlot('') }}
                  className={`px-3.5 py-2 rounded-full border-[1.5px] text-[13px] font-medium transition-all
                    ${active ? 'bg-navy border-navy text-cream' : 'bg-white border-line text-ink-soft hover:border-line-strong'}`}>
                  {f.day} {f.num}
                </button>
              )
            })}
          </div>
        </div>
        {date && (
          <div>
            <Label>{t('edit.nova_hora')}</Label>
            <div className="flex gap-2 flex-wrap mt-2.5">
              {free.map((sl) => (
                <button key={sl} onClick={() => setSlot(sl)}
                  className={`px-3.5 py-2 rounded-lg border-[1.5px] text-[13px] font-medium transition-all
                    ${slot === sl ? 'bg-navy border-navy text-cream' : 'bg-white border-line text-ink-soft hover:border-line-strong'}`}>
                  {sl}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="flex flex-col gap-1.5">
          <Label>{t('ui.notas')}</Label>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t('ui.notas.placeholder')} />
        </div>
        <Button variant="primary" disabled={!slot || loading} onClick={save}>
          {loading ? <Spinner /> : t('edit.guardar')}
        </Button>
      </div>
    </Modal>
  )
}
