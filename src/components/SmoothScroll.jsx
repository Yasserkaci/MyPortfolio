import { createContext, useContext, useEffect, useRef, useCallback } from 'react'
import Lenis from 'lenis'
import { useReducedMotion } from 'motion/react'

const Ctx = createContext({ scrollTo: () => {} })

export function SmoothScroll({ enabled = true, children }) {
  const lenisRef = useRef(null)
  const reduce = useReducedMotion()

  useEffect(() => {
    if (!enabled || reduce) return
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true, autoRaf: true })
    lenisRef.current = lenis
    return () => {
      lenis.destroy()
      lenisRef.current = null
    }
  }, [enabled, reduce])

  const scrollTo = useCallback(
    (target, opts = {}) => {
      const el = typeof target === 'string' ? document.querySelector(target) : target
      if (lenisRef.current) {
        lenisRef.current.scrollTo(el ?? target, { offset: -24, duration: 1.4, ...opts })
      } else if (el) {
        el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
      } else if (typeof target === 'number') {
        window.scrollTo({ top: target, behavior: reduce ? 'auto' : 'smooth' })
      }
    },
    [reduce],
  )

  return <Ctx.Provider value={{ scrollTo, lenis: lenisRef }}>{children}</Ctx.Provider>
}

export const useSmoothScroll = () => useContext(Ctx)
