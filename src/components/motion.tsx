import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from 'motion/react'
import { useRef, type ElementType, type ReactNode } from 'react'

import { EASE, EASE_IN_OUT } from './easing'

const VIEW = { once: true, margin: '0px 0px -12% 0px' } as const

/* ---------------------------------------------------------------
 * LineReveal — cada linha sobe de dentro de uma máscara.
 * O texto completo fica acessível (aria-label no contêiner).
 * ------------------------------------------------------------- */
interface LineRevealProps {
  lines: ReactNode[]
  as?: ElementType
  className?: string
  delay?: number
  stagger?: number
  /** Anima ao entrar na viewport (padrão) ou imediatamente. */
  trigger?: 'view' | 'mount'
  label?: string
  id?: string
}

export function LineReveal({ id, lines, as: Tag = 'h2', className = '', delay = 0, stagger = 0.09, trigger = 'view', label }: LineRevealProps) {
  const reduce = useReducedMotion()
  const animateProps =
    trigger === 'mount' ? { initial: 'hidden', animate: 'show' } : { initial: 'hidden', whileInView: 'show', viewport: VIEW }
  return (
    <Tag id={id} className={className} aria-label={label}>
      <motion.span className="line-reveal" {...animateProps} aria-hidden={label ? true : undefined}>
        {lines.map((line, i) => (
          <span className="line-reveal__mask" key={i}>
            <motion.span
              className="line-reveal__line"
              variants={{
                hidden: reduce ? { opacity: 0 } : { y: '108%', rotate: 2 },
                show: reduce
                  ? { opacity: 1, transition: { duration: 0.4, delay: delay + i * 0.05 } }
                  : { y: '0%', rotate: 0, transition: { duration: 1.05, ease: EASE, delay: delay + i * stagger } },
              }}
            >
              {line}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </Tag>
  )
}

/* ---------------------------------------------------------------
 * FadeUp — entrada discreta para blocos de texto e controles.
 * ------------------------------------------------------------- */
export function FadeUp({
  children,
  delay = 0,
  className,
  as = 'div',
  y = 18,
}: {
  children: ReactNode
  delay?: number
  className?: string
  as?: 'div' | 'p' | 'li' | 'span'
  y?: number
}) {
  const reduce = useReducedMotion()
  const Comp = motion[as]
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEW}
      transition={{ duration: 0.8, ease: EASE, delay }}
    >
      {children}
    </Comp>
  )
}

/* ---------------------------------------------------------------
 * ImageReveal — abertura por clip-path + leve zoom interno.
 * ------------------------------------------------------------- */
type From = 'bottom' | 'top' | 'left' | 'right'
const hiddenClip: Record<From, string> = {
  bottom: 'inset(100% 0% 0% 0%)',
  top: 'inset(0% 0% 100% 0%)',
  left: 'inset(0% 100% 0% 0%)',
  right: 'inset(0% 0% 0% 100%)',
}

export function ImageReveal({
  children,
  from = 'bottom',
  delay = 0,
  className = '',
  trigger = 'view',
  duration = 1.25,
  startClip,
}: {
  children: ReactNode
  from?: From
  delay?: number
  className?: string
  trigger?: 'view' | 'mount'
  duration?: number
  /** Máscara inicial personalizada (ex.: revelação parcial para não atrasar o LCP). */
  startClip?: string
}) {
  const reduce = useReducedMotion()
  const anim = trigger === 'mount' ? { initial: 'hidden', animate: 'show' } : { initial: 'hidden', whileInView: 'show', viewport: VIEW }
  return (
    <motion.div
      className={`image-reveal ${className}`}
      {...anim}
      variants={{
        hidden: reduce ? { opacity: 0 } : { clipPath: startClip ?? hiddenClip[from] },
        show: reduce
          ? { opacity: 1, transition: { duration: 0.5, delay } }
          : { clipPath: 'inset(0% 0% 0% 0%)', transition: { duration, ease: EASE_IN_OUT, delay } },
      }}
    >
      <motion.div
        className="image-reveal__inner"
        variants={{
          hidden: reduce ? {} : { scale: 1.18 },
          show: reduce ? {} : { scale: 1, transition: { duration: duration + 0.5, ease: EASE, delay } },
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

/* ---------------------------------------------------------------
 * Parallax — deslocamento vertical sutil ligado ao scroll.
 * ------------------------------------------------------------- */
export function Parallax({ children, distance = 60, className = '' }: { children: ReactNode; distance?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [-distance, distance])
  return (
    <div ref={ref} className={`parallax ${className}`}>
      <motion.div className="parallax__inner" style={reduce ? undefined : { y, scale: 1 + (distance * 2.4) / 1000 }}>
        {children}
      </motion.div>
    </div>
  )
}

/* ---------------------------------------------------------------
 * ScrollWords — palavras acendem conforme o scroll (storytelling).
 * ------------------------------------------------------------- */
export function ScrollWords({ text, className = '' }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 85%', 'end 45%'] })
  const words = text.split(' ')
  if (reduce) return <p className={className}>{text}</p>
  return (
    <p ref={ref} className={className}>
      <span className="visually-hidden">{text}</span>
      {words.map((w, i) => (
        <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>
          {w}
        </Word>
      ))}
    </p>
  )
}

function Word({ children, progress, range }: { children: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.18, 1])
  return (
    <span className="scroll-word" aria-hidden="true">
      <motion.span style={{ opacity }}>{children}</motion.span>{' '}
    </span>
  )
}
