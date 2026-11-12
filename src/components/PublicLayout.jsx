import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { useSettings } from '../lib/settings'
import { SmoothScroll } from './SmoothScroll'
import Nav from './Nav'
import Footer from './Footer'
import Preloader from './Preloader'
import { pageVariants } from './motion'

function ScrollRestore() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (!hash) window.scrollTo({ top: 0, behavior: 'auto' })
  }, [pathname, hash])
  return null
}

export default function PublicLayout() {
  const { settings, loading } = useSettings()
  const loc = useLocation()

  return (
    <SmoothScroll enabled={settings.theme.smoothScroll}>
      <ScrollRestore />
      {!loading && <Preloader enabled={settings.theme.preloader && loc.pathname === '/'} />}
      <Nav />
      <AnimatePresence mode="wait" initial={false}>
        <motion.main key={loc.pathname} variants={pageVariants} initial="initial" animate="enter" exit="exit">
          <Outlet />
        </motion.main>
      </AnimatePresence>
      <Footer />
    </SmoothScroll>
  )
}
