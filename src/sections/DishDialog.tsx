import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useRef } from 'react'
import { createPortal } from 'react-dom'
import { dietLabels, type Dish } from '../content/menu'
import { formatPrice } from '../lib/format'
import { useDialog, useScrollLock } from '../hooks'
import { Icon, Img } from '../components/ui'
import { EASE } from '../components/easing'

interface Props {
  dish: Dish | undefined
  originId: string | null
  onClose: () => void
  onPrev?: () => void
  onNext?: () => void
  position: string
}

export function DishDialog({ dish, originId, onClose, onPrev, onNext, position }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const open = Boolean(dish)
  useScrollLock(open)
  useDialog(open, ref, onClose)

  const goReserve = () => {
    onClose()
    requestAnimationFrame(() => document.getElementById('reservas')?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }))
  }

  return createPortal(
    <AnimatePresence>
      {dish && (
        <motion.div
          className="dish-dialog"
          key="dish-dialog"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.35, delay: 0.1 } }}
        >
          <div className="dish-dialog__backdrop" onClick={onClose} aria-hidden="true" />
          <motion.div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-labelledby="dish-dialog-title"
            aria-describedby="dish-dialog-desc"
            className="dish-dialog__card"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <motion.div
              className="dish-dialog__media"
              layoutId={!reduce && dish.id === originId ? `dish-media-${dish.id}` : undefined}
              transition={{ duration: 0.75, ease: EASE }}
            >
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={dish.id}
                  className="dish-dialog__img"
                  initial={{ opacity: 0, scale: 1.06 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: EASE }}
                >
                  <Img name={dish.image} sizes="(min-width: 900px) 50vw, 100vw" priority />
                </motion.div>
              </AnimatePresence>
            </motion.div>

            <div className="dish-dialog__body">
              <div className="dish-dialog__bar">
                <span className="label muted">{position}</span>
                <div className="dish-dialog__nav">
                  <button type="button" className="icon-btn" onClick={onPrev} disabled={!onPrev} aria-label="Item anterior">
                    <Icon name="arrow-left" />
                  </button>
                  <button type="button" className="icon-btn" onClick={onNext} disabled={!onNext} aria-label="Próximo item">
                    <Icon name="arrow" />
                  </button>
                  <button type="button" className="icon-btn" onClick={onClose} aria-label="Fechar detalhes" data-autofocus>
                    <Icon name="close" />
                  </button>
                </div>
              </div>

              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={dish.id}
                  className="dish-dialog__content"
                  initial={{ opacity: 0, y: reduce ? 0 : 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: reduce ? 0 : -8 }}
                  transition={{ duration: 0.35, ease: EASE }}
                >
                  {dish.signature && <span className="tag tag--accent">Assinatura da casa</span>}
                  <h3 id="dish-dialog-title" className="dish-dialog__title display">
                    {dish.name}
                  </h3>
                  <p id="dish-dialog-desc" className="dish-dialog__desc">
                    {dish.description}
                  </p>

                  <dl className="dish-dialog__facts">
                    <div>
                      <dt className="label">Ingredientes</dt>
                      <dd>
                        <ul className="dish-dialog__ingredients">
                          {dish.ingredients.map((i) => (
                            <li key={i}>{i}</li>
                          ))}
                        </ul>
                      </dd>
                    </div>
                    <div>
                      <dt className="label">Informações alimentares</dt>
                      <dd className="dish-dialog__diet">
                        {dish.diet.length ? (
                          dish.diet.map((t) => (
                            <span key={t} className="tag">
                              {dietLabels[t].label}
                            </span>
                          ))
                        ) : (
                          <span className="muted">Sem restrições específicas sinalizadas</span>
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt className="label">Alérgenos</dt>
                      <dd className="muted">{dish.allergens.length ? dish.allergens.join(', ') : 'Nenhum alérgeno principal declarado'}</dd>
                    </div>
                  </dl>

                  <div className="dish-dialog__footer">
                    <p className="dish-dialog__price">
                      <span className="display">{formatPrice(dish.price)}</span>
                      <span className="label muted">Valor demonstrativo</span>
                    </p>
                    <motion.button type="button" className="btn btn--solid" onClick={goReserve} whileTap={{ scale: 0.965 }}>
                      <span className="btn__label">Reservar mesa</span>
                      <span className="btn__icon">
                        <Icon name="arrow" size={16} />
                      </span>
                    </motion.button>
                  </div>
                  <p className="dish-dialog__disclaimer muted">
                    Informe restrições e alergias à equipe no momento da reserva.
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
