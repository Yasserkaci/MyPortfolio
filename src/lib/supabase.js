import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !key) {
  console.warn('Supabase env vars missing. Copy .env.example to .env and fill them in.')
}

export const supabase = createClient(url, key, {
  auth: { persistSession: true, autoRefreshToken: true },
})

export const MEDIA_BUCKET = 'media'

export function publicUrl(path) {
  if (!path) return ''
  if (/^https?:\/\//.test(path)) return path
  return supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl
}

export async function uploadMedia(file, folder = 'uploads') {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'bin'
  const name = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(name, file, {
    cacheControl: '31536000',
    upsert: false,
    contentType: file.type,
  })
  if (error) throw error
  return publicUrl(name)
}
