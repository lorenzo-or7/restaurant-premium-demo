import { useEffect, useRef, useState, useSyncExternalStore, type RefObject } from 'react'

export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (cb) => {
      const mql = window.matchMedia(query)
      mql.addEventListener('change', cb)
      return () => mql.removeEventListener('change', cb)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}

/** Retorna o id da seção mais visível próxima ao topo da viewport. */
export function useActiveSection(ids: readonly string[]) {
  const [active, setActive] = useState<string | null>(null)
  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[]
    if (!els.length) return
    const visible = new Map<string, number>()
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) visible.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0)
        let best: string | null = null
        let bestRatio = 0
        for (const id of ids) {
          const r = visible.get(id) ?? 0
          if (r > bestRatio) {
            best = id
            bestRatio = r
          }
        }
        setActive(best)
      },
      { rootMargin: '-35% 0px -55% 0px', threshold: [0, 0.01, 0.25, 0.5, 1] },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [ids])
  return active
}

/** Trava o scroll do documento preservando a largura da barra de rolagem. */
export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return
    const { body, documentElement } = document
    const sbw = window.innerWidth - documentElement.clientWidth
    const prev = { overflow: body.style.overflow, pr: body.style.paddingRight }
    body.style.overflow = 'hidden'
    if (sbw > 0) body.style.paddingRight = `${sbw}px`
    return () => {
      body.style.overflow = prev.overflow
      body.style.paddingRight = prev.pr
    }
  }, [locked])
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/** Mantém o foco dentro de um diálogo, fecha com Esc e devolve o foco ao gatilho. */
export function useDialog(open: boolean, ref: RefObject<HTMLElement | null>, onClose: () => void) {
  const closeRef = useRef(onClose)
  useEffect(() => {
    closeRef.current = onClose
  }, [onClose])
  useEffect(() => {
    if (!open) return
    const trigger = document.activeElement as HTMLElement | null
    const node = ref.current
    const first = node?.querySelector<HTMLElement>('[data-autofocus]') ?? node?.querySelector<HTMLElement>(FOCUSABLE)
    requestAnimationFrame(() => first?.focus({ preventScroll: true }))

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        closeRef.current()
        return
      }
      if (e.key !== 'Tab' || !node) return
      const items = [...node.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.offsetParent !== null)
      if (!items.length) return
      const firstEl = items[0]
      const lastEl = items[items.length - 1]
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault()
        lastEl.focus()
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault()
        firstEl.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      if (trigger && document.contains(trigger)) trigger.focus({ preventScroll: true })
    }
  }, [open, ref])
}
