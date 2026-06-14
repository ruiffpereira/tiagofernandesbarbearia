import { fmtDate } from '../utils.js'
import { Button } from './ui.jsx'
import { useCms } from '../context/CmsContext.jsx'

export default function BookingCard({ booking: b, isPast, onEdit, onCancel }) {
  const { t } = useCms()
  const cancelled = b.status === 'cancelled'

  const STATUS = {
    confirmed: { label: t('ui.status.confirmada'), cls: 'bg-emerald-500/15 text-emerald-600' },
    cancelled: { label: t('ui.status.cancelada'), cls: 'bg-maroon/12 text-maroon' },
    pending:   { label: t('ui.status.pendente'), cls: 'bg-amber-500/15 text-amber-600' },
    completed: { label: t('ui.status.concluida'), cls: 'bg-ink/8 text-ink-soft' },
  }

  const st = STATUS[b.status] || STATUS.confirmed

  return (
    <div className={`bg-paper border border-line rounded-xl2 px-5 py-4 flex justify-between items-center
      flex-wrap gap-3.5 transition-all hover:border-line-strong hover:shadow-soft ${cancelled ? 'opacity-60' : ''}`}>
      <div className="flex gap-3.5 items-start flex-1 min-w-[200px]">
        <div className="w-11 h-11 rounded-lg bg-cream-dark flex items-center justify-center text-xl shrink-0">
          💈
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-semibold text-[15px] text-ink">{b.serviceName}</span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold
              tracking-wider uppercase ${st.cls}`}>{st.label}</span>
          </div>
          <p className="text-ink-soft text-[13px] mb-0.5">{fmtDate(b.date)} · {b.time}</p>
          <p className="text-ink-faint text-xs">{b.barberName}</p>
          {b.notes && <p className="text-ink-faint text-xs mt-1 italic">"{b.notes}"</p>}
        </div>
      </div>
      <div className="flex items-center gap-3.5">
        <span className="text-navy font-bold text-lg">€{b.servicePrice}</span>
        {!isPast && !cancelled && (
          <div className="flex gap-1.5">
            {onEdit && <Button variant="ghost" size="sm" onClick={() => onEdit(b)}>{t('ui.editar')}</Button>}
            {onCancel && <Button variant="danger" size="sm" onClick={() => onCancel(b.id)}>{t('ui.cancelar')}</Button>}
          </div>
        )}
      </div>
    </div>
  )
}
