import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { supabase } from './supabase'

const Ctx = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined)
  const [isAdmin, setIsAdmin] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s ?? null))
    return () => sub.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) {
      setIsAdmin(session === null ? false : null)
      return
    }
    let cancelled = false
    supabase.rpc('is_admin').then(({ data }) => {
      if (!cancelled) setIsAdmin(!!data)
    })
    return () => {
      cancelled = true
    }
  }, [session])

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      isAdmin,
      ready: session !== undefined && (session === null || isAdmin !== null),
      signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
      signOut: () => supabase.auth.signOut(),
      updatePassword: (password) => supabase.auth.updateUser({ password }),
    }),
    [session, isAdmin],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAuth() {
  return useContext(Ctx)
}

export function RequireAdmin({ children }) {
  const { ready, user, isAdmin } = useAuth()
  const loc = useLocation()
  if (!ready) return <div className="admin-loading">Checking session…</div>
  if (!user) return <Navigate to="/admin/login" state={{ from: loc.pathname }} replace />
  if (!isAdmin)
    return (
      <div className="admin-loading">
        <p>This account is signed in but is not on the admin allowlist.</p>
        <button className="btn btn-ghost" onClick={() => supabase.auth.signOut()}>
          Sign out
        </button>
      </div>
    )
  return children
}
