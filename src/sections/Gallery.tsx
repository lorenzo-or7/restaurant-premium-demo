import { AnimatePresence, motion, useReducedMotion, type PanInfo } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { gallery } from '../content/copy'
import { getImage } from '../content/images'
import { useDialog, useScrollLock } from '../hooks'
import { Icon, Img, SectionIndex } from '../components/ui'
import { EASE } from '../components/easing'
import { ImageReveal, LineReveal } from '../components/motion'

const directions = ['bottom', 'left', 'top', 'right'] as const

export function Gallery() {
  const [index, setIndex] = useState<number | null>(null)
  const items = gallery.items

  return (
    <section id="galeria" className="gallery panel" aria-labelledby="gallery-title">
      <header className="gallery__head">
        <SectionIndex index={gallery.index} label={gallery.label} />
        <LineReveal
          id="gallery-title"
          className="gallery__title display"
          label={gallery.title}
          lines={['Do fogo', <em key="m">à mesa</em>]}
        />
        <p className="gallery__hint muted">Toque em uma imagem para ampliar.</p>
      </header>

      <ul className="gallery__grid">
        {items.map((item, i) => (
          <li key={item.image} className={`gallery__item gallery__item--${item.shape}`}>
            <button
              type="button"
              className="gallery__btn"
              onClick={() => setIndex(i)}
              aria-haspopup="dialog"
              aria-label={`Ampliar imagem ${i + 1} de ${items.length}: ${item.caption}`}
            >
              <ImageReveal from={directions[i % directions.length]} delay={(i % 3) * 0.08} duration={1.2}>
                <Img name={item.image} sizes={item.shape === 'hero' ? '(min-width: 1024px) 50vw, 100vw' : '(min-width: 1024px) 25vw, 50vw'} alt="" />
              </ImageReveal>
              <span className="gallery__caption">
                <span className="label">{String(i + 1).padStart(2, '0')}</span>
                <span>{item.caption}</span>
              </span>
              <span className="gallery__zoom" aria-hidden="true">
                <Icon name="expand" size={16} />
              </span>
            </button>
          </li>
        ))}
      </ul>

      <Lightbox index={index} setIndex={setIndex} />
    </section>
  )
}

function Lightbox({ index, setIndex }: { index: number | null; setIndex: (i: number | null) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const [dir, setDir] = useState(1)
  const items = gallery.items
  const open = index !== null
  const close = useCallback(() => setIndex(null), [setIndex])

  useScrollLock(open)
  useDialog(open, ref, close)

  const go = useCallback(
    (delta: number) => {
      if (index === null) return
      setDir(delta)
      setIndex((index + delta + items.length) % items.length)
    },
    [index, items.length, setIndex],
  )

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, go])

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -60 || info.velocity.x < -400) go(1)
    else if (info.offset.x > 60 || info.velocity.x > 400) go(-1)
  }

  const item = index !== null ? items[index] : null
  const img = item ? getImage(item.image) : null

  return createPortal(
    <AnimatePresence>
      {item && img && index !== null && (
        <motion.div
          ref={ref}
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Galeria ampliada"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="lightbox__top">
            <span className="label" aria-live="polite">
              {String(index + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
            </span>
            <button type="button" className="icon-btn" onClick={close} aria-label="Fechar galeria" data-autofocus>
              <Icon name="close" />
            </button>
          </div>

          <div className="lightbox__stage">
            <AnimatePresence initial={false} custom={dir} mode="popLayout">
              <motion.figure
                key={item.image}
                className="lightbox__figure"
                custom={dir}
                variants={{
                  enter: (d: number) => (reduce ? { opacity: 0 } : { opacity: 0, x: `${d * 8}%`, clipPath: d > 0 ? 'inset(0% 0% 0% 30%)' : 'inset(0% 30% 0% 0%)' }),
                  center: { opacity: 1, x: '0%', clipPath: 'inset(0% 0% 0% 0%)' },
                  exit: (d: number) => (reduce ? { opacity: 0 } : { opacity: 0, x: `${d * -8}%` }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.7, ease: EASE }}
                drag={reduce ? false : 'x'}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.25}
                onDragEnd={onDragEnd}
              >
                <img
                  src={img.src}
                  srcSet={img.srcSet}
                  sizes="92vw"
                  width={img.width}
                  height={img.height}
                  alt={img.alt}
                  draggable={false}
                />
                <figcaption className="lightbox__caption">{item.caption}</figcaption>
              </motion.figure>
            </AnimatePresence>
          </div>

          <div className="lightbox__controls">
            <button type="button" className="icon-btn icon-btn--lg" onClick={() => go(-1)} aria-label="Imagem anterior">
              <Icon name="arrow-left" />
            </button>
            <div className="lightbox__thumbs" role="group" aria-label="Miniaturas">
              {items.map((it, i) => (
                <button
                  key={it.image}
                  type="button"
                  className={`lightbox__thumb ${i === index ? 'is-active' : ''}`}
                  aria-label={`Ir para imagem ${i + 1}: ${it.caption}`}
                  aria-current={i === index ? 'true' : undefined}
                  onClick={() => {
                    setDir(i > index ? 1 : -1)
                    setIndex(i)
                  }}
                >
                  <Img name={it.image} sizes="64px" alt="" />
                </button>
              ))}
            </div>
            <button type="button" className="icon-btn icon-btn--lg" onClick={() => go(1)} aria-label="Próxima imagem">
              <Icon name="arrow" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
