import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from '@phosphor-icons/react'
import { supabase } from '../../lib/supabase'
import { useSettings } from '../../lib/settings'

const count = (table, filter) => {
  let q = supabase.from(table).select('id', { count: 'exact', head: true })
  if (filter) q = filter(q)
  return q.then(({ count }) => count || 0)
}

export default function Dashboard() {
  const { settings } = useSettings()
  const [stats, setStats] = useState(null)
  const [recent, setRecent] = useState([])

  useEffect(() => {
    Promise.all([
      count('projects'),
      count('projects', (q) => q.eq('published', true)),
      count('experience'),
      count('skills'),
      count('messages', (q) => q.eq('read', false)),
    ]).then(([projects, published, experience, skills, unread]) => setStats({ projects, published, experience, skills, unread }))
    supabase
      .from('projects')
      .select('id,title,slug,updated_at,published,cover_url')
      .order('updated_at', { ascending: false })
      .limit(5)
      .then(({ data }) => setRecent(data || []))
  }, [])

  return (
    <>
      <div className="admin-head">
        <div>
          <h1>Hello, {settings.identity.name.split(' ')[0]}</h1>
          <p>Everything on the public site is editable from here.</p>
        </div>
        <div className="admin-actions">
          <Link to="/admin/projects/new" className="btn btn-primary btn-sm">
            <Plus size={16} weight="bold" /> New project
          </Link>
        </div>
      </div>

      <div className="stat-cards">
        {[
          ['Projects', stats?.projects, `${stats?.published ?? '–'} published`],
          ['Experience', stats?.experience, 'entries'],
          ['Skills', stats?.skills, 'listed'],
          ['Messages', stats?.unread, 'unread'],
        ].map(([l, v, sub]) => (
          <div className="stat-card" key={l}>
            <span>{l}</span>
            <b>{v ?? '–'}</b>
            <span>{sub}</span>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div className="panel">
          <h2>Recently edited</h2>
          <div className="list">
            {recent.map((p) => (
              <Link to={`/admin/projects/${p.id}`} className="row" key={p.id} style={{ gridTemplateColumns: 'auto 1fr auto' }}>
                {p.cover_url ? <img className="row-thumb" src={p.cover_url} alt="" /> : <div className="row-thumb" />}
                <div className="row-main">
                  <b>{p.title}</b>
                  <span>/work/{p.slug}</span>
                </div>
                <span className={`pill ${p.published ? 'ok' : ''}`}>{p.published ? 'Live' : 'Draft'}</span>
              </Link>
            ))}
            {recent.length === 0 && <div className="empty">No projects yet.</div>}
          </div>
        </div>
        <div className="panel">
          <h2>Quick links</h2>
          <div className="list">
            {[
              ['/admin/settings/identity', 'Change your name, role and email'],
              ['/admin/settings/hero', 'Edit the hero headline and image'],
              ['/admin/settings/theme', 'Pick accent color, fonts and corner style'],
              ['/admin/settings/sections', 'Reorder or hide homepage sections'],
              ['/admin/skills', 'Manage your stack'],
            ].map(([to, label]) => (
              <Link to={to} key={to} className="row" style={{ gridTemplateColumns: '1fr' }}>
                <div className="row-main">
                  <b>{label}</b>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
