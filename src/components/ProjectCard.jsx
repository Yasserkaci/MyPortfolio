import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useMotionValue, useSpring, useReducedMotion } from 'motion/react'
import { ArrowUpRight } from '@phosphor-icons/react'
import { Reveal, ImageReveal } from './motion'

export default function ProjectCard({ p, index = 0 }) {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 260, damping: 24, mass: 0.5 })
  const sy = useSpring(my, { stiffness: 260, damping: 24, mass: 0.5 })

  const onMove = (e) => {
    if (!ref.current || reduce) return
    const r = ref.current.getBoundingClientRect()
    mx.set(e.clientX - r.left)
    my.set(e.clientY - r.top)
  }

  return (
    <Reveal as="article" className="work-card" delay={(index % 2) * 0.08}>
      <Link ref={ref} to={`/work/${p.slug}`} className="work-media" aria-label={`Open ${p.title}`} onPointerMove={onMove}>
        {p.cover_url ? (
          <ImageReveal src={p.cover_url} alt={p.title} eager={index < 2} />
        ) : (
          <div className="skeleton" style={{ position: 'absolute', inset: 0 }} />
        )}
        <motion.span className="work-cursor" style={{ x: sx, y: sy }} aria-hidden="true">
          View <ArrowUpRight size={14} weight="bold" />
        </motion.span>
        <span className="work-arrow">
          <ArrowUpRight size={22} weight="bold" />
        </span>
      </Link>
      <div className="work-body">
        <h3>
          <Link to={`/work/${p.slug}`}>{p.title}</Link>
        </h3>
        {p.year && <span className="work-year">{p.year}</span>}
        {p.tagline && <p>{p.tagline}</p>}
        {p.tags?.length > 0 && (
          <div className="work-tags">
            {p.tags.map((t) => (
              <span className="tag" key={t}>
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </Reveal>
  )
}
