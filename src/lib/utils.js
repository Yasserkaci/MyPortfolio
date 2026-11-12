export const cx = (...a) => a.filter(Boolean).join(' ')

export function slugify(s = '') {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function deepMerge(base, patch) {
  if (Array.isArray(base) || Array.isArray(patch)) return patch === undefined ? base : patch
  if (typeof base !== 'object' || base === null) return patch === undefined ? base : patch
  if (typeof patch !== 'object' || patch === null) return base
  const out = { ...base }
  for (const k of Object.keys(patch)) out[k] = deepMerge(base[k], patch[k])
  return out
}

export function setPath(obj, path, value) {
  const keys = path.split('.')
  const clone = structuredClone(obj)
  let cur = clone
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i]
    if (cur[k] === undefined || cur[k] === null) cur[k] = /^\d+$/.test(keys[i + 1]) ? [] : {}
    cur = cur[k]
  }
  cur[keys.at(-1)] = value
  return clone
}

export function getPath(obj, path, fallback) {
  return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj) ?? fallback
}

export function hexToRgb(hex) {
  const h = hex.replace('#', '')
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

export function readableOn(hex) {
  try {
    const [r, g, b] = hexToRgb(hex)
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    return lum > 0.6 ? '#0b0b0d' : '#f7f5ee'
  } catch {
    return '#0b0b0d'
  }
}

export function formatDate(d) {
  return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

export const EASE = [0.16, 1, 0.3, 1]
