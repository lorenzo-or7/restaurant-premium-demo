import { site, type Weekday, type OpeningWindow } from '../config/site'

const priceFmt = new Intl.NumberFormat(site.currency.locale, {
  style: 'currency',
  currency: site.currency.code,
  maximumFractionDigits: 0,
})

export const formatPrice = (value: number) => priceFmt.format(value)

export const weekdayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'] as const
export const weekdayShort = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'] as const
export const monthShort = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'] as const

export const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

export const fromMinutes = (mins: number) => {
  const m = ((mins % 1440) + 1440) % 1440
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
}

/** Fechamento em minutos absolutos (considera virada da meia-noite). */
const closeAbs = (w: OpeningWindow) => {
  const o = toMinutes(w.open)
  const c = toMinutes(w.close)
  return c <= o ? c + 1440 : c
}

export const formatWindow = (w: OpeningWindow) => `${w.open} – ${w.close}`

export function hoursFor(day: Weekday) {
  return site.hours[day]
}

/** Situação atual: aberto/fechado + próximo horário. Considera turnos que passam da meia-noite. */
export function openStatus(now = new Date()): { open: boolean; text: string } {
  const day = now.getDay() as Weekday
  const mins = now.getHours() * 60 + now.getMinutes()
  const prev = ((day + 6) % 7) as Weekday

  for (const w of site.hours[prev]) {
    const c = closeAbs(w)
    if (c > 1440 && mins < c - 1440) return { open: true, text: `Aberto agora · até ${w.close}` }
  }
  for (const w of site.hours[day]) {
    if (mins >= toMinutes(w.open) && mins < closeAbs(w)) return { open: true, text: `Aberto agora · até ${w.close}` }
  }
  for (const w of site.hours[day]) {
    if (mins < toMinutes(w.open)) return { open: false, text: `Fechado agora · abre hoje às ${w.open}` }
  }
  for (let i = 1; i <= 7; i++) {
    const d = ((day + i) % 7) as Weekday
    const first = site.hours[d][0]
    if (first) {
      const when = i === 1 ? 'amanhã' : weekdayNames[d].toLowerCase()
      return { open: false, text: `Fechado agora · abre ${when} às ${first.open}` }
    }
  }
  return { open: false, text: 'Horários a definir' }
}

/** Horários de chegada disponíveis para uma data. */
export function slotsFor(date: Date): string[] {
  const { slotIntervalMinutes, lastSeatingBeforeCloseMinutes } = site.reservation
  const slots: string[] = []
  for (const w of site.hours[date.getDay() as Weekday]) {
    const start = toMinutes(w.open)
    const end = closeAbs(w) - lastSeatingBeforeCloseMinutes
    for (let t = start; t <= end; t += slotIntervalMinutes) slots.push(fromMinutes(t))
  }
  return slots
}

export const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

export const formatLongDate = (d: Date) =>
  `${weekdayNames[d.getDay()]}, ${d.getDate()} de ${
    ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'][d.getMonth()]
  }`
