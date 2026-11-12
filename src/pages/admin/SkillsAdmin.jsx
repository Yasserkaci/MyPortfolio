import { useEffect, useMemo, useState } from 'react'
import { Plus, Trash, Eye, EyeSlash, PencilSimple } from '@phosphor-icons/react'
import { supabase } from '../../lib/supabase'
import { fetchSkills } from '../../lib/data'
import { useSettings } from '../../lib/settings'
import { SortableList, ConfirmButton, Field, Input, Toggle, useToast } from '../../components/admin/ui'

const EMPTY = { name: '', category: 'Frontend', icon_slug: '', level: 4, published: true }

export default function SkillsAdmin() {
  const [items, setItems] = useState(null)
  const [edit, setEdit] = useState(null)
  const toast = useToast()
  const { settings } = useSettings()

  const load = () => fetchSkills({ all: true }).then(setItems).catch((e) => toast(e.message, 'error'))
  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const categories = useMemo(() => [...new Set((items || []).map((s) => s.category))], [items])

  const save = async (e) => {
    e.preventDefault()
    if (!edit.name.trim()) return toast('Name is required', 'error')
    const payload = { ...edit, icon_slug: edit.icon_slug.trim().toLowerCase() }
    delete payload.id
    const res = edit.id
      ? await supabase.from('skills').update(payload).eq('id', edit.id)
      : await supabase.from('skills').insert({ ...payload, sort_order: items.length })
    if (res.error) return toast(res.error.message, 'error')
    toast('Saved')
    setEdit(null)
    load()
  }

  const remove = async (id) => {
    const { error } = await supabase.from('skills').delete().eq('id', id)
    if (error) return toast(error.message, 'error')
    setItems((l) => l.filter((x) => x.id !== id))
  }

  const reorder = async (next) => {
    setItems(next)
    await Promise.all(next.map((x, i) => supabase.from('skills').update({ sort_order: i }).eq('id', x.id)))
    toast('Order saved')
  }

  const toggle = async (x) => {
    setItems((l) => l.map((i) => (i.id === x.id ? { ...i, published: !x.published } : i)))
    await supabase.from('skills').update({ published: !x.published }).eq('id', x.id)
  }

  const hex = settings.theme.fg.replace('#', '')

  return (
    <>
      <div className="admin-head">
        <div>
          <h1>Skills</h1>
          <p>Grouped by category on the homepage. Icons come from simpleicons.org slugs.</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setEdit({ ...EMPTY })}>
          <Plus size={16} weight="bold" /> Add skill
        </button>
      </div>

      {edit && (
        <form className="panel" onSubmit={save} style={{ marginBottom: 24 }}>
          <h2>{edit.id ? 'Edit skill' : 'New skill'}</h2>
          <div className="form">
            <div className="grid-3">
              <Field label="Name" htmlFor="s-name">
                <Input id="s-name" value={edit.name} onChange={(v) => setEdit({ ...edit, name: v })} placeholder="React" />
              </Field>
              <Field label="Category" htmlFor="s-cat" hint={categories.length ? `Existing: ${categories.join(', ')}` : ''}>
                <Input id="s-cat" value={edit.category} onChange={(v) => setEdit({ ...edit, category: v })} list="cats" />
                <datalist id="cats">
                  {categories.map((c) => (
                    <option value={c} key={c} />
                  ))}
                </datalist>
              </Field>
              <Field label="Icon slug" htmlFor="s-icon" hint="e.g. react, nodedotjs, postgresql. Leave empty for no icon.">
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <Input id="s-icon" value={edit.icon_slug} onChange={(v) => setEdit({ ...edit, icon_slug: v })} placeholder="react" />
                  {edit.icon_slug && <img src={`https://cdn.simpleicons.org/${edit.icon_slug.trim().toLowerCase()}/${hex}`} alt="" width={22} height={22} />}
                </div>
              </Field>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <Toggle checked={edit.published} onChange={(v) => setEdit({ ...edit, published: v })} label="Visible" />
              <span style={{ flex: 1 }} />
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEdit(null)}>
                Cancel
              </button>
              <button className="btn btn-primary btn-sm" type="submit">
                Save
              </button>
            </div>
          </div>
        </form>
      )}

      {items === null ? (
        <div className="skeleton" style={{ height: 200 }} />
      ) : items.length === 0 ? (
        <div className="empty">No skills yet.</div>
      ) : (
        <SortableList
          items={items}
          getId={(x) => x.id}
          onReorder={reorder}
          render={(x) => (
            <>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', minWidth: 0 }}>
                {x.icon_slug ? <img src={`https://cdn.simpleicons.org/${x.icon_slug}/${hex}`} alt="" width={20} height={20} /> : <span style={{ width: 20 }} />}
                <div className="row-main">
                  <b>{x.name}</b>
                  <span>{x.category}</span>
                </div>
              </div>
              <div className="row-actions">
                <button className="icon-btn" onClick={() => toggle(x)} title={x.published ? 'Hide' : 'Show'}>
                  {x.published ? <Eye size={18} /> : <EyeSlash size={18} />}
                </button>
                <button className="icon-btn" onClick={() => setEdit({ ...EMPTY, ...x })} title="Edit">
                  <PencilSimple size={18} />
                </button>
                <ConfirmButton onConfirm={() => remove(x.id)}>
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
