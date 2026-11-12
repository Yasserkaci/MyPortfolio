import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'motion/react'
import { List, X } from '@phosphor-icons/react'
import { useSettings } from '../lib/settings'
import { useSmoothScroll } from './SmoothScroll'
import { cx, EASE } from '../lib/utils'

export default function Nav() {
  const { settings } = useSettings()
  const { nav, identity } = settings
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { scrollY } = useScroll()
  const loc = useLocation()
  const navigate = useNavigate()
  const { scrollTo } = useSmoothScroll()

  useMotionValueEvent(scrollY, 'change', (v) => setScrolled(v > 40))

  useEffect(() => setOpen(false), [loc.pathname])

  useEffect(() => {
    if (loc.pathname === '/' && loc.hash) {
      const t = setTimeout(() => scrollTo(loc.hash), 350)
      return () => clearTimeout(t)
    }
  }, [loc.pathname, loc.hash, scrollTo])

  const go = (href) => (e) => {
    if (!href) return
    if (href.startsWith('#')) {
      e.preventDefault()
      setOpen(false)
      if (loc.pathname !== '/') navigate('/' + href)
      else scrollTo(href)
    }
  }

  const logo = nav.logoText || identity.name
  const dot = logo.length <= 3

  return (
    <>
      <header className="nav">
        <div className={cx('nav-inner', scrolled && 'scrolled')}>
          <Link to="/" className="nav-logo" aria-label="Home" onClick={() => scrollTo(0)}>
            {logo}
            {dot && <span>.</span>}
          </Link>

          <ul className="nav-links">
            {nav.links.map((l) => (
              <li key={l.href + l.label}>
                <a href={l.href.startsWith('#') ? '/' + l.href : l.href} onClick={go(l.href)}>
                  <span className="roll">
                    <span data-text={l.label}>{l.label}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>

          <div className="nav-right">
            {nav.ctaLabel && (
              <a className="btn btn-sm btn-primary" href={nav.ctaHref} onClick={go(nav.ctaHref)}>
                {nav.ctaLabel}
              </a>
            )}
            <button className="nav-burger" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen((o) => !o)}>
              {open ? <X size={22} /> : <List size={22} />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="nav-sheet"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setOpen(false)}
          >
            <motion.nav
              className="nav-sheet-inner"
              initial={{ y: 24, scale: 0.98, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 12, scale: 0.98, opacity: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              onClick={(e) => e.stopPropagation()}
            >
              {nav.links.map((l) => (
                <a key={l.href + l.label} href={l.href} onClick={go(l.href)}>
                  {l.label}
                </a>
              ))}
              {nav.ctaLabel && (
                <a className="btn btn-primary" href={nav.ctaHref} onClick={go(nav.ctaHref)} style={{ marginTop: 12 }}>
                  {nav.ctaLabel}
                </a>
              )}
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
