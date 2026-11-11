import { useState } from 'react'
import { finalCta, navItems } from '../content/copy'
import { site } from '../config/site'
import { ActionLink, Img, Magnetic, Wordmark } from '../components/ui'
import { FadeUp, LineReveal, Parallax } from '../components/motion'

export function FinalCta() {
  return (
    <section className="closing panel" aria-labelledby="closing-title">
      <div className="closing__media">
        <Parallax distance={70}>
          <Img name="long-table" sizes="100vw" alt="" position="50% 45%" />
        </Parallax>
      </div>
      <div className="closing__scrim" aria-hidden="true" />
      <div className="closing__content">
        <LineReveal
          id="closing-title"
          className="closing__title display"
          label={finalCta.title.join(' ')}
          lines={[finalCta.title[0], <em key="t">{finalCta.title[1]}</em>]}
        />
        <FadeUp className="closing__aside" delay={0.2}>
          <p>{finalCta.text}</p>
          <Magnetic>
            <ActionLink href="#reservas">{finalCta.cta}</ActionLink>
          </Magnetic>
        </FadeUp>
      </div>
    </section>
  )
}

export function Footer() {
  const socials = site.socials.filter((s) => s.href)
  const [year] = useState(() => new Date().getFullYear())
  return (
    <footer className="footer panel panel--outline">
      <div className="footer__top">
        <div className="footer__brand">
          <a href="#topo" aria-label={`${site.brand.name} — voltar ao topo`}>
            <Wordmark className="footer__wordmark" />
          </a>
          <p className="muted">{site.brand.descriptor}</p>
        </div>

        <nav className="footer__nav" aria-label="Rodapé">
          <p className="label muted">Navegar</p>
          <ul>
            {navItems.map((n) => (
              <li key={n.id}>
                <a href={`#${n.id}`} className="text-link">
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="footer__social">
          <p className="label muted">Redes</p>
          {socials.length ? (
            <ul>
              {socials.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className="text-link">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <ul>
              {site.socials.map((s) => (
                <li key={s.label} className="muted">
                  {s.label} <span className="footer__pending">· link a configurar</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="footer__about">
          <p className="label muted">Sobre este site</p>
          <p className="muted">
            {site.demoMode
              ? 'Protótipo demonstrativo. Nome, cardápio, preços, horários e endereço são fictícios.'
              : `© ${year} ${site.brand.name}.`}
          </p>
          <p className="muted footer__photo-credit">
            Fotografias:{' '}
            <a className="text-link" href="https://unsplash.com/license" target="_blank" rel="noopener noreferrer">
              Unsplash
            </a>
          </p>
        </div>
      </div>

      <div className="footer__bottom">
        <span className="muted">
          © {year} {site.brand.name}
        </span>
        <span className="footer__credit">
          Desenvolvido por{' '}
          {site.credits.portfolioUrl ? (
            <a href={site.credits.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-link">
              {site.credits.studio}
            </a>
          ) : (
            <span>{site.credits.studio}</span>
          )}
        </span>
      </div>
    </footer>
  )
}
