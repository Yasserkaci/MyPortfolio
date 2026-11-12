import { useRef } from 'react'
import { motion, useAnimationFrame, useMotionTemplate, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, useVelocity } from 'motion/react'
import { Asterisk } from '@phosphor-icons/react'

const wrap = (min, max, v) => {
  const range = max - min
  return ((((v - min) % range) + range) % range) + min
}

/**
 * The one marquee on the page: the stack strip under the hero.
 * Drifts on its own and follows scroll velocity, so it feels attached to the page rather than looping over it.
 */
export default function Marquee({ items = [], baseSpeed = 2.2 }) {
  const reduce = useReducedMotion()
  const x = useMotionValue(0)
  const dir = useRef(1)
  const { scrollY } = useScroll()
  const velocity = useVelocity(scrollY)
  const smooth = useSpring(velocity, { damping: 50, stiffness: 400 })
  const factor = useTransform(smooth, [0, 1200], [0, 4], { clamp: false })

  useAnimationFrame((_, delta) => {
    if (reduce) return
    const f = factor.get()
    if (f < 0) dir.current = -1
    else if (f > 0) dir.current = 1
    let move = dir.current * baseSpeed * (delta / 1000)
    move += move * Math.abs(f)
    x.set(wrap(-50, 0, x.get() + move * -1))
  })

  const transform = useMotionTemplate`translate3d(${x}%, 0, 0)`

  if (!items.length) return null
  const row = [...items, ...items]
  return (
    <div className="marquee" aria-label={items.join(', ')}>
      <motion.div className="marquee-track" style={{ transform }}>
        {row.map((it, i) => (
          <span className="marquee-item" key={i} aria-hidden={i >= items.length}>
            {it}
            <Asterisk weight="bold" />
          </span>
        ))}
      </motion.div>
    </div>
  )
}
