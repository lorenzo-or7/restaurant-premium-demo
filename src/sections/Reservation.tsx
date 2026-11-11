import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useId, useMemo, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from 'react'
import { reservation as copy } from '../content/copy'
import { site } from '../config/site'
import { formatLongDate, isSameDay, monthShort, weekdayShort } from '../lib/format'
import {
  availableSlots,
  buildMessage,
  copyText,
  maskPhone,
  upcomingDays,
  validate,
  whatsappUrl,
  type FieldKey,
  type ReservationDraft,
} from '../lib/reservation'
import { ActionButton, Icon, Img, SectionIndex } from '../components/ui'
import { EASE } from '../components/easing'
import { ImageReveal, LineReveal } from '../components/motion'

type Status = { kind: 'idle' } | { kind: 'sent'; url: string; message: string } | { kind: 'demo'; message: string }

const fieldOrder: FieldKey[] = ['date', 'time', 'guests', 'name', 'phone', 'notes']

export function Reservation() {
  const days = useMemo(() => upcomingDays(), [])
  const cfg = site.reservation
  const [draft, setDraft] = useState<ReservationDraft>({ date: null, time: null, guests: 2, name: '', phone: '', notes: '' })
  const [touched, setTouched] = useState<Partial<Record<FieldKey, boolean>>>({})
  const [submitted, setSubmitted] = useState(false)
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const [copied, setCopied] = useState<'idle' | 'ok' | 'fail'>('idle')
  const errorSummaryRef = useRef<HTMLDivElement>(null)
  const resultRef = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const uid = 'rsv' + useId().replace(/[^a-zA-Z0-9_-]/g, '')

  const errors = validate(draft)
  const show = (k: FieldKey) => (submitted || touched[k] ? errors[k] : undefined)
  const slots = draft.date ? availableSlots(draft.date) : []

  const set = <K extends keyof ReservationDraft>(k: K, v: ReservationDraft[K]) => {
    setDraft((d) => ({ ...d, [k]: v }))
    if (status.kind !== 'idle') setStatus({ kind: 'idle' })
  }
  const touch = (k: FieldKey) => setTouched((t) => ({ ...t, [k]: true }))

  const pickDate = (d: Date) => {
    setDraft((prev) => {
      const nextSlots = availableSlots(d)
      return { ...prev, date: d, time: prev.time && nextSlots.includes(prev.time) ? prev.time : null }
    })
    touch('date')
    if (status.kind !== 'idle') setStatus({ kind: 'idle' })
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    const errs = validate(draft)
    if (Object.keys(errs).length) {
      requestAnimationFrame(() => errorSummaryRef.current?.focus())
      return
    }
    const message = buildMessage(draft)
    const url = whatsappUrl(message)
    setCopied('idle')
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer')
      setStatus({ kind: 'sent', url, message })
    } else {
      setStatus({ kind: 'demo', message })
    }
    requestAnimationFrame(() => resultRef.current?.focus())
  }

  const onCopy = async (text: string) => setCopied((await copyText(text)) ? 'ok' : 'fail')

  const errorList = fieldOrder.filter((k) => errors[k])
  const configured = Boolean(whatsappUrl('x'))

  return (
    <section id="reservas" className="reserve" aria-labelledby="reserve-title">
      <div className="reserve__stage panel">
        <ImageReveal from="bottom" className="reserve__media">
          <Img name="candle-room" sizes="(min-width: 1024px) 40vw, 100vw" alt="" position="50% 60%" />
        </ImageReveal>
        <div className="reserve__scrim" aria-hidden="true" />
        <div className="reserve__stage-text">
          <SectionIndex index={copy.index} label={copy.label} />
          <LineReveal id="reserve-title" className="reserve__title display" label={copy.title} lines={['Reserve', <em key="m">sua mesa</em>]} />
          <p className="reserve__intro">{copy.intro}</p>
        </div>
      </div>

      <div className="reserve__board panel panel--outline">
        {site.demoMode && !configured && (
          <p className="reserve__demo">
            <span className="demo-flag">Modo demonstrativo</span>
            <span className="muted">Sem número de WhatsApp configurado. Nada será enviado: ao final você recebe um resumo para copiar.</span>
          </p>
        )}

        <form className="reserve__form" onSubmit={onSubmit} noValidate aria-describedby={`${uid}-req`}>
          <p id={`${uid}-req`} className="visually-hidden">
            Todos os campos são obrigatórios, exceto observações.
          </p>

          <AnimatePresence>
            {submitted && errorList.length > 0 && (
              <motion.div
                ref={errorSummaryRef}
                tabIndex={-1}
                className="form-errors"
                role="alert"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.35, ease: EASE }}
              >
                <p className="label">Revise {errorList.length === 1 ? '1 campo' : `${errorList.length} campos`}</p>
                <ul>
                  {errorList.map((k) => (
                    <li key={k}>
                      <a href={`#${uid}-${k}`}>{errors[k]}</a>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 01 — Data */}
          <Field step="01" title="Data" id={`${uid}-date`} error={show('date')} as="group">
            <DateStrip days={days} value={draft.date} onPick={pickDate} groupId={`${uid}-date`} describedBy={show('date') ? `${uid}-date-err` : undefined} />
          </Field>

          {/* 02 — Horário */}
          <Field step="02" title="Horário" id={`${uid}-time`} error={show('time')} as="group">
            {!draft.date ? (
              <p className="field__hint muted" id={`${uid}-time`} tabIndex={-1}>
                Escolha uma data para ver os horários disponíveis.
              </p>
            ) : slots.length === 0 ? (
              <p className="field__hint muted" id={`${uid}-time`} tabIndex={-1}>
                Não há horários disponíveis nesta data. Experimente outro dia.
              </p>
            ) : (
              <RadioGroup
                id={`${uid}-time`}
                label="Horários disponíveis"
                className="slots"
                options={slots.map((s) => ({ value: s, content: s }))}
                value={draft.time}
                onChange={(v) => {
                  set('time', v)
                  touch('time')
                }}
                describedBy={show('time') ? `${uid}-time-err` : undefined}
              />
            )}
          </Field>

          {/* 03 — Pessoas */}
          <Field step="03" title="Pessoas" id={`${uid}-guests`} error={show('guests')} as="group">
            <div className="stepper" role="group" aria-labelledby={`${uid}-guests-label`}>
              <motion.button
                type="button"
                className="stepper__btn"
                onClick={() => set('guests', Math.max(cfg.minGuests, draft.guests - 1))}
                disabled={draft.guests <= cfg.minGuests}
                aria-label="Remover uma pessoa"
                whileTap={{ scale: 0.9 }}
              >
                <Icon name="minus" />
              </motion.button>
              <output id={`${uid}-guests`} className="stepper__value" aria-live="polite">
                <span className="display">{draft.guests}</span>
                <span className="label muted">{draft.guests === 1 ? 'pessoa' : 'pessoas'}</span>
              </output>
              <motion.button
                type="button"
                className="stepper__btn"
                onClick={() => set('guests', Math.min(cfg.maxGuests, draft.guests + 1))}
                disabled={draft.guests >= cfg.maxGuests}
                aria-label="Adicionar uma pessoa"
                whileTap={{ scale: 0.9 }}
              >
                <Icon name="plus" />
              </motion.button>
            </div>
            <AnimatePresence>
              {draft.guests >= cfg.largeGroupThreshold && (
                <motion.p className="field__hint muted" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                  Para grupos a partir de {cfg.largeGroupThreshold} pessoas, a casa pode sugerir menu fechado ou ajustes de horário.
                </motion.p>
              )}
            </AnimatePresence>
          </Field>

          {/* 04 — Contato */}
          <div className="field-row">
            <TextField
              id={`${uid}-name`}
              label="Nome"
              value={draft.name}
              autoComplete="name"
              maxLength={80}
              error={show('name')}
              onChange={(v) => set('name', v)}
              onBlur={() => touch('name')}
            />
            <TextField
              id={`${uid}-phone`}
              label="Telefone (WhatsApp)"
              value={draft.phone}
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              placeholder="(00) 00000-0000"
              maxLength={16}
              error={show('phone')}
              onChange={(v) => set('phone', maskPhone(v))}
              onBlur={() => touch('phone')}
            />
          </div>

          <div className={`field field--text ${show('notes') ? 'has-error' : ''}`}>
            <div className="field__labelrow">
              <label htmlFor={`${uid}-notes`} className="label">
                Observações <span className="muted field__optional">(opcional)</span>
              </label>
              <span className={`field__counter ${draft.notes.length > cfg.notesMaxLength ? 'is-over' : ''}`} aria-live="polite">
                {draft.notes.length}/{cfg.notesMaxLength}
              </span>
            </div>
            <textarea
              id={`${uid}-notes`}
              rows={3}
              value={draft.notes}
              placeholder="Aniversário, alergias, cadeira para criança…"
              onChange={(e) => set('notes', e.target.value.slice(0, cfg.notesMaxLength + 20))}
              onBlur={() => touch('notes')}
              aria-invalid={Boolean(show('notes'))}
              aria-describedby={show('notes') ? `${uid}-notes-err` : undefined}
            />
            {show('notes') && (
              <p className="field__error" id={`${uid}-notes-err`}>
                {show('notes')}
              </p>
            )}
          </div>

          {/* Resumo */}
          <div className="summary" aria-label="Resumo da solicitação">
            <p className="label summary__title">Resumo da solicitação</p>
            <dl className="summary__grid">
              <SummaryItem term="Data" value={draft.date ? formatLongDate(draft.date) : null} />
              <SummaryItem term="Horário" value={draft.time} />
              <SummaryItem term="Pessoas" value={String(draft.guests)} />
              <SummaryItem term="Nome" value={draft.name.trim() || null} />
            </dl>
          </div>

          <div className="reserve__actions">
            <ActionButton type="submit" variant="solid" icon={configured ? 'chat' : 'arrow'}>
              {configured ? 'Enviar pelo WhatsApp' : 'Gerar solicitação'}
            </ActionButton>
            <p className="reserve__fineprint muted">
              Esta é uma pré-reserva. A mesa só está garantida depois da confirmação da equipe.
            </p>
          </div>
        </form>

        <AnimatePresence>
          {status.kind !== 'idle' && (
            <motion.div
              ref={resultRef}
              tabIndex={-1}
              className={`result result--${status.kind}`}
              role="status"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              {status.kind === 'sent' ? (
                <>
                  <p className="result__title display">Solicitação pronta no WhatsApp</p>
                  <p className="muted">
                    Abrimos uma conversa com a mensagem preenchida. Envie por lá e aguarde a resposta da casa. A reserva só vale após essa confirmação.
                  </p>
                  <a className="text-link" href={status.url} target="_blank" rel="noopener noreferrer">
                    O WhatsApp não abriu? Abrir novamente
                  </a>
                </>
              ) : (
                <>
                  <p className="result__title display">Solicitação gerada</p>
                  <p className="muted">
                    Modo demonstrativo: nenhum número foi configurado, então nada foi enviado e nenhuma mesa foi reservada. Copie o resumo abaixo para testar.
                  </p>
                  <label htmlFor={`${uid}-msg`} className="visually-hidden">
                    Texto da solicitação
                  </label>
                  <textarea id={`${uid}-msg`} className="result__message" readOnly value={status.message} rows={9} />
                  <div className="result__actions">
                    <ActionButton variant="line" icon={copied === 'ok' ? 'check' : 'copy'} onClick={() => onCopy(status.message)}>
                      {copied === 'ok' ? 'Copiado' : 'Copiar resumo'}
                    </ActionButton>
                    <span className="muted result__copy-state" aria-live="polite">
                      {copied === 'fail' && 'Não foi possível copiar automaticamente. Selecione o texto e copie manualmente.'}
                    </span>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}

/* ---------- Subcomponentes ---------- */

function Field({
  step,
  title,
  id,
  error,
  children,
}: {
  step: string
  title: string
  id: string
  error?: string
  as: 'group'
  children: ReactNode
}) {
  return (
    <fieldset className={`field ${error ? 'has-error' : ''}`} aria-describedby={error ? `${id}-err` : undefined}>
      <legend className="field__legend">
        <span className="field__step label">{step}</span>
        <span className="label" id={`${id}-label`}>
          {title}
        </span>
      </legend>
      {children}
      {error && (
        <p className="field__error" id={`${id}-err`}>
          {error}
        </p>
      )}
    </fieldset>
  )
}

function TextField({
  id,
  label,
  value,
  onChange,
  onBlur,
  error,
  ...rest
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  onBlur: () => void
  error?: string
  type?: string
  inputMode?: 'tel' | 'text'
  autoComplete?: string
  placeholder?: string
  maxLength?: number
}) {
  return (
    <div className={`field field--text ${error ? 'has-error' : ''}`}>
      <label htmlFor={id} className="label">
        {label}
      </label>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-err` : undefined}
        required
        {...rest}
      />
      {error && (
        <p className="field__error" id={`${id}-err`}>
          {error}
        </p>
      )}
    </div>
  )
}

function SummaryItem({ term, value }: { term: string; value: string | null }) {
  return (
    <div className={value ? '' : 'is-empty'}>
      <dt className="label muted">{term}</dt>
      <dd>{value ?? '—'}</dd>
    </div>
  )
}

/** Grupo de opções com navegação por setas (padrão ARIA radiogroup). */
function RadioGroup({
  id,
  label,
  options,
  value,
  onChange,
  className = '',
  describedBy,
}: {
  id: string
  label: string
  options: { value: string; content: ReactNode; disabled?: boolean; ariaLabel?: string }[]
  value: string | null
  onChange: (v: string) => void
  className?: string
  describedBy?: string
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const enabled = options.map((o, i) => (o.disabled ? -1 : i)).filter((i) => i >= 0)
  const selectedIdx = options.findIndex((o) => o.value === value)
  const focusIdx = selectedIdx >= 0 ? selectedIdx : enabled[0]

  const onKey = (e: KeyboardEvent, i: number) => {
    const pos = enabled.indexOf(i)
    let next = -1
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = enabled[(pos + 1) % enabled.length]
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = enabled[(pos - 1 + enabled.length) % enabled.length]
    if (e.key === 'Home') next = enabled[0]
    if (e.key === 'End') next = enabled[enabled.length - 1]
    if (next === undefined || next < 0) return
    e.preventDefault()
    onChange(options[next].value)
    refs.current[next]?.focus()
    refs.current[next]?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }

  return (
    <div role="radiogroup" aria-label={label} id={id} className={className} aria-describedby={describedBy}>
      {options.map((o, i) => {
        const checked = o.value === value
        return (
          <motion.button
            key={o.value}
            ref={(el) => {
              refs.current[i] = el
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            aria-label={o.ariaLabel}
            disabled={o.disabled}
            tabIndex={i === focusIdx ? 0 : -1}
            className={`opt ${checked ? 'is-checked' : ''}`}
            onClick={() => onChange(o.value)}
            onKeyDown={(e) => onKey(e, i)}
            whileTap={o.disabled ? undefined : { scale: 0.94 }}
          >
            {o.content}
          </motion.button>
        )
      })}
    </div>
  )
}

function DateStrip({
  days,
  value,
  onPick,
  groupId,
  describedBy,
}: {
  days: Date[]
  value: Date | null
  onPick: (d: Date) => void
  groupId: string
  describedBy?: string
}) {
  const scroller = useRef<HTMLDivElement>(null)
  const [today] = useState(() => new Date())
  const scrollBy = (dir: number) => {
    const el = scroller.current
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' })
  }
  const monthLabel = (() => {
    const first = days[0]
    const last = days[days.length - 1]
    return first.getMonth() === last.getMonth()
      ? `${monthShort[first.getMonth()]} ${first.getFullYear()}`
      : `${monthShort[first.getMonth()]} – ${monthShort[last.getMonth()]} ${last.getFullYear()}`
  })()

  return (
    <div className="datestrip">
      <div className="datestrip__bar">
        <span className="label muted">{monthLabel}</span>
        <div className="datestrip__arrows">
          <button type="button" className="icon-btn" onClick={() => scrollBy(-1)} aria-label="Datas anteriores">
            <Icon name="arrow-left" size={16} />
          </button>
          <button type="button" className="icon-btn" onClick={() => scrollBy(1)} aria-label="Próximas datas">
            <Icon name="arrow" size={16} />
          </button>
        </div>
      </div>
      <div className="datestrip__scroller" ref={scroller}>
        <RadioGroup
          id={groupId}
          label="Datas disponíveis"
          className="datestrip__days"
          describedBy={describedBy}
          value={value ? value.toDateString() : null}
          onChange={(v) => {
            const d = days.find((x) => x.toDateString() === v)
            if (d) onPick(d)
          }}
          options={days.map((d) => {
            const closed = availableSlots(d).length === 0
            const isToday = isSameDay(d, today)
            return {
              value: d.toDateString(),
              disabled: closed,
              ariaLabel: `${formatLongDate(d)}${isToday ? ', hoje' : ''}${closed ? ', indisponível' : ''}`,
              content: (
                <>
                  <span className="day__wd label">{isToday ? 'Hoje' : weekdayShort[d.getDay()]}</span>
                  <span className="day__num display">{d.getDate()}</span>
                  <span className="day__state">{closed ? 'Fechado' : monthShort[d.getMonth()]}</span>
                </>
              ),
            }
          })}
        />
      </div>
    </div>
  )
}
