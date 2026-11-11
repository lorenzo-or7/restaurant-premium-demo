import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { experience } from '../content/copy'
import { Img, SectionIndex } from '../components/ui'
import { EASE, EASE_IN_OUT } from '../components/easing'
import { FadeUp, ImageReveal, LineReveal } from '../components/motion'

export function Experience() {
  const [active, setActive] = useState(0)
  const refs = useRef<(HTMLElement | null)[]>([])
  const reduce = useReducedMotion()

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.index))
        }
      },
      { rootMargin: '-45% 0px -45% 0px' },
    )
    refs.current.forEach((el) => el && io.observe(el))
    return () => io.disconnect()
  }, [])

  const current = experience.chapters[active]

  return (
    <section id="experiencia" className="experience" aria-labelledby="experience-title">
      <div className="experience__stage panel" aria-hidden="true">
        <AnimatePresence initial={false}>
          <motion.div
            key={current.id}
            className="experience__frame"
            initial={reduce ? { opacity: 0 } : { clipPath: 'inset(100% 0% 0% 0%)' }}
            animate={reduce ? { opacity: 1 } : { clipPath: 'inset(0% 0% 0% 0%)' }}
            exit={reduce ? { opacity: 0 } : { opacity: 1 }}
            transition={{ duration: 1.1, ease: EASE_IN_OUT }}
          >
            <motion.div
              className="experience__frame-img"
              initial={reduce ? false : { scale: 1.15 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.6, ease: EASE }}
            >
              <Img name={current.image} sizes="(min-width: 1024px) 50vw, 0px" alt="" />
            </motion.div>
          </motion.div>
        </AnimatePresence>
        <div className="experience__stage-scrim" />
        <div className="experience__counter">
          <span className="experience__counter-num display">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={active}
                initial={reduce ? { opacity: 0 } : { y: '100%' }}
                animate={reduce ? { opacity: 1 } : { y: '0%' }}
                exit={reduce ? { opacity: 0 } : { y: '-100%' }}
                transition={{ duration: 0.7, ease: EASE }}
              >
                0{active + 1}
              </motion.span>
            </AnimatePresence>
          </span>
          <span className="label">/ 0{experience.chapters.length}</span>
        </div>
        <div className="experience__progress">
          {experience.chapters.map((c, i) => (
            <span key={c.id} className={i === active ? 'is-active' : ''} />
          ))}
        </div>
      </div>

      <div className="experience__content panel">
        <header
          className="experience__head"
          data-index={0}
          ref={(el) => {
            refs.current[experience.chapters.length] = el
          }}
        >
          <SectionIndex index={experience.index} label={experience.label} />
          <LineReveal
            id="experience-title"
            className="experience__title display"
            label={experience.title}
            lines={['Uma noite', <em key="e">em quatro</em>, 'tempos']}
          />
        </header>

        <ol className="experience__chapters">
          {experience.chapters.map((c, i) => (
            <li
              key={c.id}
              ref={(el) => {
                refs.current[i] = el
              }}
              data-index={i}
              className={`chapter ${i === active ? 'is-active' : ''}`}
            >
              <div className="chapter__media">
                <ImageReveal from="bottom">
                  <Img name={c.image} sizes="(min-width: 1024px) 0px, 92vw" />
                </ImageReveal>
              </div>
              <span className="chapter__num label">0{i + 1}</span>
              <h3 className="chapter__title display">{c.title}</h3>
              <FadeUp>
                <p className="chapter__text">{c.text}</p>
              </FadeUp>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
