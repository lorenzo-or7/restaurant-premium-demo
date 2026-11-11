import { site } from '../config/site'
import { formatLongDate, isSameDay, slotsFor, toMinutes } from './format'

export interface ReservationDraft {
  date: Date | null
  time: string | null
  guests: number
  name: string
  phone: string
  notes: string
}

export type FieldKey = 'date' | 'time' | 'guests' | 'name' | 'phone' | 'notes'
export type Errors = Partial<Record<FieldKey, string>>

/** Antecedência mínima para horários do mesmo dia. */
const SAME_DAY_LEAD_MIN = 60

export function availableSlots(date: Date, now = new Date()): string[] {
  const all = slotsFor(date)
  if (!isSameDay(date, now)) return all
  const nowMin = now.getHours() * 60 + now.getMinutes() + SAME_DAY_LEAD_MIN
  return all.filter((s) => {
    const t = toMinutes(s)
    // horários depois da meia-noite pertencem ao fim do turno
    const abs = t < 6 * 60 ? t + 1440 : t
    return abs >= nowMin
  })
}

export function upcomingDays(now = new Date()): Date[] {
  const base = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return Array.from({ length: site.reservation.daysAhead }, (_, i) => {
    const d = new Date(base)
    d.setDate(base.getDate() + i)
    return d
  })
}

export const onlyDigits = (v: string) => v.replace(/\D/g, '')

/** Máscara brasileira: (11) 91234-5678 / (11) 1234-5678 */
export function maskPhone(value: string) {
  const d = onlyDigits(value).slice(0, 11)
  if (d.length <= 2) return d.length ? `(${d}` : ''
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

/** Remove caracteres de controle e espaços excessivos. A saída é sempre tratada como texto. */
export const cleanText = (v: string) =>
  v
    // eslint-disable-next-line no-control-regex -- remove caracteres de controle intencionalmente
    .replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, '')
    .replace(/[ \t]{2,}/g, ' ')
    .trim()

export function validate(d: ReservationDraft): Errors {
  const e: Errors = {}
  const { minGuests, maxGuests, notesMaxLength } = site.reservation
  if (!d.date) e.date = 'Escolha uma data.'
  if (!d.time) e.time = d.date ? 'Escolha um horário.' : 'Escolha uma data para ver os horários.'
  else if (d.date && !availableSlots(d.date).includes(d.time)) e.time = 'Este horário não está mais disponível. Escolha outro.'
  if (d.guests < minGuests || d.guests > maxGuests) e.guests = `Entre ${minGuests} e ${maxGuests} pessoas.`
  const name = cleanText(d.name)
  if (name.length < 2) e.name = 'Informe seu nome.'
  else if (name.length > 80) e.name = 'Use no máximo 80 caracteres.'
  else if (!/^[\p{L}\p{M}' .-]+$/u.test(name)) e.name = 'Use apenas letras no nome.'
  const digits = onlyDigits(d.phone)
  if (!digits) e.phone = 'Informe um telefone para contato.'
  else if (digits.length < 10 || digits.length > 11) e.phone = 'Telefone incompleto. Use DDD + número.'
  if (d.notes.length > notesMaxLength) e.notes = `Use no máximo ${notesMaxLength} caracteres.`
  return e
}

export function buildMessage(d: ReservationDraft) {
  const lines = [
    `Olá! Gostaria de solicitar uma reserva no ${site.brand.name}.`,
    '',
    `Data: ${d.date ? formatLongDate(d.date) : '-'}`,
    `Horário: ${d.time ?? '-'}`,
    `Pessoas: ${d.guests}`,
    `Nome: ${cleanText(d.name)}`,
    `Telefone: ${maskPhone(d.phone)}`,
  ]
  const notes = cleanText(d.notes)
  if (notes) lines.push(`Observações: ${notes}`)
  lines.push('', 'Aguardo a confirmação de disponibilidade.')
  return lines.join('\n')
}

/** URL do WhatsApp ou null quando não há número configurado (modo demonstrativo). */
export function whatsappUrl(message: string): string | null {
  const n = site.whatsappNumber ? onlyDigits(site.whatsappNumber) : ''
  if (n.length < 12 || n.length > 15) return null
  return `https://wa.me/${n}?text=${encodeURIComponent(message)}`
}

export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    /* tenta o fallback */
  }
  try {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.setAttribute('readonly', '')
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    ta.remove()
    return ok
  } catch {
    return false
  }
}
