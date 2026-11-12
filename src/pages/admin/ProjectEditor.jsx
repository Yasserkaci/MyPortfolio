import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Plus, X, ArrowSquareOut } from '@phosphor-icons/react'
import { supabase, uploadMedia } from '../../lib/supabase'
import { slugify } from '../../lib/utils'
import { Field, Input, Textarea, Toggle, TagInput, ImageField, useToast } from '../../components/admin/ui'
import RichEditor from '../../components/admin/RichEditor'

const EMPTY = {
  title: '',
  slug: '',
  tagline: '',
  summary: '',
  content_html: '',
  cover_url: '',
  gallery: [],
  tags: [],
  stack: [],
  live_url: '',
  repo_url: '',
  year: String(new Date().getFullYear()),
  role: '',
  client: '',
  featured: false,
  published: true,
}

export default function ProjectEditor() {
  const { id } = useParams()
  const isNew = !id
  const nav = useNavigate()
  const toast = useToast()
  const [p, setP] = useState(isNew ? EMPTY : null)
  const [busy, setBusy] = useState(false)
  const [slugTouched, setSlugTouched] = useState(!isNew)
  const galleryInput = useRef(null)

  useEffect(() => {
    if (isNew) return
    supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (error) {
          toast(error.message, 'error')
          nav('/admin/projects')
        } else setP({ ...EMPTY, ...data, gallery: Array.isArray(data.gallery) ? data.gallery : [] })
      })
  }, [id, isNew, nav, toast])

  const set = (k) => (v) => {
    setP((prev) => {
      const next = { ...prev, [k]: v }
      if (k === 'title' && !slugTouched) next.slug = slugify(v)
      return next
    })
  }

  const save = async (e) => {
    e?.preventDefault()
    if (!p.title.trim()) return toast('Title is required', 'error')
    const slug = slugify(p.slug || p.title)
    if (!slug) return toast('Slug is required', 'error')
    setBusy(true)
    const payload = { ...p, slug }
    delete payload.id
    delete payload.created_at
    delete payload.updated_at
    let res
    if (isNew) {
      const { count } = await supabase.from('projects').select('id', { count: 'exact', head: true })
      res = await supabase.from('projects').insert({ ...payload, sort_order: count || 0 }).select().single()
    } else {
      res = await supabase.from('projects').update(payload).eq('id', id).select().single()
    }
    setBusy(false)
    if (res.error) return toast(res.error.code === '23505' ? 'That slug is already used by another project.' : res.error.message, 'error')
    toast('Saved')
    if (isNew) nav(`/admin/projects/${res.data.id}`, { replace: true })
    else setP({ ...EMPTY, ...res.data, gallery: Array.isArray(res.data.gallery) ? res.data.gallery : [] })
  }

  const addGallery = async (files) => {
    const list = [...files].filter((f) => f.type.startsWith('image/'))
    if (!list.length) return
    toast(`Uploading ${list.length} image${list.length > 1 ? 's' : ''}…`)
    try {
      const urls = await Promise.all(list.map((f) => uploadMedia(f, 'gallery')))
      setP((prev) => ({ ...prev, gallery: [...prev.gallery, ...urls] }))
      toast('Added to gallery')
    } catch (e) {
      toast(e.message, 'error')
    }
  }

  if (!p) return <div className="admin-loading">Loading project…</div>

  return (
    <form onSubmit={save}>
      <div className="admin-head">
        <div>
          <Link to="/admin/projects" className="muted" style={{ display: 'inline-flex', gap: 6, alignItems: 'center', fontSize: '0.9rem' }}>
            <ArrowLeft size={14} /> Projects
          </Link>
          <h1 style={{ marginTop: 8 }}>{isNew ? 'New project' : p.title || 'Untitled'}</h1>
        </div>
        <div className="admin-actions">
          {!isNew && p.published && (
            <a href={`/work/${p.slug}`} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
              <ArrowSquareOut size={16} /> View
            </a>
          )}
          <Toggle checked={p.published} onChange={set('published')} label={p.published ? 'Published' : 'Draft'} />
          <button className="btn btn-primary btn-sm" type="submit" disabled={busy}>
            {busy ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      <div className="grid-2" style={{ gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', alignItems: 'start' }}>
        <div>
          <div className="panel">
            <h2>Basics</h2>
            <div className="form">
              <Field label="Title" htmlFor="title">
                <Input id="title" value={p.title} onChange={set('title')} placeholder="Project name" />
              </Field>
              <Field label="Slug" hint={`Public URL: /work/${slugify(p.slug || p.title) || '…'}`} htmlFor="slug">
                <Input
                  id="slug"
                  value={p.slug}
                  onChange={(v) => {
                    setSlugTouched(true)
                    set('slug')(v)
                  }}
                />
              </Field>
              <Field label="Tagline" hint="One line under the title on cards and the project page." htmlFor="tagline">
                <Input id="tagline" value={p.tagline} onChange={set('tagline')} />
              </Field>
              <Field label="Summary" hint="Two or three sentences shown in the project sidebar." htmlFor="summary">
                <Textarea id="summary" value={p.summary} onChange={set('summary')} rows={3} />
              </Field>
            </div>
          </div>

          <div className="panel">
            <h2>Case study</h2>
            <RichEditor value={p.content_html} onChange={set('content_html')} />
            <p className="hint muted" style={{ marginTop: 10, fontSize: '0.82rem' }}>
              Drop or paste images straight into the editor. Use the toolbar for headings, quotes, links and video embeds.
            </p>
          </div>

          <div className="panel">
            <h2>Gallery</h2>
            <div
              className="gallery-admin"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                addGallery(e.dataTransfer.files)
              }}
            >
              {p.gallery.map((src, i) => (
                <div className="gallery-thumb" key={src + i}>
                  <img src={typeof src === 'string' ? src : src.url} alt="" />
                  <button type="button" aria-label="Remove image" onClick={() => set('gallery')(p.gallery.filter((_, j) => j !== i))}>
                    <X size={14} />
                  </button>
                </div>
              ))}
              <button type="button" className="gallery-add" onClick={() => galleryInput.current?.click()}>
                <Plus size={22} />
              </button>
              <input
                ref={galleryInput}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={(e) => {
                  addGallery(e.target.files)
                  e.target.value = ''
                }}
              />
            </div>
          </div>
        </div>

        <div>
          <div className="panel">
            <h2>Cover image</h2>
            <ImageField value={p.cover_url} onChange={set('cover_url')} folder="covers" label="cover" />
          </div>

          <div className="panel">
            <h2>Details</h2>
            <div className="form">
              <div className="grid-2">
                <Field label="Year" htmlFor="year">
                  <Input id="year" value={p.year} onChange={set('year')} />
                </Field>
                <Field label="Role" htmlFor="role">
                  <Input id="role" value={p.role} onChange={set('role')} placeholder="Full-stack developer" />
                </Field>
              </div>
              <Field label="Client" htmlFor="client">
                <Input id="client" value={p.client} onChange={set('client')} placeholder="Company, or Side project" />
              </Field>
              <Field label="Tags" hint="Shown on the card. Press Enter after each.">
                <TagInput value={p.tags} onChange={set('tags')} placeholder="E-commerce, SaaS…" />
              </Field>
              <Field label="Stack" hint="Technologies used.">
                <TagInput value={p.stack} onChange={set('stack')} placeholder="React, PostgreSQL…" />
              </Field>
              <Field label="Live URL" htmlFor="live">
                <Input id="live" value={p.live_url} onChange={set('live_url')} placeholder="https://" />
              </Field>
              <Field label="Repository URL" htmlFor="repo">
                <Input id="repo" value={p.repo_url} onChange={set('repo_url')} placeholder="https://github.com/…" />
              </Field>
              <Toggle checked={p.featured} onChange={set('featured')} label="Featured on homepage" />
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
