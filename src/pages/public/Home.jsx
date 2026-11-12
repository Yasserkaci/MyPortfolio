import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react'
import { ArrowDown, ArrowUpRight, PaperPlaneTilt } from '@phosphor-icons/react'
import { useSettings } from '../../lib/settings'
import { fetchProjects, fetchExperience, fetchSkills, sendMessage } from '../../lib/data'
import { Reveal, SplitWords, Magnetic, ImageReveal } from '../../components/motion'
import Marquee from '../../components/Marquee'
import ProjectCard from '../../components/ProjectCard'
import { useSmoothScroll } from '../../components/SmoothScroll'

/* ------------------------------------------------------------------ */
/* Hero: asymmetric split. Copy left, image right with scroll parallax. */
/* ------------------------------------------------------------------ */
function Hero({ s }) {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const { scrollTo } = useSmoothScroll()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const imgY = useTransform(scrollYProgress, [0, 1], ['-8%', '8%'])
  const copyY = useTransform(scrollYProgress, [0, 1], [0, 120])
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0])
  const { hero, identity } = s

  const go = (href) => (e) => {
    if (href?.startsWith('#')) {
      e.preventDefault()
      scrollTo(href)
    }
  }

  const status = identity.role || (identity.showAvailability && identity.availability)

  return (
    <section className="hero" ref={ref} id="top">
      <div className="container">
        <div className="hero-grid">
          <motion.div className="hero-copy" style={reduce ? undefined : { y: copyY, opacity: fade }}>
            {status && (
              <motion.div
                className="hero-status"
                initial={reduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
              >
                {identity.role && <b>{identity.role}</b>}
                {identity.showAvailability && identity.availability && (
                  <>
                    <i aria-hidden="true" />
                    {identity.availability}
                  </>
                )}
              </motion.div>
            )}
            <h1 className="display">
              <SplitWords text={hero.headline} emphasis={hero.emphasis} delay={0.15} />
            </h1>
            {hero.subtext && (
              <motion.p
                className="lede"
                initial={reduce ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.7 }}
              >
                {hero.subtext}
              </motion.p>
            )}
            <motion.div
              className="hero-ctas"
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.85 }}
            >
              {hero.primaryCta?.label && (
                <Magnetic>
                  <a className="btn btn-primary" href={hero.primaryCta.href} onClick={go(hero.primaryCta.href)}>
                    {hero.primaryCta.label}
                    <span className="btn-icon">
                      <ArrowDown size={16} weight="bold" />
                    </span>
                  </a>
                </Magnetic>
              )}
              {hero.secondaryCta?.label && (
                <Magnetic>
                  <a className="btn btn-ghost" href={hero.secondaryCta.href} onClick={go(hero.secondaryCta.href)}>
                    {hero.secondaryCta.label}
                  </a>
                </Magnetic>
              )}
            </motion.div>
          </motion.div>

          {hero.showImage && hero.imageUrl && (
            <motion.div
              className="hero-visual"
              initial={reduce ? false : { clipPath: 'inset(100% 0 0 0)' }}
              animate={{ clipPath: 'inset(0% 0 0 0)' }}
              transition={{ duration: 1.3, delay: 0.3, ease: [0.76, 0, 0.24, 1] }}
            >
              <motion.img
                src={hero.imageUrl}
                alt={hero.imageAlt || ''}
                style={reduce ? undefined : { y: imgY }}
                fetchPriority="high"
              />
            </motion.div>
          )}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
function Work({ s, projects, loading }) {
  const list = useMemo(() => {
    const feat = projects.filter((p) => p.featured)
    const rest = projects.filter((p) => !p.featured)
    return [...feat, ...rest]
  }, [projects])

  return (
    <section className="section" id="work">
      <div className="container">
        <div className="section-head">
          <Reveal>
            <h2 className="h2">{s.work.heading}</h2>
          </Reveal>
          {s.work.intro && (
            <Reveal delay={0.08}>
              <p className="lede">{s.work.intro}</p>
            </Reveal>
          )}
        </div>
        {loading ? (
          <div className="work-grid">
            {[0, 1, 2, 3].map((i) => (
              <div className="work-card" key={i}>
                <div className="skeleton work-media" />
              </div>
            ))}
          </div>
        ) : list.length === 0 ? (
          <div className="empty">No projects published yet. Add one from the admin panel.</div>
        ) : (
          <div className="work-grid">
            {list.map((p, i) => (
              <ProjectCard p={p} index={i} key={p.id} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
function SkillIcon({ slug, fg }) {
  const [ok, setOk] = useState(true)
  if (!slug || !ok) return null
  const hex = fg.replace('#', '')
  return <img src={`https://cdn.simpleicons.org/${slug}/${hex}`} alt="" width={16} height={16} onError={() => setOk(false)} loading="lazy" />
}

function About({ s, skills }) {
  const { about, identity, theme } = s
  const groups = useMemo(() => {
    const m = new Map()
    for (const sk of skills) {
      if (!m.has(sk.category)) m.set(sk.category, [])
      m.get(sk.category).push(sk)
    }
    return [...m.entries()]
  }, [skills])

  const stats = (about.stats || []).filter((st) => st.value)

  return (
    <section className="section" id="about">
      <div className="container">
        <div className="section-head">
          <Reveal>
            <h2 className="h2">{about.heading}</h2>
          </Reveal>
        </div>
        <div
          className="bento"
          onPointerMove={(e) => {
            const cell = e.target.closest?.('.cell')
            if (!cell) return
            const r = cell.getBoundingClientRect()
            cell.style.setProperty('--mx', `${e.clientX - r.left}px`)
            cell.style.setProperty('--my', `${e.clientY - r.top}px`)
          }}
        >
          {about.imageUrl && (
            <div className="cell cell-photo">
              <ImageReveal src={about.imageUrl} alt={identity.name} style={{ position: 'absolute', inset: 0 }} amount={0.2} />
            </div>
          )}
          <Reveal className="cell cell-text" delay={0.05} style={about.imageUrl ? undefined : { gridColumn: 'span 12' }}>
            <div>
              {(about.paragraphs || []).filter(Boolean).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            {identity.resumeUrl && (
              <a className="btn btn-ghost btn-sm" href={identity.resumeUrl} target="_blank" rel="noreferrer" style={{ width: 'fit-content' }}>
                Download CV
                <span className="btn-icon">
                  <ArrowUpRight size={14} weight="bold" />
                </span>
              </a>
            )}
          </Reveal>

          {stats.length > 0 && (
            <div className="cell-stats" style={{ gridColumn: about.imageUrl ? undefined : 'span 12', gridTemplateColumns: `repeat(${Math.min(stats.length, 3)}, 1fr)` }}>
              {stats.map((st, i) => (
                <Reveal key={i} delay={0.08 + i * 0.06} className={`cell cell-stat ${i === 0 ? 'accent' : ''}`}>
                  <div className="stat-value">{st.value}</div>
                  <div className="stat-label">{st.label}</div>
                </Reveal>
              ))}
            </div>
          )}

          {groups.length > 0 && (
            <Reveal className="cell cell-skills" delay={0.1} style={{ gridTemplateColumns: `repeat(${Math.min(groups.length, 3)}, 1fr)` }}>
              {groups.map(([cat, items]) => (
                <div className="skill-group" key={cat}>
                  <h4>{cat}</h4>
                  <div className="skill-list">
                    {items.map((sk) => (
                      <span className="skill" key={sk.id}>
                        <SkillIcon slug={sk.icon_slug} fg={theme.fg} />
                        {sk.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </Reveal>
          )}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
function Experience({ s, items }) {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 70%', 'end 60%'] })

  if (!items.length) return null

  return (
    <section className="section" id="experience">
      <div className="container">
        <div className="section-head">
          <Reveal>
            <h2 className="h2">{s.experience.heading}</h2>
          </Reveal>
          {s.experience.intro && (
            <Reveal delay={0.08}>
              <p className="lede">{s.experience.intro}</p>
            </Reveal>
          )}
        </div>
        <div className="timeline" ref={ref}>
          <div className="timeline-line" aria-hidden="true">
            <motion.i style={{ scaleY: reduce ? 1 : scrollYProgress }} />
          </div>
          {items.map((x, i) => (
            <Reveal as="article" className="xp" key={x.id} delay={i * 0.04} amount={0.3}>
              <div className="xp-period">
                {x.period_start}
                {x.period_end ? ` to ${x.period_end}` : ''}
                {x.location ? <><br />{x.location}</> : null}
              </div>
              <div className="xp-main">
                <h3>
                  {x.role} <span>at {x.url ? <a href={x.url} target="_blank" rel="noreferrer">{x.company}</a> : x.company}</span>
                </h3>
                {x.description && <p>{x.description}</p>}
                {x.highlights?.length > 0 && (
                  <ul className="xp-highlights">
                    {x.highlights.map((h) => (
                      <li className="tag" key={h}>
                        {h}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
function Contact({ s }) {
  const { contact, identity, socials } = s
  const [state, setState] = useState({ status: 'idle', error: '' })
  const [form, setForm] = useState({ name: '', email: '', body: '', website: '' })

  const submit = async (e) => {
    e.preventDefault()
    if (form.website) return // honeypot
    if (!form.name.trim() || !form.email.trim() || !form.body.trim()) {
      setState({ status: 'error', error: 'Please fill in your name, email and a message.' })
      return
    }
    setState({ status: 'sending', error: '' })
    try {
      await sendMessage({ name: form.name.trim(), email: form.email.trim(), body: form.body.trim() })
      setState({ status: 'sent', error: '' })
    } catch (err) {
      setState({ status: 'error', error: err.message || 'Something went wrong. Try emailing me directly.' })
    }
  }

  return (
    <section className="section" id="contact">
      <div className="container">
        <div className="contact-grid">
          <div>
            <Reveal>
              <h2 className="h2" style={{ marginBottom: 20 }}>
                {contact.heading}
              </h2>
            </Reveal>
            {contact.text && (
              <Reveal delay={0.08}>
                <p className="lede" style={{ marginBottom: 36 }}>
                  {contact.text}
                </p>
              </Reveal>
            )}
            <Reveal delay={0.14}>
              {identity.email && (
                <a className="contact-email" href={`mailto:${identity.email}`}>
                  {identity.email}
                </a>
              )}
              <div className="socials">
                {socials
                  .filter((so) => so.url)
                  .map((so) => (
                    <a className="btn btn-ghost btn-sm" key={so.label} href={so.url} target="_blank" rel="noreferrer">
                      {so.label}
                      <span className="btn-icon">
                        <ArrowUpRight size={14} weight="bold" />
                      </span>
                    </a>
                  ))}
                {identity.resumeUrl && (
                  <a className="btn btn-ghost btn-sm" href={identity.resumeUrl} target="_blank" rel="noreferrer">
                    CV
                  </a>
                )}
              </div>
            </Reveal>
          </div>

          {contact.showForm && (
            <Reveal delay={0.1} y={40}>
              {state.status === 'sent' ? (
                <div className="form-success">
                  <h3 className="h3" style={{ marginBottom: 8 }}>
                    Sent.
                  </h3>
                  <p className="muted">{contact.successText}</p>
                </div>
              ) : (
                <form className="form" onSubmit={submit} noValidate>
                  <div className="form-row">
                    <div className="field">
                      <label htmlFor="c-name">Name</label>
                      <input id="c-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" />
                    </div>
                    <div className="field">
                      <label htmlFor="c-email">Email</label>
                      <input id="c-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" />
                    </div>
                  </div>
                  <div className="field">
                    <label htmlFor="c-body">Message</label>
                    <textarea id="c-body" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
                    {state.status === 'error' && <span className="error">{state.error}</span>}
                  </div>
                  <input
                    tabIndex={-1}
                    autoComplete="off"
                    className="sr-only"
                    value={form.website}
                    onChange={(e) => setForm({ ...form, website: e.target.value })}
                    aria-hidden="true"
                  />
                  <Magnetic strength={0.2}>
                    <button className="btn btn-primary" type="submit" disabled={state.status === 'sending'}>
                      {state.status === 'sending' ? 'Sending…' : contact.buttonLabel}
                      <span className="btn-icon">
                        <PaperPlaneTilt size={16} weight="bold" />
                      </span>
                    </button>
                  </Magnetic>
                </form>
              )}
            </Reveal>
          )}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
export default function Home() {
  const { settings: s } = useSettings()
  const [projects, setProjects] = useState([])
  const [experience, setExperience] = useState([])
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    Promise.all([fetchProjects(), fetchExperience(), fetchSkills()])
      .then(([p, e, k]) => {
        if (!alive) return
        setProjects(p)
        setExperience(e)
        setSkills(k)
      })
      .catch(console.error)
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [])

  const enabled = (id) => s.sections.find((x) => x.id === id)?.enabled !== false

  const render = {
    hero: () => <Hero s={s} key="hero" />,
    marquee: () => (s.marquee.enabled && s.marquee.items?.length ? <Marquee items={s.marquee.items} key="marquee" /> : null),
    work: () => <Work s={s} projects={projects} loading={loading} key="work" />,
    about: () => <About s={s} skills={skills} key="about" />,
    experience: () => <Experience s={s} items={experience} key="experience" />,
    contact: () => <Contact s={s} key="contact" />,
  }

  return <>{s.sections.filter((sec) => enabled(sec.id) && render[sec.id]).map((sec) => render[sec.id]())}</>
}
