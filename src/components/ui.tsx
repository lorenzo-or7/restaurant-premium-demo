import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  type HTMLMotionProps,
} from 'motion/react'
import { useRef, type ReactNode, type PointerEvent } from 'react'
import { getImage, type ImageName } from '../content/images'
import { site } from '../config/site'
import { useMediaQuery } from '../hooks'

/* ---------------------------------------------------------------
 * Img — srcset responsivo + dimensões intrínsecas (evita CLS)
 * ------------------------------------------------------------- */
interface ImgProps {
  name: ImageName
  sizes: string
  priority?: boolean
  className?: string
  /** Sobrescreve o alt padrão. Use "" para imagens decorativas. */
  alt?: string
  position?: string
}

export function Img({ name, sizes, priority, className, alt, position }: ImgProps) {
  const img = getImage(name)
  return (
    <img
      className={className}
      src={img.src}
      srcSet={img.srcSet}
      sizes={sizes}
      width={img.width}
      height={img.height}
      alt={alt ?? img.alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      fetchPriority={priority ? 'high' : 'auto'}
      style={position ? { objectPosition: position } : undefined}
      draggable={false}
    />
  )
}

/* ---------------------------------------------------------------
 * Wordmark tipográfico
 * ------------------------------------------------------------- */
export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`wordmark ${className}`} aria-label={site.brand.name}>
      <span aria-hidden="true">{site.brand.name}</span>
    </span>
  )
}

/* ---------------------------------------------------------------
 * Ícones (traço fino, desenhados para o projeto)
 * ------------------------------------------------------------- */
type IconName = 'arrow' | 'arrow-left' | 'close' | 'plus' | 'minus' | 'down' | 'copy' | 'check' | 'chat' | 'pin' | 'expand'

const paths: Record<IconName, ReactNode> = {
  arrow: <path d="M4 12h15m-5-5 5 5-5 5" />,
  'arrow-left': <path d="M20 12H5m5-5-5 5 5 5" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  down: <path d="M12 4v15m-5-5 5 5 5-5" />,
  copy: (
    <>
      <rect x="8" y="8" width="11" height="11" rx="1.5" />
      <path d="M5 15V6.5A1.5 1.5 0 0 1 6.5 5H15" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  chat: <path d="M5 18.5V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H8.5L5 18.5Z" />,
  pin: (
    <>
      <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" />
      <circle cx="12" cy="10" r="2.2" />
    </>
  ),
  expand: <path d="M14 5h5v5M10 19H5v-5M19 5l-6 6M5 19l6-6" />,
}

export function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {paths[name]}
    </svg>
  )
}

/* ---------------------------------------------------------------
 * Magnetic — atração discreta ao cursor (somente ponteiro fino)
 * ------------------------------------------------------------- */
export function Magnetic({ children, strength = 0.22 }: { children: ReactNode; strength?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const reduce = useReducedMotion()
  const fine = useMediaQuery('(hover: hover) and (pointer: fine)')
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 })
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 })
  const enabled = fine && !reduce

  const onMove = (e: PointerEvent) => {
    if (!enabled || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    x.set((e.clientX - (r.left + r.width / 2)) * strength)
    y.set((e.clientY - (r.top + r.height / 2)) * strength)
  }
  const reset = () => {
    x.set(0)
    y.set(0)
  }
  return (
    <motion.span
      ref={ref}
      className="magnetic"
      style={enabled ? { x: sx, y: sy } : undefined}
      onPointerMove={onMove}
      onPointerLeave={reset}
    >
      {children}
    </motion.span>
  )
}

/* ---------------------------------------------------------------
 * Botões / links de ação com spring press
 * ------------------------------------------------------------- */
type Variant = 'solid' | 'ghost' | 'line'

interface ActionLinkProps extends Omit<HTMLMotionProps<'a'>, 'children'> {
  variant?: Variant
  icon?: IconName
  children: ReactNode
}

const press = { scale: 0.965 }
const pressSpring = { type: 'spring', stiffness: 520, damping: 28 } as const

export function ActionLink({ variant = 'solid', icon = 'arrow', children, className = '', ...rest }: ActionLinkProps) {
  return (
    <motion.a whileTap={press} transition={pressSpring} className={`btn btn--${variant} ${className}`} {...rest}>
      <span className="btn__label">{children}</span>
      {icon && (
        <span className="btn__icon">
          <Icon name={icon} size={16} />
        </span>
      )}
    </motion.a>
  )
}

interface ActionButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: Variant
  icon?: IconName | null
  children: ReactNode
}

export function ActionButton({ variant = 'solid', icon = 'arrow', children, className = '', type = 'button', ...rest }: ActionButtonProps) {
  return (
    <motion.button type={type} whileTap={press} transition={pressSpring} className={`btn btn--${variant} ${className}`} {...rest}>
      <span className="btn__label">{children}</span>
      {icon && (
        <span className="btn__icon">
          <Icon name={icon} size={16} />
        </span>
      )}
    </motion.button>
  )
}

/* ---------------------------------------------------------------
 * Índice de seção: "03 —— CARDÁPIO"
 * ------------------------------------------------------------- */
export function SectionIndex({ index, label }: { index: string; label: string }) {
  return (
    <p className="section-index label">
      <span className="num">{index}</span>
      <span className="rule" aria-hidden="true" />
      <span>{label}</span>
    </p>
  )
}
