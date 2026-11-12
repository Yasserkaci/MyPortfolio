import { supabase } from './supabase'

export async function fetchProjects({ all = false } = {}) {
  let q = supabase
    .from('projects')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })
  if (!all) q = q.eq('published', true)
  const { data, error } = await q
  if (error) throw error
  return data
}

export async function fetchProject(slug) {
  const { data, error } = await supabase.from('projects').select('*').eq('slug', slug).maybeSingle()
  if (error) throw error
  return data
}

export async function fetchExperience({ all = false } = {}) {
  let q = supabase.from('experience').select('*').order('sort_order', { ascending: true })
  if (!all) q = q.eq('published', true)
  const { data, error } = await q
  if (error) throw error
  return data
}

export async function fetchSkills({ all = false } = {}) {
  let q = supabase.from('skills').select('*').order('sort_order', { ascending: true })
  if (!all) q = q.eq('published', true)
  const { data, error } = await q
  if (error) throw error
  return data
}

export async function sendMessage(payload) {
  const { error } = await supabase.from('messages').insert(payload)
  if (error) throw error
}
