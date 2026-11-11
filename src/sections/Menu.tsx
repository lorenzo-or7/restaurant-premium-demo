import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'motion/react'
import { useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { dietLabels, menu, type DietTag, type Dish } from '../content/menu'
import { menuSection } from '../content/copy'
import { formatPrice } from '../lib/format'
import { Icon, Img, SectionIndex } from '../components/ui'
import { EASE, EASE_IN_OUT } from '../components/easing'
import { LineReveal } from '../components/motion'
import { DishDialog } from './DishDialog'

const dietOrder: DietTag[] = ['vegetariano', 'vegano', 'sem-gluten', 'sem-lactose']

export function Menu() {
  const [catId, setCatId] = useState(menu[0].id)
  const [filters, setFilters] = useState<DietTag[]>([])
  const [openId, setOpenId] = useState<string | null>(null)
  /** Prato que abriu o diálogo: só ele compartilha a transição de imagem com a lista. */
  const [originId, setOriginId] = useState<string | null>(null)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const reduce = useReducedMotion()

  const category = menu.find((c) => c.id === catId) ?? menu[0]
  const dishes = useMemo(
    () => category.dishes.filter((d) => filters.every((f) => d.diet.includes(f))),
    [category, filters],
  )
  const openIndex = dishes.findIndex((d) => d.id === openId)
  const openDish: Dish | undefined = dishes[openIndex]

  const toggleFilter = (f: DietTag) =>
    setFilters((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]))

  const onTabKey = (e: KeyboardEvent, i: number) => {
    const n = menu.length
    let next = -1
    if (e.key === 'ArrowRight') next = (i + 1) % n
    if (e.key === 'ArrowLeft') next = (i - 1 + n) % n
    if (e.key === 'Home') next = 0
    if (e.key === 'End') next = n - 1
    if (next < 0) return
    e.preventDefault()
    setCatId(menu[next].id)
    tabRefs.current[next]?.focus()
  }

  return (
    <section id="cardapio" className="menu" aria-labelledby="menu-title">
      <div className="menu__stage panel">
        <AnimatePresence initial={false}>
          <motion.div
            key={category.id}
            className="menu__stage-img"
            initial={reduce ? { opacity: 0 } : { clipPath: 'inset(0% 0% 0% 100%)' }}
            animate={reduce ? { opacity: 1 } : { clipPath: 'inset(0% 0% 0% 0%)' }}
            exit={{ opacity: 1 }}
            transition={{ duration: 1, ease: EASE_IN_OUT }}
          >
            <motion.div initial={reduce ? false : { scale: 1.12 }} animate={{ scale: 1 }} transition={{ duration: 1.5, ease: EASE }}>
              <Img name={category.image} sizes="(min-width: 1024px) 45vw, 100vw" alt="" />
            </motion.div>
          </motion.div>
        </AnimatePresence>
        <div className="menu__stage-scrim" aria-hidden="true" />
        <div className="menu__stage-text">
          <SectionIndex index={menuSection.index} label={menuSection.label} />
          <LineReveal id="menu-title" className="menu__title display" label="Cardápio" lines={['Cardápio']} />
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={category.id}
              className="menu__stage-sub serif-italic"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              {category.title}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      <div className="menu__board panel panel--outline">
        <div className="menu__controls">
          <div className="menu__tabs" role="tablist" aria-label="Categorias do cardápio">
            {menu.map((c, i) => {
              const selected = c.id === catId
              return (
                <button
                  key={c.id}
                  ref={(el) => {
                    tabRefs.current[i] = el
                  }}
                  role="tab"
                  type="button"
                  id={`tab-${c.id}`}
                  aria-selected={selected}
                  aria-controls="menu-panel"
                  tabIndex={selected ? 0 : -1}
                  className={`menu__tab label ${selected ? 'is-active' : ''}`}
                  onClick={() => setCatId(c.id)}
                  onKeyDown={(e) => onTabKey(e, i)}
                >
                  {selected && (
                    <motion.span
                      layoutId="menu-tab-pill"
                      className="menu__tab-pill"
                      transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                    />
                  )}
                  <span className="menu__tab-text">{c.label}</span>
                </button>
              )
            })}
          </div>

          <fieldset className="menu__filters">
            <legend className="label muted">Filtrar por</legend>
            <div className="menu__chips">
              {dietOrder.map((f) => {
                const on = filters.includes(f)
                return (
                  <motion.button
                    key={f}
                    type="button"
                    className={`chip ${on ? 'is-on' : ''}`}
                    aria-pressed={on}
                    onClick={() => toggleFilter(f)}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="chip__mark" aria-hidden="true">
                      {on ? <Icon name="check" size={12} /> : dietLabels[f].short}
                    </span>
                    {dietLabels[f].label}
                  </motion.button>
                )
              })}
              <AnimatePresence>
                {filters.length > 0 && (
                  <motion.button
                    type="button"
                    className="chip chip--clear"
                    onClick={() => setFilters([])}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    Limpar
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </fieldset>
        </div>

        <div id="menu-panel" role="tabpanel" aria-labelledby={`tab-${category.id}`} className="menu__panel">
          <div className="menu__panel-head">
            <h3 className="ornament display menu__cat-title">{category.label}</h3>
            <p className="muted menu__cat-note">{category.note}</p>
            <p className="menu__count label" aria-live="polite">
              {dishes.length} de {category.dishes.length} {category.dishes.length === 1 ? 'item' : 'itens'}
              <span className="menu__price-note"> · {menuSection.priceNote}</span>
            </p>
          </div>

          <LayoutGroup>
            <AnimatePresence mode="wait" initial={false}>
              <motion.ul
                key={category.id + filters.join()}
                className="dish-list"
                initial="hidden"
                animate="show"
                exit="exit"
                variants={{
                  hidden: {},
                  show: { transition: { staggerChildren: 0.05 } },
                  exit: { opacity: 0, transition: { duration: 0.18 } },
                }}
              >
                {dishes.map((d) => (
                  <motion.li
                    key={d.id}
                    variants={{
                      hidden: { opacity: 0, y: reduce ? 0 : 14 },
                      show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
                    }}
                  >
                    <button
                      type="button"
                      className="dish"
                      onClick={() => {
                        setOriginId(d.id)
                        setOpenId(d.id)
                      }}
                      aria-haspopup="dialog"
                      aria-label={`${d.name}, ${formatPrice(d.price)}. Ver detalhes`}
                    >
                      <motion.span layoutId={`dish-media-${d.id}`} className="dish__thumb">
                        <Img name={d.image} sizes="120px" alt="" />
                      </motion.span>
                      <span className="dish__body">
                        <span className="dish__line">
                          <span className="dish__name display">{d.name}</span>
                          <span className="dish__leader" aria-hidden="true" />
                          <span className="dish__price">{formatPrice(d.price)}</span>
                        </span>
                        <span className="dish__summary">{d.summary}</span>
                        <span className="dish__meta">
                          {d.signature && <span className="tag tag--accent">Assinatura</span>}
                          {d.diet.map((t) => (
                            <span key={t} className="tag" title={dietLabels[t].label}>
                              {dietLabels[t].short}
                              <span className="visually-hidden"> — {dietLabels[t].label}</span>
                            </span>
                          ))}
                          <span className="dish__more label" aria-hidden="true">
                            Detalhes <Icon name="plus" size={12} />
                          </span>
                        </span>
                      </span>
                    </button>
                  </motion.li>
                ))}
                {dishes.length === 0 && (
                  <motion.li className="menu__empty" variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}>
                    <p className="display">Nada por aqui</p>
                    <p className="muted">Nenhum item desta categoria atende a todos os filtros escolhidos.</p>
                    <button type="button" className="text-link" onClick={() => setFilters([])}>
                      Limpar filtros
                    </button>
                  </motion.li>
                )}
              </motion.ul>
            </AnimatePresence>

            <p className="menu__legend muted">
              {dietOrder.map((t) => (
                <span key={t}>
                  <b>{dietLabels[t].short}</b> {dietLabels[t].label}
                </span>
              ))}
            </p>

            <DishDialog
              dish={openDish}
              originId={originId}
              onClose={() => setOpenId(null)}
              onPrev={openIndex > 0 ? () => setOpenId(dishes[openIndex - 1].id) : undefined}
              onNext={openIndex >= 0 && openIndex < dishes.length - 1 ? () => setOpenId(dishes[openIndex + 1].id) : undefined}
              position={openIndex >= 0 ? `${openIndex + 1} / ${dishes.length}` : ''}
            />
          </LayoutGroup>
        </div>
      </div>
    </section>
  )
}
