import { useEffect, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { EASE } from '../lib/utils'

const KEY = 'yk-preloaded'

/** Entry moment: the name is revealed letter by letter, then the panel lifts. Shown once per session. */
export default function Preloader({ name, enabled }) {
  const reduce = useReducedMotion()
  const [show, setShow] = useState(() => enabled && !reduce && !sessionStorage.getItem(KEY))

  useEffect(() => {
    if (!show) return
    document.documentElement.style.overflow = 'hidden'
    const t = setTimeout(() => {
      setShow(false)
      sessionStorage.setItem(KEY, '1')
    }, 1900)
    return () => {
      clearTimeout(t)
      document.documentElement.style.overflow = ''
    }
  }, [show])

  const letters = Array.from(name || '')

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="preloader"
          initial={{ y: 0 }}
          exit={{ y: '-100%', transition: { duration: 0.9, ease: [0.76, 0, 0.24, 1] } }}
          aria-hidden="true"
        >
          <div className="preloader-name">
            {letters.map((ch, i) => (
              <motion.span
                key={i}
                initial={{ y: '110%' }}
                animate={{ y: 0 }}
                transition={{ duration: 0.9, delay: 0.1 + i * 0.035, ease: EASE }}
                style={{ whiteSpace: 'pre' }}
              >
                {ch}
              </motion.span>
            ))}
          </div>
          <div className="preloader-bar">
            <motion.i initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1.5, ease: EASE }} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
