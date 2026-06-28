// Helpers de "Adicionar ao calendário" — link do Google Calendar (TEMPLATE) e
// URL de download do feed .ics servido pela API (por cancelToken).
//
// Os textos visíveis (título/descrição) NÃO são hardcoded aqui: vêm já
// traduzidos do CMS (passados pelo caller); estes helpers só montam URLs.

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001/api').replace(/\/+$/, '')

const pad = (n) => String(n).padStart(2, '0')

/** Date → 'YYYYMMDDTHHMMSSZ' (UTC, formato do Google Calendar/iCalendar). */
function toUtcStamp(d) {
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  )
}

/**
 * Monta o link "Adicionar ao Google Calendar" para uma marcação.
 * @param {{ title:string, details?:string, date:string, time:string, duration?:number }} opts
 *  date='YYYY-MM-DD', time='HH:MM'. `title`/`details` já traduzidos.
 */
export function googleCalendarUrl({ title, details, date, time, duration = 30 }) {
  const start = new Date(`${date}T${time}:00`)
  const end = new Date(start.getTime() + duration * 60000)
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${toUtcStamp(start)}/${toUtcStamp(end)}`,
  })
  if (details) params.set('details', details)
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

/** URL de download do .ics de UMA marcação (por cancelToken), na língua dada. */
export function appointmentIcsUrl(cancelToken, locale = 'pt') {
  return `${API_BASE}/websites/booking/appointment/${cancelToken}/calendar.ics?locale=${encodeURIComponent(locale)}`
}
