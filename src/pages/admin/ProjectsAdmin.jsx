import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, PencilSimple, Trash, Star, Eye, EyeSlash } from '@phosphor-icons/react'
import { supabase } from '../../lib/supabase'
import { fetchProjects } from '../../lib/data'
import { SortableList, ConfirmButton, useToast } from '../../components/admin/ui'

export default function ProjectsAdmin() {
  const [items, setItems] = useState(null)
  const toast = useToast()

  const load = () => fetchProjects({ all: true }).then(setItems).catch((e) => toast(e.message, 'error'))
  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const patch = async (id, fields) => {
    setItems((l) => l.map((p) => (p.id === id ? { ...p, ...fields } : p)))
    const { error } = await supabase.from('projects').update(fields).eq('id', id)
    if (error) {
      toast(error.message, 'error')
      load()
    }
  }

  const reorder = async (next) => {
    setItems(next)
    const updates = next.map((p, i) => supabase.from('projects').update({ sort_order: i }).eq('id', p.id))
    const res = await Promise.all(updates)
    if (res.some((r) => r.error)) toast('Could not save order', 'error')
    else toast('Order saved')
  }

  const remove = async (id) => {
    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (error) return toast(error.message, 'error')
    setItems((l) => l.filter((p) => p.id !== id))
    toast('Project deleted')
  }

  return (
    <>
      <div className="admin-head">
        <div>
          <h1>Projects</h1>
          <p>Drag to reorder. Featured projects appear first on the homepage.</p>
        </div>
        <Link to="/admin/projects/new" className="btn btn-primary btn-sm">
          <Plus size={16} weight="bold" /> New project
        </Link>
      </div>

      {items === null ? (
        <div className="list">
          {[0, 1, 2].map((i) => (
            <div className="skeleton" key={i} style={{ height: 70 }} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="empty">
          No projects yet. <Link to="/admin/projects/new">Create your first one.</Link>
        </div>
      ) : (
        <SortableList
          items={items}
          getId={(p) => p.id}
          onReorder={reorder}
          render={(p) => (
            <>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center', minWidth: 0 }}>
                {p.cover_url ? <img className="row-thumb" src={p.cover_url} alt="" /> : <div className="row-thumb" />}
                <div className="row-main">
                  <b>{p.title}</b>
                  <span>
                    {p.year ? `${p.year}  ` : ''}
                    {p.tagline}
                  </span>
                </div>
              </div>
              <div className="row-actions">
                <span className={`pill ${p.published ? 'ok' : ''}`}>{p.published ? 'Live' : 'Draft'}</span>
                <button className={`icon-btn ${p.featured ? 'on' : ''}`} title="Featured" onClick={() => patch(p.id, { featured: !p.featured })}>
                  <Star size={18} weight={p.featured ? 'fill' : 'regular'} />
                </button>
                <button className="icon-btn" title={p.published ? 'Unpublish' : 'Publish'} onClick={() => patch(p.id, { published: !p.published })}>
                  {p.published ? <Eye size={18} /> : <EyeSlash size={18} />}
                </button>
                <Link to={`/admin/projects/${p.id}`} className="icon-btn" title="Edit">
                  <PencilSimple size={18} />
                </Link>
                <ConfirmButton onConfirm={() => remove(p.id)}>
                  <Trash size={18} />
                </ConfirmButton>
              </div>
            </>
          )}
        />
      )}
    </>
  )
}
