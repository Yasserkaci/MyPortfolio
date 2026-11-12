import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { supabase } from './supabase'
import { DEFAULT_SETTINGS, FONTS, RADII } from './defaults'
import { deepMerge, hexToRgb, readableOn } from './utils'

const Ctx = createContext(null)

export function applyTheme(theme) {
  const root = document.documentElement
  const t = deepMerge(DEFAULT_SETTINGS.theme, theme || {})
  const [ar, ag, ab] = hexToRgb(t.accent)
  const [fr, fg, fb] = hexToRgb(t.fg)
  root.style.setProperty('--accent', t.accent)
  root.style.setProperty('--accent-rgb', `${ar} ${ag} ${ab}`)
  root.style.setProperty('--on-accent', readableOn(t.accent))
  root.style.setProperty('--bg', t.bg)
  root.style.setProperty('--surface', t.surface)
  root.style.setProperty('--fg', t.fg)
  root.style.setProperty('--fg-rgb', `${fr} ${fg} ${fb}`)
  root.style.setProperty('--muted', t.muted)
  root.style.setProperty('--font-sans', (FONTS[t.font] || FONTS.geist).stack)
  const r = RADII[t.radius] || RADII.soft
  root.style.setProperty('--r-card', r.card)
  root.style.setProperty('--r-btn', r.button)
  root.style.setProperty('--r-input', r.input)
  root.style.setProperty('--r-img', r.image)
  root.dataset.grain = t.grain ? 'on' : 'off'
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', t.bg)
}

export function SettingsProvider({ children }) {
  const [raw, setRaw] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('site_settings').select('data').eq('id', 1).maybeSingle()
    if (error) setError(error)
    setRaw(data?.data || {})
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const settings = useMemo(() => deepMerge(DEFAULT_SETTINGS, raw || {}), [raw])

  useEffect(() => {
    applyTheme(settings.theme)
    document.title = settings.seo?.title || settings.identity.name
    const d = document.querySelector('meta[name="description"]')
    if (d) d.setAttribute('content', settings.seo?.description || '')
  }, [settings])

  const save = useCallback(async (next) => {
    const { error } = await supabase.from('site_settings').upsert({ id: 1, data: next })
    if (error) throw error
    setRaw(next)
  }, [])

  const value = useMemo(
    () => ({ settings, raw, loading, error, save, reload: load }),
    [settings, raw, loading, error, save, load],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useSettings() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useSettings outside provider')
  return v
}
