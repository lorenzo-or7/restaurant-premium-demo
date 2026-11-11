import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { hero } from '../content/copy'
import { site } from '../config/site'
import { openStatus } from '../lib/format'
import { ActionLink, Icon, Img, Magnetic } from '../components/ui'
import { EASE } from '../components/easing'
import { ImageReveal, LineReveal } from '../components/motion'

export function Hero() {
  const reduce = useReducedMotion()
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 900], [0, 140])
  const status = openStatus()

  return (
    <section id="topo" className="hero" aria-labelledby="hero-title">
      <div className="hero__main panel">
        <ImageReveal trigger="mount" duration={1.2} startClip="inset(18% 14% 18% 14% round 12px)" className="hero__media">
          <motion.div className="hero__parallax" style={reduce ? undefined : { y }}>
            <Img name="hero" priority sizes="(min-width: 1024px) 72vw, 100vw" position="50% 42%" />
          </motion.div>
        </ImageReveal>
        <div className="hero__scrim" aria-hidden="true" />

        <div className="hero__content">
          <motion.p
            className="hero__eyebrow label"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <span className="dot" aria-hidden="true" />
            {hero.eyebrow}
          </motion.p>

          <LineReveal
            as="h1"
            id="hero-title"
            trigger="mount"
            delay={0.45}
            stagger={0.11}
            className="hero__title display"
            label={hero.titleLines.join(' ')}
            lines={[
              hero.titleLines[0],
              <>
                <em>{hero.titleLines[1]}</em>
              </>,
              hero.titleLines[2],
            ]}
          />

          <motion.div
            className="hero__aside"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 1.05 }}
          >
            <p className="hero__intro">{hero.intro}</p>
            <div className="hero__ctas">
              <Magnetic>
                <ActionLink href="#reservas" variant="solid">
                  {hero.ctaReserve}
                </ActionLink>
              </Magnetic>
              <ActionLink href="#cardapio" variant="ghost" icon="down">
                {hero.ctaMenu}
              </ActionLink>
            </div>
          </motion.div>
        </div>

        <motion.a
          href="#manifesto"
          className="hero__scroll"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.5 }}
        >
          <span className="label">Role</span>
          <span className="hero__scroll-line" aria-hidden="true" />
          <span className="visually-hidden">para a próxima seção</span>
        </motion.a>
      </div>

      <div className="hero__side">
        {hero.tiles.map((t, i) => (
          <a key={t.id} href={`#${t.id}`} className="hero__tile panel">
            <ImageReveal trigger="mount" delay={0.35 + i * 0.15} duration={1.3} className="hero__tile-media">
              <Img name={t.image} sizes="(min-width: 1024px) 26vw, 50vw" alt="" />
            </ImageReveal>
            <span className="corner-tab">
              <span className="label">{t.label}</span>
              <span className="corner-tab__icon">
                <Icon name="arrow" size={15} />
              </span>
            </span>
          </a>
        ))}

        <motion.div
          className="hero__info panel panel--outline"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <p className="hero__status">
            <span className={`status-dot ${status.open ? 'is-open' : ''}`} aria-hidden="true" />
            {status.text}
          </p>
          <p className="muted hero__info-note">
            {site.brand.descriptor}
            {site.demoMode && <span className="demo-flag">Demo</span>}
          </p>
        </motion.div>
      </div>
    </section>
  )
}
