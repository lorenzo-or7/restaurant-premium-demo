import { useState } from 'react'
import { site, type Weekday } from '../config/site'
import { visit } from '../content/copy'
import { formatWindow, openStatus, weekdayNames } from '../lib/format'
import { Icon, SectionIndex } from '../components/ui'
import { FadeUp, LineReveal } from '../components/motion'

const order: Weekday[] = [2, 3, 4, 5, 6, 0, 1]

export function Location() {
  const [today] = useState(() => new Date().getDay())
  const status = openStatus()
  const { address, contact } = site
  const mapsHref = address.mapsQuery
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address.mapsQuery)}`
    : null

  return (
    <section id="visite" className="visit" aria-labelledby="visit-title">
      <div className="visit__info panel">
        <SectionIndex index={visit.index} label={visit.label} />
        <LineReveal id="visit-title" className="visit__title display" label={visit.title} lines={['Onde nos', <em key="m">encontrar</em>]} />

        <div className="visit__cols">
          <FadeUp className="visit__block">
            <h3 className="label muted">Endereço</h3>
            {address.lines ? (
              <address className="visit__address">
                {address.lines.map((l) => (
                  <span key={l}>{l}</span>
                ))}
              </address>
            ) : (
              <address className="visit__address is-placeholder">
                <span>Rua do Restaurante, 000</span>
                <span>Bairro · Cidade — UF</span>
                <span className="demo-flag">Endereço demonstrativo</span>
              </address>
            )}
            {mapsHref && (
              <a className="btn btn--line" href={mapsHref} target="_blank" rel="noopener noreferrer">
                <span className="btn__label">Como chegar</span>
                <span className="btn__icon">
                  <Icon name="arrow" size={16} />
                </span>
              </a>
            )}
          </FadeUp>

          <FadeUp className="visit__block" delay={0.06}>
            <h3 className="label muted">Contato</h3>
            <ul className="visit__contact">
              <li>
                {contact.phoneDisplay && contact.phoneE164 ? (
                  <a className="text-link" href={`tel:+${contact.phoneE164}`}>
                    {contact.phoneDisplay}
                  </a>
                ) : (
                  <span className="is-placeholder">(00) 0000-0000 <span className="demo-flag">Demo</span></span>
                )}
              </li>
              <li>
                {contact.email ? (
                  <a className="text-link" href={`mailto:${contact.email}`}>
                    {contact.email}
                  </a>
                ) : (
                  <span className="is-placeholder">E-mail a configurar</span>
                )}
              </li>
              <li>
                <a className="text-link" href="#reservas">
                  Reservas pelo site
                </a>
              </li>
            </ul>
          </FadeUp>

          <FadeUp className="visit__block visit__block--hours" delay={0.12}>
            <h3 className="label muted">Horários</h3>
            <p className="visit__status">
              <span className={`status-dot ${status.open ? 'is-open' : ''}`} aria-hidden="true" />
              {status.text}
            </p>
            <table className="hours">
              <caption className="visually-hidden">Horário de funcionamento por dia</caption>
              <tbody>
                {order.map((d) => {
                  const windows = site.hours[d]
                  return (
                    <tr key={d} className={d === today ? 'is-today' : ''} aria-current={d === today ? 'date' : undefined}>
                      <th scope="row">
                        {weekdayNames[d]}
                        {d === today && <span className="visually-hidden"> (hoje)</span>}
                      </th>
                      <td>{windows.length ? windows.map(formatWindow).join(' · ') : <span className="muted">Fechado</span>}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </FadeUp>
        </div>
      </div>

      <div className="visit__map panel">
        {address.mapEmbedUrl ? (
          <iframe
            title={`Mapa: ${site.brand.name}`}
            src={address.mapEmbedUrl}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : (
          <IllustratedMap />
        )}
        <div className="visit__directions">
          <p className="label">Como chegar</p>
          <ul>
            {address.directions.map((d) => (
              <li key={d} className="muted">
                {d}
              </li>
            ))}
          </ul>
          {!address.mapEmbedUrl && (
            <p className="visit__map-note">
              <span className="demo-flag">Mapa ilustrativo</span>
            </p>
          )}
        </div>
      </div>
    </section>
  )
}

/** Mapa abstrato desenhado em SVG: ocupa o lugar do mapa real até que um endereço seja configurado. */
function IllustratedMap() {
  return (
    <svg className="map-art" viewBox="0 0 600 600" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Ilustração de mapa sem localização real">
      <rect width="600" height="600" fill="var(--c-bg-2)" />
      <g stroke="var(--c-border)" strokeWidth="1" fill="none">
        {Array.from({ length: 13 }, (_, i) => (
          <path key={`h${i}`} d={`M-20 ${i * 50 + 10} Q 300 ${i * 50 + (i % 2 ? 30 : -10)} 620 ${i * 50 + 20}`} />
        ))}
        {Array.from({ length: 13 }, (_, i) => (
          <path key={`v${i}`} d={`M${i * 50 - 5} -20 Q ${i * 50 + (i % 3 ? 20 : -15)} 300 ${i * 50 + 15} 620`} />
        ))}
      </g>
      <path d="M-20 410 C 140 360, 260 470, 620 330" stroke="var(--c-surface-2)" strokeWidth="26" fill="none" />
      <path d="M180 -20 C 220 200, 120 380, 260 620" stroke="var(--c-surface)" strokeWidth="14" fill="none" />
      <path d="M-20 410 C 140 360, 260 470, 620 330" stroke="var(--c-border)" strokeWidth="1" strokeDasharray="6 8" fill="none" />
      <g transform="translate(318 292)">
        <circle r="46" fill="var(--c-accent)" opacity="0.08" />
        <circle r="22" fill="var(--c-accent)" opacity="0.16" />
        <circle r="7" fill="var(--c-accent)" />
      </g>
    </svg>
  )
}
