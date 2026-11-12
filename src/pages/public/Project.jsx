import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import DOMPurify from 'dompurify'
import { ArrowLeft, ArrowRight, ArrowUpRight, GithubLogo } from '@phosphor-icons/react'
import { fetchProject, fetchProjects } from '../../lib/data'
import { Reveal, SplitWords, ImageReveal } from '../../components/motion'
import NotFound from './NotFound'

DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A') {
    node.setAttribute('target', '_blank')
    node.setAttribute('rel', 'noopener noreferrer')
  }
})

export default function Project() {
  const { slug } = useParams()
  const [p, setP] = useState(undefined)
  const [all, setAll] = useState([])
  const reduce = useReducedMotion()

  useEffect(() => {
    let alive = true
    setP(undefined)
    fetchProject(slug)
      .then((d) => alive && setP(d ?? null))
      .catch(() => alive && setP(null))
    fetchProjects().then((d) => alive && setAll(d)).catch(() => {})
    return () => {
      alive = false
    }
  }, [slug])

  useEffect(() => {
    if (p?.title) document.title = p.title
  }, [p])

  const next = useMemo(() => {
    if (!p || !all.length) return null
    const i = all.findIndex((x) => x.id === p.id)
    return all[(i + 1) % all.length] || null
  }, [p, all])

  const html = useMemo(
    () => (p?.content_html ? DOMPurify.sanitize(p.content_html, { ADD_TAGS: ['iframe'], ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'src'] }) : ''),
    [p],
  )

  if (p === null) return <NotFound />

  if (p === undefined)
    return (
      <div className="container project-hero">
        <div className="skeleton" style={{ height: 120, maxWidth: 700 }} />
        <div className="skeleton project-cover" />
      </div>
    )

  const facts = [
    ['Year', p.year],
    ['Role', p.role],
    ['Client', p.client],
    ['Type', p.tags?.join(', ')],
  ].filter(([, v]) => v)

  return (
    <article>
      <div className="container project-hero">
        <Link to="/#work" className="btn btn-ghost btn-sm" style={{ width: 'fit-content' }}>
          <ArrowLeft size={14} weight="bold" /> All work
        </Link>
        <div className="project-hero-head">
          <div style={{ display: 'grid', gap: 20 }}>
            <h1 className="display" style={{ fontSize: 'clamp(2.4rem, 6vw, 5.6rem)' }}>
              <SplitWords text={p.title} />
            </h1>
            {p.tagline && (
              <motion.p className="lede" initial={reduce ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.8 }}>
                {p.tagline}
              </motion.p>
            )}
          </div>
          {facts.length > 0 && (
            <motion.dl className="project-facts" initial={reduce ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8 }}>
              {facts.map(([k, v]) => (
                <div className="fact" key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </motion.dl>
          )}
        </div>

        {p.cover_url && (
          <motion.div
            className="project-cover"
            initial={reduce ? false : { clipPath: 'inset(0 0 100% 0)', scale: 1.04 }}
            animate={{ clipPath: 'inset(0 0 0% 0)', scale: 1 }}
            transition={{ duration: 1.2, delay: 0.25, ease: [0.76, 0, 0.24, 1] }}
          >
            <img src={p.cover_url} alt={p.title} fetchPriority="high" />
          </motion.div>
        )}
      </div>

      <div className="container project-body">
        <aside className="project-side">
          {p.summary && <p className="muted">{p.summary}</p>}
          {p.stack?.length > 0 && (
            <div className="skill-list">
              {p.stack.map((t) => (
                <span className="tag" key={t}>
                  {t}
                </span>
              ))}
            </div>
          )}
          <div className="project-links">
            {p.live_url && (
              <a className="btn btn-primary" href={p.live_url} target="_blank" rel="noreferrer">
                Visit site
                <span className="btn-icon">
                  <ArrowUpRight size={16} weight="bold" />
                </span>
              </a>
            )}
            {p.repo_url && (
              <a className="btn btn-ghost" href={p.repo_url} target="_blank" rel="noreferrer">
                <GithubLogo size={18} /> Source code
              </a>
            )}
          </div>
        </aside>

        <div>
          {html ? <Reveal className="prose" amount={0.05} y={20}><div dangerouslySetInnerHTML={{ __html: html }} /></Reveal> : null}
          {Array.isArray(p.gallery) && p.gallery.length > 0 && (
            <div className="gallery">
              {p.gallery.map((src, i) => (
                <ImageReveal
                  key={i}
                  amount={0.15}
                  src={typeof src === 'string' ? src : src.url}
                  alt={`${p.title} screenshot ${i + 1}`}
                  style={{ borderRadius: 'var(--r-img)', background: 'var(--surface)' }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {next && next.id !== p.id && (
        <div className="container project-next">
          <span className="muted">Next project</span>
          <Link to={`/work/${next.slug}`}>
            {next.title} <ArrowRight size={40} />
          </Link>
        </div>
      )}
      <div style={{ height: 'clamp(80px, 10vw, 140px)' }} />
    </article>
  )
}
