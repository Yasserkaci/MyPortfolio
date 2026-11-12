import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useReducedMotion } from 'motion/react'
import { EASE } from '../lib/utils'

/** Fade + rise on scroll into view. Communicates hierarchy: things arrive in reading order. */
export function Reveal({ children, delay = 0, y = 28, amount = 0.25, as = 'div', className, style, once = true }) {
  const reduce = useReducedMotion()
  const Comp = motion[as] || motion.div
  return (
    <Comp
      className={className}
      style={style}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount }}
      transition={{ duration: 0.9, delay, ease: EASE }}
    >
      {children}
    </Comp>
  )
}

/**
 * Split a sentence into masked words that slide up in sequence.
 * `emphasis` word(s) render in <em>. Used for headlines only.
 */
export function SplitWords({ text, emphasis = '', delay = 0, stagger = 0.045, inView = false, className }) {
  const reduce = useReducedMotion()
  const words = String(text || '').split(/\s+/).filter(Boolean)
  const emph = emphasis
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
  const clean = (w) => w.toLowerCase().replace(/[^a-z0-9]/gi, '')

  // The trigger lives on the whole headline: a word translated out of its mask is clipped,
  // so observing the word itself would never report it as visible.
  const word = {
    hidden: { y: '110%' },
    show: (i) => ({ y: '0%', transition: { duration: 1, delay: delay + i * stagger, ease: EASE } }),
  }

  return (
    <motion.span
      className={className}
      aria-label={text}
      initial={reduce ? false : 'hidden'}
      {...(inView ? { whileInView: 'show', viewport: { once: true, amount: 0.4 } } : { animate: 'show' })}
    >
      {words.map((w, i) => {
        const isEm = emph.includes(clean(w))
        const inner = isEm ? <em>{w}</em> : w
        return (
          <span key={i} aria-hidden="true">
            <span className="word-mask">
              <motion.span variants={word} custom={i}>
                {inner}
              </motion.span>
            </span>
            {i < words.length - 1 ? ' ' : ''}
          </span>
        )
      })}
    </motion.span>
  )
}

/** Button that leans toward the cursor. Pure motion values, no React re-render per frame. */
export function Magnetic({ children, strength = 0.35, className }) {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 180, damping: 16, mass: 0.4 })
  const sy = useSpring(y, { stiffness: 180, damping: 16, mass: 0.4 })

  const onMove = (e) => {
    if (reduce || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    x.set((e.clientX - (r.left + r.width / 2)) * strength)
    y.set((e.clientY - (r.top + r.height / 2)) * strength)
  }
  const onLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x: sx, y: sy, display: 'inline-block' }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      {children}
    </motion.div>
  )
}

/** Image that unveils from the bottom edge while settling from a slight zoom. Storytelling: content arrives as you reach it. */
export function ImageReveal({ src, alt = '', eager = false, className, style, amount = 0.3, fit = 'cover', position = 'center' }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={cxClass('reveal-img', className)}
      style={style}
      initial={reduce ? false : { clipPath: 'inset(100% 0 0 0)' }}
      whileInView={{ clipPath: 'inset(0% 0 0 0)' }}
      viewport={{ once: true, amount }}
      transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1] }}
    >
      <motion.img
        src={src}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        initial={reduce ? false : { scale: 1.18 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, amount }}
        transition={{ duration: 1.4, ease: EASE }}
        style={{ width: '100%', height: '100%', objectFit: fit, objectPosition: position }}
      />
    </motion.div>
  )
}

const cxClass = (...a) => a.filter(Boolean).join(' ')

export const pageVariants = {
  initial: { opacity: 0, y: 18 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.35, ease: EASE } },
}
