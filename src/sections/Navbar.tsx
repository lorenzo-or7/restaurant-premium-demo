import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from 'motion/react'
import { useCallback, useRef, useState } from 'react'
import { navItems } from '../content/copy'
import { site } from '../config/site'
import { useActiveSection, useDialog, useScrollLock } from '../hooks'
import { openStatus } from '../lib/format'
import { Icon, Img, Wordmark } from '../components/ui'
import { EASE, EASE_IN_OUT } from '../components/easing'

const ids = navItems.map((n) => n.id)
const quickLinks = navItems.filter((n) => ['manifesto', 'cardapio', 'galeria'].includes(n.id))

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const active = useActiveSection(ids)
  const { scrollY } = useScroll()
  const reduce = useReducedMotion()
  const overlayRef = useRef<HTMLDivElement>(null)
  const close = useCallback(() => setOpen(false), [])

  useMotionValueEvent(scrollY, 'change', (v) => setScrolled(v > 40))
  useScrollLock(open)
  useDialog(open, overlayRef, close)

  const activeLabel = navItems.find((n) => n.id === active)?.label
  const status = openStatus()

  return (
    <>
      <motion.header
        className={`nav ${scrolled ? 'is-scrolled' : ''}`}
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: EASE, delay: 0.9 }}
      >
        <nav className="nav__bar" aria-label="Principal">
          <button
            type="button"
            className="nav__burger"
            aria-expanded={open}
            aria-controls="site-menu"
            onClick={() => setOpen(true)}
          >
            <span className="visually-hidden">Abrir menu</span>
            <span className="nav__burger-lines" aria-hidden="true" />
          </button>

          <a href="#topo" className="nav__brand">
            <Wordmark />
          </a>

          <span className="nav__current" aria-live="polite">
            <AnimatePresence mode="wait" initial={false}>
              {scrolled && activeLabel && (
                <motion.span
                  key={activeLabel}
                  className="label"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3, ease: EASE }}
                >
                  {activeLabel}
                </motion.span>
              )}
            </AnimatePresence>
          </span>

          <ul className="nav__links">
            {quickLinks.map((n) => (
              <li key={n.id}>
                <a href={`#${n.id}`} className={`nav__link label ${active === n.id ? 'is-active' : ''}`} aria-current={active === n.id ? 'true' : undefined}>
                  {n.label}
                </a>
              </li>
            ))}
          </ul>

          <motion.a href="#reservas" className="nav__cta label" whileTap={{ scale: 0.96 }}>
            Reservar
          </motion.a>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={overlayRef}
            id="site-menu"
            className="menu-overlay"
            role="dialog"
            aria-modal="true"
            aria-label="Menu do site"
            initial={reduce ? { opacity: 0 } : { clipPath: 'inset(0% 0% 100% 0%)' }}
            animate={reduce ? { opacity: 1 } : { clipPath: 'inset(0% 0% 0% 0%)' }}
            exit={reduce ? { opacity: 0 } : { clipPath: 'inset(0% 0% 100% 0%)' }}
            transition={{ duration: 0.75, ease: EASE_IN_OUT }}
          >
            <div className="menu-overlay__top">
              <Wordmark />
              <button type="button" className="menu-overlay__close" onClick={close} data-autofocus>
                <Icon name="close" size={20} />
                <span className="label">Fechar</span>
              </button>
            </div>

            <div className="menu-overlay__body">
              <ol className="menu-overlay__links">
                {navItems.map((n, i) => (
                  <li key={n.id} className="menu-overlay__item">
                    <motion.a
                      href={`#${n.id}`}
                      onClick={close}
                      className={active === n.id ? 'is-active' : ''}
                      initial={reduce ? { opacity: 0 } : { y: '110%' }}
                      animate={reduce ? { opacity: 1 } : { y: '0%' }}
                      transition={{ duration: 0.8, ease: EASE, delay: 0.25 + i * 0.05 }}
                    >
                      <span className="menu-overlay__num label">{String(i + 1).padStart(2, '0')}</span>
                      <span className="menu-overlay__text">{n.label}</span>
                    </motion.a>
                  </li>
                ))}
              </ol>

              <motion.aside
                className="menu-overlay__aside"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.55 }}
              >
                <div className="menu-overlay__photo">
                  <Img name="candle-room" sizes="(min-width: 900px) 30vw, 0px" alt="" />
                </div>
                <dl className="menu-overlay__info">
                  <div>
                    <dt className="label">Hoje</dt>
                    <dd>
                      <span className={`status-dot ${status.open ? 'is-open' : ''}`} aria-hidden="true" />
                      {status.text}
                    </dd>
                  </div>
                  <div>
                    <dt className="label">Reservas</dt>
                    <dd>
                      <a href="#reservas" onClick={close} className="text-link">
                        Solicitar pelo site
                      </a>
                    </dd>
                  </div>
                  {site.demoMode && (
                    <div>
                      <dt className="label">Protótipo</dt>
                      <dd className="muted">Conteúdo demonstrativo Or7.dev</dd>
                    </div>
                  )}
                </dl>
              </motion.aside>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
