import { useEffect, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { EASE } from '../lib/utils'

const KEY = 'yk-preloaded'

/**
 * Entry moment: a single accent line draws across a blank panel, then the panel lifts
 * like a sheet and the hero headline staggers in underneath. Once per session, 1.2s total.
 */
export default function Preloader({ enabled }) {
  const reduce = useReducedMotion()
  const [show, setShow] = useState(() => enabled && !reduce && !sessionStorage.getItem(KEY))

  useEffect(() => {
    if (!show) return
    document.documentElement.style.overflow = 'hidden'
    const t = setTimeout(() => {
      setShow(false)
      sessionStorage.setItem(KEY, '1')
    }, 1150)
    return () => {
      clearTimeout(t)
      document.documentElement.style.overflow = ''
    }
  }, [show])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="preloader"
          initial={{ y: 0, borderRadius: '0 0 0 0' }}
          exit={{ y: '-100%', borderRadius: '0 0 50% 50%', transition: { duration: 0.85, ease: [0.76, 0, 0.24, 1] } }}
          aria-hidden="true"
        >
          <div className="preloader-line">
            <motion.i initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1, ease: EASE }} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
