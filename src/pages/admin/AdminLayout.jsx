import { useEffect, useState } from 'react'
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom'
import { SquaresFour, Briefcase, Lightning, ChatCircleText, Sliders, UserCircle, ArrowSquareOut, SignOut, List, Stack } from '@phosphor-icons/react'
import { useAuth } from '../../lib/auth'
import { supabase } from '../../lib/supabase'
import { ToastProvider } from '../../components/admin/ui'
import '../../styles/admin.css'

export default function AdminLayout() {
  const { signOut, user } = useAuth()
  const [open, setOpen] = useState(false)
  const [unread, setUnread] = useState(0)
  const loc = useLocation()

  useEffect(() => setOpen(false), [loc.pathname])

  useEffect(() => {
    let alive = true
    const load = () =>
      supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('read', false)
        .then(({ count }) => alive && setUnread(count || 0))
    load()
    const ch = supabase
      .channel('messages-count')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, load)
      .subscribe()
    return () => {
      alive = false
      supabase.removeChannel(ch)
    }
  }, [loc.pathname])

  const items = [
    { to: '/admin', label: 'Overview', icon: SquaresFour, end: true },
    { to: '/admin/projects', label: 'Projects', icon: Briefcase },
    { to: '/admin/experience', label: 'Experience', icon: Stack },
    { to: '/admin/skills', label: 'Skills', icon: Lightning },
    { to: '/admin/messages', label: 'Messages', icon: ChatCircleText, badge: unread },
    { to: '/admin/settings', label: 'Site settings', icon: Sliders },
    { to: '/admin/account', label: 'Account', icon: UserCircle },
  ]

  return (
    <ToastProvider>
      <div className="admin">
        <aside className={`admin-side ${open ? 'open' : ''}`}>
          <div className="admin-brand">
            <div>
              Admin
              <br />
              <small>{user?.email}</small>
            </div>
          </div>
          <nav className="admin-nav">
            {items.map(({ to, label, icon: Icon, end, badge }) => (
              <NavLink to={to} end={end} key={to}>
                <Icon size={18} />
                {label}
                {badge > 0 && <span className="badge">{badge}</span>}
              </NavLink>
            ))}
          </nav>
          <div className="admin-side-foot">
            <Link to="/" className="btn btn-ghost btn-sm" target="_blank">
              <ArrowSquareOut size={16} /> View site
            </Link>
            <button className="btn btn-ghost btn-sm" onClick={signOut}>
              <SignOut size={16} /> Sign out
            </button>
          </div>
        </aside>
        <main className="admin-main">
          <button className="admin-burger" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu">
            <List size={20} />
          </button>
          <Outlet />
        </main>
      </div>
    </ToastProvider>
  )
}
